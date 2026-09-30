#!/usr/bin/env python3
"""Image pipeline for memoryphotoandvideo.com.

Delivery images are WebP files: assets/gallery/<file>.webp (long edge <= 1600 px, used by the lightbox,
structured data and the image sitemap), <file>-800.webp and <file>-480.webp (responsive tiles), and
assets/hero/*.webp. The JPG originals are kept in _originals/ (git-ignored) under the path they had
in the repository. image-seo.csv is the single source of truth for the names, titles, alt text and,
once known, the city of every gallery photo; image-rename-map.csv lists old -> new file paths.

  python3 scripts/image_tools.py optimize          build the WebP files from the originals
  python3 scripts/image_tools.py locate CITIES.csv [--dry-run]
                                                   record where photos were taken (columns: file,city[,place,place_en,event])
                                                   and rename them svatba-kardzhali-01, ... ; rewrites every reference
  python3 scripts/image_tools.py rename NEW.csv    rename photos (columns: file,new_file) and rewrite every reference
  python3 scripts/image_tools.py markup            refresh alt text, width/height and srcset widths in the pages
  python3 scripts/image_tools.py gallery           regenerate the portfolio tiles and ImageGallery JSON-LD
  python3 scripts/image_tools.py check             report missing files, oversized files, missing alt text or sizes

Requires Pillow. Run from anywhere; paths are resolved from the repository root.
"""
import argparse
import csv
import io
import json
import posixpath
import re
import subprocess
import sys
from collections import Counter
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = 'https://memoryphotoandvideo.com'
GALLERY = 'assets/gallery'
SEO_CSV = ROOT / 'image-seo.csv'
MAP_CSV = ROOT / 'image-rename-map.csv'
ORIGINALS = ROOT / '_originals'
SEO_FIELDS = ['file', 'original', 'title_bg', 'alt_bg', 'alt_en', 'city', 'city_en', 'place', 'place_en', 'width', 'height']
MAP_FIELDS = ['old_path', 'new_path', 'kind']

# (file suffix, size, WebP quality, how the size is applied)
TIERS = (('', 1600, 82, 'edge'), ('-800', 800, 82, 'width'), ('-480', 480, 80, 'width'))
MAX_FULL_BYTES = 400 * 1024
# (original, new file, width, quality) - single images: the wide team/brand image (CSS background and city pages) and the DJ partner portrait
EXTRAS = (
    ('hero.jpg', 'assets/hero/svatben-fotograf-memory-1920.webp', 1920, 82),
    ('hero.jpg', 'assets/hero/svatben-fotograf-memory-1200.webp', 1200, 80),
    ('dj-peppystar.jpg', 'assets/partners/dj-peppystar.webp', 800, 82),
)
BATCH_SIZE = 48
GALLERY_SIZES = '(max-width: 620px) 50vw, (max-width: 900px) 33vw, 300px'
BUSINESS_ID = HOST + '/#business'

SKIP_DIRS = {'.git', '_originals', 'node_modules', '__pycache__', 'archive', 'portfolio_next', 'portfolio_next_mobile'}
TEXT_SUFFIXES = {'.html', '.css', '.js', '.xml', '.yml', '.yaml', '.py', '.json', '.txt', '.md', '.webmanifest'}

CITY_EN = {'Кърджали': 'Kardzhali', 'Пловдив': 'Plovdiv', 'Хасково': 'Haskovo', 'Смолян': 'Smolyan'}
_TRANSLIT = dict(zip('абвгдезийклмнопрстуфхъьюя', 'a b v g d e z i y k l m n o p r s t u f h a y yu ya'.split()))
_TRANSLIT.update({'ж': 'zh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht'})


# --------------------------------------------------------------------------- helpers
def read_csv(path):
    with open(path, newline='', encoding='utf-8-sig') as handle:
        return list(csv.DictReader(handle))


def read_seo():
    """image-seo.csv rows, with every column present."""
    return [{field: row.get(field, '') for field in SEO_FIELDS} for row in read_csv(SEO_CSV)]


