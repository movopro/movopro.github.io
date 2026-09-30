"""Write sitemap.xml (pages) and sitemap-images.xml (every photo with title and caption, grouped by the page it appears on)."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urljoin, urlparse, unquote
import csv
import posixpath
import re
import subprocess
from datetime import datetime, timezone

HOST = 'https://memoryphotoandvideo.com'
TODAY = datetime.now(timezone.utc).date().isoformat()
BRAND = 'Memory Photo And Video'

PAGES = [
    ('index.html', '/'),
    ('svatben-fotograf-kardzhali.html', '/svatben-fotograf-kardzhali.html'),
    ('svatben-fotograf-plovdiv.html', '/svatben-fotograf-plovdiv.html'),
    ('svatben-fotograf-haskovo.html', '/svatben-fotograf-haskovo.html'),
    ('svatben-fotograf-smolyan.html', '/svatben-fotograf-smolyan.html'),
    ('portfolio.html', '/portfolio.html'),
    ('videos.html', '/videos.html'),
    ('uslugi-ceni.html', '/uslugi-ceni.html'),
    ('availability.html', '/availability.html'),
    ('about.html', '/about.html'),
    ('svatba-izbrani.html', '/svatba-izbrani.html'),
    ('privacy.html', '/privacy.html'),
    ('en/index.html', '/en/'),
    ('en/portfolio.html', '/en/portfolio.html'),
    ('en/videos.html', '/en/videos.html'),
    ('en/uslugi-ceni.html', '/en/uslugi-ceni.html'),
    ('en/availability.html', '/en/availability.html'),
    ('en/about.html', '/en/about.html'),
    ('en/svatba-izbrani.html', '/en/svatba-izbrani.html'),
    ('en/privacy.html', '/en/privacy.html'),
]

# Dedicated wedding watch pages are intentionally discovered dynamically so
# future stories are added to the sitemap automatically when a new HTML file
# is created under /weddings/.
for wedding_page in sorted(Path('weddings').glob('*.html')):
    PAGES.append((wedding_page.as_posix(), '/' + wedding_page.as_posix()))


def deploy_excludes():
    """Paths listed under `exclude:` in _config.yml are not published by GitHub Pages."""
    config = Path('_config.yml')
    if not config.exists():
        return []
    items, active = [], False
    for line in config.read_text(encoding='utf-8').splitlines():
        if re.match(r'^exclude:\s*$', line):
            active = True
        elif active and re.match(r'^\s+-\s+', line):
            items.append(re.sub(r'^\s+-\s+', '', line).strip().strip('"\'').rstrip('/'))
        elif active and line.strip() and not line.startswith((' ', '\t')):
            active = False
    return items


EXCLUDED = deploy_excludes()
# Logos and icons are interface chrome, not content worth indexing.
SKIP_IMAGES = {'assets/icon-64.png', 'assets/icon-192.png', 'assets/icon-512.png', 'apple-touch-icon.png'}
# Responsive copies are listed under their large version.
LARGE_VERSION = {'assets/hero/svatben-fotograf-memory-1200.webp': 'assets/hero/svatben-fotograf-memory-1920.webp'}
GALLERY_FILE = re.compile(r'^assets/gallery/([a-z0-9-]+?)(?:-(?:800|480))?\.webp$')


def is_published_image(rel: str) -> bool:
    if rel in SKIP_IMAGES or not Path(rel).is_file():
        return False
    return not any(rel == ex or rel.startswith(ex + '/') for ex in EXCLUDED)


def last_modified(path: Path) -> str:
    """Date the page file last changed in git (YYYY-MM-DD); falls back to today outside a git checkout."""
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', str(path)],
                             capture_output=True, text=True, check=True).stdout.strip()
        return out or TODAY
    except (OSError, subprocess.CalledProcessError):
        return TODAY


def load_photos():
    """image-seo.csv: title, alt text and (once known) the city of every gallery photo."""
    path = Path('image-seo.csv')
    if not path.exists():
        return {}
    with open(path, newline='', encoding='utf-8-sig') as handle:
        return {row['file']: row for row in csv.DictReader(handle)}


PHOTOS = load_photos()
IMG_TAG = re.compile(r'<img\b[^>]*>', re.I | re.S)


def attribute(tag, name):
    match = re.search(r'\s%s=(?:"([^"]*)"|\'([^\']*)\')' % name, tag)
    return None if not match else unescape(match.group(1) if match.group(1) is not None else match.group(2))


def describe(rel, alt):
    """(title, caption) of an image in Bulgarian; the city is added where image-seo.csv knows it."""
    match = GALLERY_FILE.match(rel)
    row = PHOTOS.get(match.group(1)) if match else None
    if row:
        place = row.get('place') or row.get('city')
        caption = f"{row['alt_bg']}. Сватбена фотография от {BRAND}" + (f", {place}" if place else '') + '.'
        return row['title_bg'], caption
    return alt, alt


def page_images(page_path: Path):
    """Content images of a page as [(url, title, caption)], in page order, each once."""
    text = page_path.read_text(encoding='utf-8', errors='ignore')
    folder = '' if page_path.parent.as_posix() == '.' else page_path.parent.as_posix() + '/'
    base = HOST + '/' + ('' if re.search(r'<base\s+href=["\']/["\']', text) else folder)
    found, seen = [], set()
    for tag in IMG_TAG.findall(text):
        src = (attribute(tag, 'src') or '').strip()
        if not src or src.startswith(('data:', 'blob:', 'javascript:')):
            continue
        parsed = urlparse(urljoin(base, src))
        if parsed.netloc not in ('memoryphotoandvideo.com', 'www.memoryphotoandvideo.com'):
            continue
        rel = posixpath.normpath(unquote(parsed.path).lstrip('/'))
        match = GALLERY_FILE.match(rel)
        if match:
            rel = f'assets/gallery/{match.group(1)}.webp'
        rel = LARGE_VERSION.get(rel, rel)
        alt = (attribute(tag, 'alt') or '').strip()
        if not is_published_image(rel) or rel in seen:
            continue
        if not alt and not match:
            continue  # decorative image without a description
        seen.add(rel)
        title, caption = describe(rel, alt)
        found.append((f'{HOST}/{rel}', title, caption))
        if len(found) >= 1000:
            break
    return found


pages_xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
images_xml = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
image_count = 0
for file_name, url_path in PAGES:
    page_path = Path(file_name)
    page_url = HOST + url_path
    pages_xml += ['  <url>', f'    <loc>{escape(page_url)}</loc>', f'    <lastmod>{last_modified(page_path)}</lastmod>', '  </url>']
    if file_name.startswith('en/'):
        continue  # the English pages show the same files; the image sitemap describes them in Bulgarian once
    photos = page_images(page_path)
    if not photos:
        continue
    images_xml += ['  <url>', f'    <loc>{escape(page_url)}</loc>']
    for url, title, caption in photos:
        images_xml += ['    <image:image>', f'      <image:loc>{escape(url)}</image:loc>',
                       f'      <image:title>{escape(title)}</image:title>',
                       f'      <image:caption>{escape(caption)}</image:caption>', '    </image:image>']
        image_count += 1
    images_xml.append('  </url>')

pages_xml.append('</urlset>')
images_xml.append('</urlset>')
Path('sitemap.xml').write_text('\n'.join(pages_xml) + '\n', encoding='utf-8')
Path('sitemap-images.xml').write_text('\n'.join(images_xml) + '\n', encoding='utf-8')
print(f'Wrote sitemap.xml with {len(PAGES)} page URLs and sitemap-images.xml with {image_count} image entries.')
