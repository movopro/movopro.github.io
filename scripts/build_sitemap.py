from pathlib import Path
from html import escape
from urllib.parse import urljoin, urlparse, unquote
import re
from datetime import datetime, timezone

HOST = 'https://memoryphotoandvideo.com'
TODAY = datetime.now(timezone.utc).date().isoformat()

PAGES = [
    ('index.html', '/'),
    ('svatben-fotograf-kardzhali.html', '/svatben-fotograf-kardzhali.html'),
    ('svatben-fotograf-plovdiv.html', '/svatben-fotograf-plovdiv.html'),
    ('portfolio.html', '/portfolio.html'),
    ('videos.html', '/videos.html'),
    ('uslugi-ceni.html', '/uslugi-ceni.html'),
    ('availability.html', '/availability.html'),
    ('about.html', '/about.html'),
    ('svatba-izbrani.html', '/svatba-izbrani.html'),
    ('en/index.html', '/en/'),
    ('en/portfolio.html', '/en/portfolio.html'),
    ('en/videos.html', '/en/videos.html'),
    ('en/uslugi-ceni.html', '/en/uslugi-ceni.html'),
    ('en/availability.html', '/en/availability.html'),
    ('en/about.html', '/en/about.html'),
    ('en/svatba-izbrani.html', '/en/svatba-izbrani.html'),
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
# The 64px navigation icon is interface chrome, not content worth indexing.
SKIP_IMAGES = {'assets/icon-64.png'}


def is_published_image(url_path: str) -> bool:
    rel = unquote(url_path).lstrip('/')
    if rel in SKIP_IMAGES or not Path(rel).is_file():
        return False
    return not any(rel == ex or rel.startswith(ex + '/') for ex in EXCLUDED)


IMG_RE = re.compile(r'<img\b[^>]*?\bsrc=["\']([^"\']+)["\']', re.I)


def local_image_urls(path: Path):
    if not path.exists():
        return []
    text = path.read_text(encoding='utf-8', errors='ignore')
    found = []
    seen = set()
    for src in IMG_RE.findall(text):
        src = src.strip()
        if not src or src.startswith(('data:', 'blob:', 'javascript:')):
            continue
        absolute = urljoin(HOST + '/', src)
        parsed = urlparse(absolute)
        if parsed.scheme not in ('http', 'https'):
            continue
        if parsed.netloc not in ('memoryphotoandvideo.com', 'www.memoryphotoandvideo.com'):
            continue
        if not is_published_image(parsed.path):
            continue
        absolute = HOST + parsed.path
        if parsed.query:
            absolute += '?' + parsed.query
        if absolute in seen:
            continue
        seen.add(absolute)
        found.append(absolute)
        if len(found) >= 1000:
            break
    return found


lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
]

for file_name, url_path in PAGES:
    page_path = Path(file_name)
    page_url = HOST + url_path
    lines.append('  <url>')
    lines.append(f'    <loc>{escape(page_url)}</loc>')
    lines.append(f'    <lastmod>{TODAY}</lastmod>')
    for image_url in local_image_urls(page_path):
        lines.append('    <image:image>')
        lines.append(f'      <image:loc>{escape(image_url)}</image:loc>')
        lines.append('    </image:image>')
    lines.append('  </url>')

lines.append('</urlset>')
Path('sitemap.xml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote sitemap.xml with {len(PAGES)} page URLs.')