def write_csv(path, fields, rows):
    with open(path, 'w', newline='', encoding='utf-8-sig') as handle:
        writer = csv.DictWriter(handle, fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def tracked_text_files(include_en=True):
    """Text files of the site (not the archives or originals)."""
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts) or rel.name.startswith('.') and rel.parts[0] != '.github':
            continue
        if not include_en and rel.parts[0] == 'en':
            continue
        if rel.as_posix() == 'scripts/image_tools.py':
            continue  # names the JPG originals on purpose
        yield path


def html_files(include_en=False):
    return [p for p in tracked_text_files(include_en) if p.suffix == '.html' and p.name != 'header.html']


def page_base_dir(rel, text):
    """Directory relative URLs of a page resolve against (the site root when the page sets <base href="/">)."""
    if re.search(r'<base\s+href=["\']/["\']', text):
        return ''
    return '' if rel.parent.as_posix() == '.' else rel.parent.as_posix()


def load_image(path):
    from PIL import Image, ImageCms, ImageOps
    image = ImageOps.exif_transpose(Image.open(path))
    profile = image.info.get('icc_profile')
    if profile:
        try:
            source = ImageCms.ImageCmsProfile(io.BytesIO(profile))
            if 'srgb' not in ImageCms.getProfileDescription(source).lower():
                image = ImageCms.profileToProfile(image.convert('RGB'), source, ImageCms.createProfile('sRGB'), outputMode='RGB')
        except (ImageCms.PyCMSError, OSError):
            pass
    return image.convert('RGB')


def save_webp(image, target, quality, limit=None):
    target.parent.mkdir(parents=True, exist_ok=True)
    while True:
        image.save(target, 'WEBP', quality=quality, method=6)
        if not limit or target.stat().st_size <= limit or quality <= 60:
            return quality
        quality -= 4


def resized(image, size, mode):
    from PIL import Image
    width, height = image.size
    if mode == 'edge':
        scale = min(1.0, size / max(width, height))
    else:
        scale = min(1.0, size / width)
    if scale >= 1.0:
        return image
    return image.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.Resampling.LANCZOS)


def source_for(original):
    for base in (ORIGINALS, ROOT):
        candidate = base / original
        if candidate.is_file():
            return candidate
    raise SystemExit(f'Original not found: {original} (looked in _originals/ and the repository)')


def image_size(rel_path, _cache={}):
    """(width, height) of a published image file, or None when it does not exist."""
    if rel_path not in _cache:
        target = ROOT / rel_path
        if not target.is_file():
            _cache[rel_path] = None
        else:
            from PIL import Image
            with Image.open(target) as image:
                _cache[rel_path] = image.size
    return _cache[rel_path]


def base_name(rel_path):
    """assets/gallery/svatba-014-800.webp -> svatba-014."""
    stem = posixpath.splitext(posixpath.basename(rel_path))[0]
    return re.sub(r'-(800|480)$', '', stem)


# --------------------------------------------------------------------------- optimize
def cmd_optimize(args):
    rows = read_seo()
    total = 0
    for row in rows:
        image = load_image(source_for(row['original']))
        for suffix, size, quality, mode in TIERS:
            target = ROOT / GALLERY / f"{row['file']}{suffix}.webp"
            variant = resized(image, size, mode)
            used = save_webp(variant, target, quality, MAX_FULL_BYTES if suffix == '' else None)
            total += target.stat().st_size
            if suffix == '':
                row['width'], row['height'] = variant.size
                if used != quality:
                    print(f"{target.name}: quality lowered to {used} to stay under {MAX_FULL_BYTES // 1024} KB")
    write_csv(SEO_CSV, SEO_FIELDS, rows)
    for original, target_rel, width, quality in EXTRAS:
        image = resized(load_image(source_for(original)), width, 'width')
        save_webp(image, ROOT / target_rel, quality)
        total += (ROOT / target_rel).stat().st_size
    print(f'Wrote {len(rows)} photos x {len(TIERS)} sizes + {len(EXTRAS)} other images ({total / 1e6:.1f} MB).')


