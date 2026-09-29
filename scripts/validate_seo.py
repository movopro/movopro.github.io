"""Check homepage city links, complete canonical sitemap coverage and business structured data (no dependencies)."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json
import re
import xml.etree.ElementTree as ET

HOST = 'https://memoryphotoandvideo.com'
CITY_LINKS = {
    '/svatben-fotograf-kardzhali.html': 'Сватбен фотограф Кърджали',
    '/svatben-fotograf-plovdiv.html': 'Сватбен фотограф Пловдив',
}


# The ProfessionalService record is repeated in several pages, in main.js and in the English page
# generator. These fields are language-neutral and must match everywhere.
SHARED_BUSINESS_FIELDS = ('@id', '@type', 'name', 'url', 'logo', 'image', 'foundingDate', 'sameAs')


def business_nodes(text):
    """Return every ProfessionalService node found in the page's JSON-LD blocks."""
    nodes = []
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', text, re.S):
        data = json.loads(block)
        items = data.get('@graph', [data]) if isinstance(data, dict) else data
        nodes.extend(item for item in items if item.get('@type') == 'ProfessionalService')
    return nodes


def check_business_data(business):
    """All copies of the business record must agree (per language), and main.js must carry the same one."""
    by_lang = {}
    for path, lang, node in business:
        by_lang.setdefault(lang, []).append((path, node))
    for lang, group in by_lang.items():
        first_path, first = group[0]
        for path, node in group[1:]:
            assert node == first, f'{path}: business structured data differs from {first_path}'
    reference = {lang: group[0][1] for lang, group in by_lang.items()}
    base_lang, base = next(iter(reference.items()))
    for lang, node in reference.items():
        for field in SHARED_BUSINESS_FIELDS:
            assert node.get(field) == base.get(field), f'{lang} business record: "{field}" differs from the {base_lang} one'
        assert len(node.get('areaServed', [])) == len(base.get('areaServed', [])), f'{lang} business record: different number of service areas'
    js = Path('assets/js/main.js').read_text(encoding='utf-8')
    bulgarian = reference.get('bg')
    if bulgarian:
        values = [bulgarian['description'], bulgarian['logo'], bulgarian['image'], bulgarian['address']['addressLocality'],
                  *[area['name'] for area in bulgarian['areaServed']], *bulgarian['serviceType'], *bulgarian['sameAs']]
        for value in values:
            assert value in js, f'assets/js/main.js: structured-data fallback does not match the pages ("{value}")'
    return sum(len(group) for group in by_lang.values())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.canonical = []
        self.lang = ''
        self.in_nav = self.in_main = self.skip = 0
        self.links = []
        self.anchor = None
        self.words = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs.get('lang', '')
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical.append(attrs.get('href', ''))
        if tag == 'nav':
            self.in_nav += 1
        if tag == 'main':
            self.in_main += 1
        if tag in ('script', 'style', 'template'):
            self.skip += 1
        if tag == 'a':
            self.anchor = [attrs.get('href', ''), '', self.in_nav, self.in_main]

    def handle_data(self, data):
        if self.skip:
            return
        if self.in_main:
            self.words.extend(data.split())
        if self.anchor is not None:
            self.anchor[1] += data

    def handle_endtag(self, tag):
        if tag == 'nav':
            self.in_nav -= 1
        if tag == 'main':
            self.in_main -= 1
        if tag in ('script', 'style', 'template'):
            self.skip -= 1
        if tag == 'a' and self.anchor is not None:
            self.links.append(self.anchor)
            self.anchor = None


def validate():
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [node.text for node in ET.parse('sitemap.xml').findall('s:url/s:loc', ns)]
    duplicates = [url for url, count in Counter(urls).items() if count > 1]
    assert not duplicates, f'Duplicate sitemap URLs: {duplicates}'
    expected = set()
    business = []
    for path in sorted(Path('.').rglob('*.html')):
        if any(part.startswith('.') for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        if '<html' not in text.lower():
            continue  # header.html is an include, not a standalone page.
        if 'name="robots" content="noindex' in text:
            continue  # e.g. 404.html: intentionally not indexed, not in the sitemap.
        page = Page(text)
        assert len(page.canonical) == 1, f'{path}: expected one canonical'
        canonical = page.canonical[0]
        route = '/' + path.as_posix()
        if route.endswith('/index.html'):
            route = route[:-10]
        assert canonical == HOST + route, f'{path}: incorrect canonical {canonical}'
        expected.add(canonical)
        business.extend((path.as_posix(), page.lang or 'bg', node) for node in business_nodes(text))
        if route == '/' or route in CITY_LINKS:
            assert len(page.words) > 100, f'{path}: insufficient main text without JavaScript'
            print(f'{path}: {len(page.words)} words in raw HTML main content')
        if route == '/':
            for target, anchor in CITY_LINKS.items():
                assert any(urljoin(canonical, href) == HOST + target and label.strip() in (anchor, anchor.split()[-1]) and main
                           for href, label, nav, main in page.links), f'Homepage missing main link {anchor}'
    assert set(urls) == expected, f'Sitemap missing: {expected - set(urls)}; unexpected: {set(urls) - expected}'
    records = check_business_data(business)
    print(f'Validated all {len(expected)} canonical pages, sitemap coverage, static homepage city links and {records} consistent business records.')


if __name__ == '__main__':
    validate()
