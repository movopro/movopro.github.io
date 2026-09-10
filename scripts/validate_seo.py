"""Check homepage city links and complete canonical sitemap coverage (no dependencies)."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET

HOST = 'https://memoryphotoandvideo.com'
CITY_LINKS = {
    '/svatben-fotograf-kardzhali.html': 'Сватбен фотограф Кърджали',
    '/svatben-fotograf-plovdiv.html': 'Сватбен фотограф Пловдив',
}


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
    for path in sorted(Path('.').rglob('*.html')):
        if any(part.startswith('.') for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        if '<html' not in text.lower():
            continue  # header.html is an include, not a standalone page.
        page = Page(text)
        assert len(page.canonical) == 1, f'{path}: expected one canonical'
        canonical = page.canonical[0]
        route = '/' + path.as_posix()
        if route.endswith('/index.html'):
            route = route[:-10]
        assert canonical == HOST + route, f'{path}: incorrect canonical {canonical}'
        expected.add(canonical)
        if route == '/' or route in CITY_LINKS:
            assert len(page.words) > 100, f'{path}: insufficient main text without JavaScript'
            print(f'{path}: {len(page.words)} words in raw HTML main content')
        if route == '/':
            for target, anchor in CITY_LINKS.items():
                assert any(urljoin(canonical, href) == HOST + target and label.strip() == anchor and main
                           for href, label, nav, main in page.links), f'Homepage missing main link {anchor}'
    assert set(urls) == expected, f'Sitemap missing: {expected - set(urls)}; unexpected: {set(urls) - expected}'
    print(f'Validated all {len(expected)} canonical pages, sitemap coverage, and static homepage city links.')


if __name__ == '__main__':
    validate()