# --------------------------------------------------------------------------- references
TOKEN = re.compile(
    r'(?<![A-Za-z0-9_\-.~%/:])'
    r'((?:https?://(?:www\.)?memoryphotoandvideo\.com)?(?:\.{1,2}/)*/?(?:[A-Za-z0-9_\-.]+/)*[A-Za-z0-9_\-.]+\.(?:jpe?g|png|webp|gif))'
    r'(?![A-Za-z0-9_\-])'
)


def resolve_token(token, base_dir):
    """Root-relative path of an image reference found in a file living in base_dir."""
    if token.startswith('http'):
        return token.split('memoryphotoandvideo.com', 1)[1].lstrip('/')
    if token.startswith('/'):
        return token.lstrip('/')
    return posixpath.normpath(posixpath.join(base_dir, token))


def express_token(token, new_path, base_dir):
    if token.startswith('http'):
        return token.split('memoryphotoandvideo.com', 1)[0] + 'memoryphotoandvideo.com/' + new_path
    if token.startswith('/'):
        return '/' + new_path
    return posixpath.relpath(new_path, base_dir or '.')


def rewrite_file(path, mapping):
    rel = path.relative_to(ROOT)
    text = path.read_text(encoding='utf-8')
    if rel.suffix == '.html':
        base_dir = page_base_dir(rel, text)
    else:
        base_dir = '' if rel.suffix != '.css' or rel.parent.as_posix() == '.' else rel.parent.as_posix()

    def swap(match):
        token = match.group(1)
        new_path = mapping.get(resolve_token(token, base_dir))
        return express_token(token, new_path, base_dir) if new_path else token

    updated = TOKEN.sub(swap, text)
    if updated != text:
        path.write_text(updated, encoding='utf-8')
        return True
    return False


def rewrite_references(mapping, verbose=True):
    changed = [p for p in tracked_text_files() if rewrite_file(p, mapping)]
    if verbose:
        print(f'Rewrote image references in {len(changed)} files.')
    return changed


# --------------------------------------------------------------------------- rename
def translit(text):
    """Bulgarian -> Latin (streamlined system): Кърджали -> kardzhali."""
    return ''.join(_TRANSLIT.get(char, char) for char in text.lower())


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', translit(text)).strip('-')


def cmd_rename(args):
    pairs = [(r['file'].strip(), r['new_file'].strip()) for r in read_csv(args.csv) if r.get('new_file', '').strip()]
    apply_renames([(old, new) for old, new in pairs if old != new])


def apply_renames(pairs):
    seo = read_seo()
    by_file = {row['file']: row for row in seo}
    if not pairs:
        print('Nothing to rename.')
        return
    targets = [new for _, new in pairs]
    if len(set(targets)) != len(targets):
        raise SystemExit('Duplicate new names in the rename file.')
    untouched = set(by_file) - {old for old, _ in pairs}
    for old, new in pairs:
        if old not in by_file:
            raise SystemExit(f'Unknown photo: {old}')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', new):
            raise SystemExit(f'Use lowercase latin letters, digits and hyphens only: {new}')
        if new in untouched:
            raise SystemExit(f'{new} already exists')
    mapping = {}
    for old, new in pairs:
        for suffix, *_ in TIERS:
            mapping[f'{GALLERY}/{old}{suffix}.webp'] = f'{GALLERY}/{new}{suffix}.webp'
    # Two steps so that names can be swapped or shifted without overwriting anything.
    staged = []
    for index, (old_rel, new_rel) in enumerate(mapping.items()):
        temp = ROOT / GALLERY / f'.rename-{index}.tmp'
        (ROOT / old_rel).rename(temp)
        staged.append((temp, ROOT / new_rel))
    for temp, target in staged:
        temp.rename(target)
    for old, new in pairs:
        by_file[old]['file'] = new
    write_csv(SEO_CSV, SEO_FIELDS, seo)
    history = read_csv(MAP_CSV) if MAP_CSV.exists() else []
    for row in history:
        if row['new_path'] in mapping:
            row['new_path'] = mapping[row['new_path']]
    write_csv(MAP_CSV, MAP_FIELDS, history)
    rewrite_references(mapping)
    cmd_markup()
    if '<!-- gallery:start -->' in (ROOT / 'portfolio.html').read_text(encoding='utf-8'):
        cmd_gallery()
    print(f'Renamed {len(pairs)} photos.')


