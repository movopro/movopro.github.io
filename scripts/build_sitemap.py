from pathlib import Path
from html import escape
from urllib.parse import urljoin, urlparse
import re
from datetime import datetime, timezone

HOST = 'https://memoryphotoandvideo.com'
TODAY = datetime.now(timezone.utc).date().isoformat()

PAGES = [
    ('index.html', '/'),
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
        # Canonicalise to the preferred HTTPS/non-www host.
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