def cmd_locate(args):
    """Record the city (and place) of photos and give them place names: svatba-kardzhali-01, krashtene-plovdiv-02, ..."""
    updates = {row['file'].strip(): row for row in read_csv(args.csv) if row.get('file', '').strip() and row.get('city', '').strip()}
    seo = read_seo()
    known = {row['file'] for row in seo}
    for name in updates:
        if name not in known:
            raise SystemExit(f'Unknown photo in {args.csv}: {name}')
    taken = Counter()
    for row in seo:  # continue the numbering of photos that already have a place name
        match = re.fullmatch(r'([a-z]+)-([a-z0-9-]+?)-(\d+)', row['file'])
        if match and row['city']:
            taken[(match.group(1), match.group(2))] = max(taken[(match.group(1), match.group(2))], int(match.group(3)))
    pairs = []
    for row in seo:
        update = updates.get(row['file'])
        if not update:
            continue
        city = update['city'].strip()
        event = (update.get('event') or 'svatba').strip() or 'svatba'
        slug = slugify(city)
        taken[(event, slug)] += 1
        new = f'{event}-{slug}-{taken[(event, slug)]:02d}'
        pairs.append((row['file'], new))
        print(f"{row['file']} -> {new}  ({city}{', ' + update['place'].strip() if update.get('place', '').strip() else ''})")
        if not args.dry_run:
            row['city'] = city
            row['city_en'] = CITY_EN.get(city) or translit(city).title()
            row['place'] = (update.get('place') or '').strip()
            row['place_en'] = (update.get('place_en') or '').strip()
    if args.dry_run:
        print('Dry run: nothing changed.')
        return
    write_csv(SEO_CSV, SEO_FIELDS, seo)
    apply_renames([(old, new) for old, new in pairs if old != new])
    cmd_gallery()  # structured data lists the places
    subprocess.run([sys.executable, str(ROOT / 'scripts' / 'build_sitemap.py')], cwd=ROOT, check=True)
    print('Done. Commit the changes; the English pages are rebuilt by the workflow.')


# --------------------------------------------------------------------------- markup
SRCSET_ATTR = re.compile(r'(\bsrcset=)(["\'])(.*?)\2', re.S)
IMG_TAG = re.compile(r'<img\b[^>]*>', re.I | re.S)


def local_path(value, base_dir):
    value = value.strip()
    if not value or value.startswith(('data:', 'blob:', '#')):
        return None
    if value.startswith('http'):
        if 'memoryphotoandvideo.com' not in value.split('/')[2]:
            return None
        return value.split('memoryphotoandvideo.com', 1)[1].split('?')[0].lstrip('/')
    value = value.split('?')[0]
    return value.lstrip('/') if value.startswith('/') else posixpath.normpath(posixpath.join(base_dir, value))


def get_attr(tag, name):
    match = re.search(r'\s%s=(?:"([^"]*)"|\'([^\']*)\')' % name, tag)
    return None if not match else (match.group(1) if match.group(1) is not None else match.group(2))


def set_attr(tag, name, value):
    pattern = re.compile(r'(\s%s=)(?:"[^"]*"|\'[^\']*\')' % name)
    if pattern.search(tag):
        return pattern.sub(lambda m: f'{m.group(1)}"{value}"', tag, count=1)
    return re.sub(r'(<img\b[^>]*?)(\s*/?>)$', lambda m: f'{m.group(1)} {name}="{value}"{m.group(2)}', tag, count=1)


def cmd_markup(args=None):
    """Alt text from image-seo.csv; width/height of the src file; srcset width descriptors."""
    alts = {row['file']: row['alt_bg'] for row in read_seo()}
    changed = 0
    for path in html_files(include_en=False):
        rel = path.relative_to(ROOT)
        text = path.read_text(encoding='utf-8')
        base_dir = page_base_dir(rel, text)

        def fix_srcset(match):
            if 'data:' in match.group(3):
                return match.group(0)
            parts = []
            for candidate in match.group(3).split(','):
                bits = candidate.split()
                if not bits:
                    continue
                target = local_path(bits[0], base_dir)
                size = image_size(target) if target and target.endswith('.webp') else None
                if size and len(bits) > 1 and bits[1].endswith('w'):
                    bits[1] = f'{size[0]}w'
                parts.append(' '.join(bits))
            return f'{match.group(1)}{match.group(2)}{", ".join(parts)}{match.group(2)}'

        def fix_img(match):
            tag = match.group(0)
            source = get_attr(tag, 'src')
            target = local_path(source, base_dir) if source else None
            if not target or not target.endswith('.webp') or not target.startswith(('assets/gallery/', 'assets/hero/')):
                return tag
            size = image_size(target)
            if size:
                tag = set_attr(tag, 'width', size[0])
                tag = set_attr(tag, 'height', size[1])
            name = base_name(target)
            if name in alts:
                tag = set_attr(tag, 'alt', escape(alts[name], quote=True))
            return tag

        updated = SRCSET_ATTR.sub(fix_srcset, text)
        updated = IMG_TAG.sub(fix_img, updated)
        if updated != text:
            path.write_text(updated, encoding='utf-8')
            changed += 1
    print(f'Refreshed alt text, sizes and srcset widths in {changed} pages.')


# --------------------------------------------------------------------------- gallery
def tile_html(index, row, hidden):
    name = row['file']
    alt = escape(row['alt_bg'], quote=True)
    small = image_size(f'{GALLERY}/{name}-800.webp') or (800, 1200)
    full_width = image_size(f'{GALLERY}/{name}.webp')[0]
    hidden_attr = ' hidden' if hidden else ''
    return (
        f'          <button type="button" class="gallery-item"{hidden_attr} data-image="{GALLERY}/{name}.webp" aria-label="Отворете снимка {index}">'
        f'<img src="{GALLERY}/{name}-800.webp" srcset="{GALLERY}/{name}-480.webp 480w, {GALLERY}/{name}-800.webp 800w, {GALLERY}/{name}.webp {full_width}w" '
        f'sizes="{GALLERY_SIZES}" width="{small[0]}" height="{small[1]}" alt="{alt}" loading="lazy" decoding="async">'
        f'<span class="gallery-tag" aria-hidden="true">Memory</span></button>'
    )


def gallery_schema(rows):
    parts = []
    for row in rows:
        node = {
            '@type': 'ImageObject',
            'name': row['title_bg'],
            'caption': row['alt_bg'],
            'contentUrl': f"{HOST}/{GALLERY}/{row['file']}.webp",
            'creator': {'@id': BUSINESS_ID},
        }
        if row.get('city'):
            node['contentLocation'] = {'@type': 'Place', 'name': row.get('place') or row['city']}
        parts.append(node)
    return parts


def cmd_gallery(args=None):
    rows = read_seo()
    path = ROOT / 'portfolio.html'
    text = path.read_text(encoding='utf-8')
    start, end = '<!-- gallery:start -->', '<!-- gallery:end -->'
    if start not in text or end not in text:
        raise SystemExit('portfolio.html has no gallery markers')
    batches = []
    for offset in range(0, len(rows), BATCH_SIZE):
        chunk = rows[offset:offset + BATCH_SIZE]
        tiles = '\n'.join(tile_html(offset + i + 1, row, offset > 0) for i, row in enumerate(chunk))
        batches.append(f'          <div class="gallery-batch">\n{tiles}\n          </div>')
    head, rest = text.split(start, 1)
    _, tail = rest.split(end, 1)
    text = f'{head}{start}\n' + '\n'.join(batches) + f'\n          {end}{tail}'
    print(f'Wrote {len(rows)} gallery tiles in {len(batches)} batches to portfolio.html.')
    # The ImageGallery record lists the same photos; only its associatedMedia is generated.
    schema = re.search(r'(<!-- gallery-schema:start -->\s*<script type="application/ld\+json">)(.*?)(</script>\s*<!-- gallery-schema:end -->)', text, re.S)
    if schema:
        data = json.loads(schema.group(2))
        gallery = next(node for node in data['@graph'] if node.get('@type') == 'ImageGallery')
        gallery['associatedMedia'] = gallery_schema(rows)
        block = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
        text = text[:schema.start(2)] + block + text[schema.end(2):]
        print('Refreshed the ImageGallery structured data.')
    path.write_text(text, encoding='utf-8')


# --------------------------------------------------------------------------- check
def cmd_check(args=None):
    problems = 0
    rows = read_seo()
    names = set()
    for row in rows:
        names.add(row['file'])
        for suffix, *_ in TIERS:
            if not (ROOT / GALLERY / f"{row['file']}{suffix}.webp").is_file():
                print(f"missing file: {GALLERY}/{row['file']}{suffix}.webp")
                problems += 1
        full = ROOT / GALLERY / f"{row['file']}.webp"
        if full.is_file() and full.stat().st_size > MAX_FULL_BYTES:
            print(f'over {MAX_FULL_BYTES // 1024} KB: {full.name} ({full.stat().st_size // 1024} KB)')
            problems += 1
        for field in ('title_bg', 'alt_bg', 'alt_en'):
            if not row[field].strip():
                print(f"{row['file']}: empty {field}")
                problems += 1
        if len(row['alt_bg']) > 125:
            print(f"{row['file']}: alt text longer than 125 characters")
            problems += 1
    if len({row['alt_bg'] for row in rows}) != len(rows):
        print('duplicate alt text in image-seo.csv')
        problems += 1
    for path in html_files(include_en=True):
        rel = path.relative_to(ROOT)
        text = path.read_text(encoding='utf-8')
        base_dir = page_base_dir(rel, text)
        for tag in IMG_TAG.findall(text):
            if get_attr(tag, 'id') == 'lightboxImage':
                continue  # UI element that the gallery script fills when a photo is opened
            source = get_attr(tag, 'src') or ''
            target = local_path(source, base_dir) if source else None
            if source.startswith('data:'):
                print(f'{rel}: <img> with a placeholder data: src')
                problems += 1
            elif target and not (ROOT / target).is_file():
                print(f'{rel}: missing image {source}')
                problems += 1
            if get_attr(tag, 'alt') is None:
                print(f'{rel}: <img> without alt: {source}')
                problems += 1
            elif not get_attr(tag, 'alt').strip() and target and target.startswith(('assets/gallery/', 'assets/hero/')):
                print(f'{rel}: empty alt on a content image: {source}')
                problems += 1
            if (get_attr(tag, 'width') is None or get_attr(tag, 'height') is None) and not source.startswith('data:'):
                print(f'{rel}: <img> without width/height: {source}')
                problems += 1
    print('OK' if not problems else f'{problems} problem(s)')
    return 1 if problems else 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('optimize')
    locate = sub.add_parser('locate')
    locate.add_argument('csv')
    locate.add_argument('--dry-run', action='store_true')
    rename = sub.add_parser('rename')
    rename.add_argument('csv')
    sub.add_parser('markup')
    sub.add_parser('gallery')
    sub.add_parser('check')
    args = parser.parse_args(argv)
    handler = {'optimize': cmd_optimize, 'locate': cmd_locate, 'rename': cmd_rename, 'markup': cmd_markup, 'gallery': cmd_gallery, 'check': cmd_check}[args.command]
    return handler(args) or 0


if __name__ == '__main__':
    sys.exit(main())
