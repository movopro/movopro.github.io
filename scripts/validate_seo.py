"""Check city links, canonical sitemap coverage, image markup/sitemap and business structured data (stdlib only)."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import csv
import json
import re
import xml.etree.ElementTree as ET

HOST = 'https://memoryphotoandvideo.com'
# Landing pages per city: route -> (city name used in areaServed, anchor text of the links to it).
CITY_PAGES = {
    '/svatben-fotograf-kardzhali.html': ('Кърджали', 'Сватбен фотограф Кърджали'),
    '/svatben-fotograf-plovdiv.html': ('Пловдив', 'Сватбен фотограф Пловдив'),
    '/svatben-fotograf-haskovo.html': ('Хасково', 'Сватбен фотограф Хасково'),
    '/svatben-fotograf-smolyan.html': ('Смолян', 'Сватбен фотограф Смолян'),
}
CITY_FILES = {route.lstrip('/'): city for route, (city, _) in CITY_PAGES.items()}
CITY_TITLE_TAIL = '| Memory Photo And Video'
MIN_CITY_WORDS = 400
MAX_CITY_WORDS = 650


# The LocalBusiness record is repeated in several pages, in main.js and in the English page
# generator. These fields are language-neutral and must match everywhere.
SHARED_BUSINESS_FIELDS = ('@id', '@type', 'name', 'alternateName', 'url', 'logo', 'image', 'foundingDate', 'sameAs',
                          'geo', 'hasMap')
# Name and address published by the owner on his Google Business Profile. Every copy must carry exactly this.
# No telephone anywhere on the site (owner decision 2026-10-13: bookings are on site or by mail).
MAP_URL = 'https://maps.google.com/?cid=17084943582406582138'
NAP = {
    'geo': {'@type': 'GeoCoordinates', 'latitude': 41.6211389, 'longitude': 25.3785265},
    'hasMap': MAP_URL,
    'address': {
        'bg': {'@type': 'PostalAddress', 'streetAddress': 'ул. Синчец 8, Веселчане', 'addressLocality': 'Кърджали', 'postalCode': '6602', 'addressCountry': 'BG'},
        'en': {'@type': 'PostalAddress', 'streetAddress': 'ul. Sinchets 8, Veselchane', 'addressLocality': 'Kardzhali', 'postalCode': '6602', 'addressCountry': 'BG'},
    },
}
BUSINESS_TYPE = 'LocalBusiness'
# Every structured-data type on the site must exist on schema.org. Until 2026-10-16 the business record was typed
# "Photographer", which schema.org does not define (schema.org/Photographer is a 404), so search engines saw no
# LocalBusiness at all. Add a type here only after checking that its schema.org page exists.
SCHEMA_TYPES = {'AboutPage', 'Answer', 'BreadcrumbList', 'City', 'CollectionPage', 'Country', 'FAQPage', 'GeoCoordinates',
                'ImageGallery', 'ImageObject', 'ListItem', 'LocalBusiness', 'Place', 'PostalAddress', 'Question', 'Service',
                'VideoObject', 'WebPage', 'WebSite'}
LD_JSON = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'


def ld_types(value):
    """Every @type used anywhere inside a JSON-LD value."""
    if isinstance(value, dict):
        kind = value.get('@type')
        yield from ([kind] if isinstance(kind, str) else (kind or []))
        for item in value.values():
            yield from ld_types(item)
    elif isinstance(value, list):
        for item in value:
            yield from ld_types(item)


def unknown_types(text):
    return sorted({kind for block in re.findall(LD_JSON, text, re.S) for kind in ld_types(json.loads(block))} - SCHEMA_TYPES)


def business_nodes(text):
    """Return every LocalBusiness node found in the page's JSON-LD blocks."""
    nodes = []
    for block in re.findall(LD_JSON, text, re.S):
        data = json.loads(block)
        items = data.get('@graph', [data]) if isinstance(data, dict) else data
        nodes.extend(item for item in items if item.get('@type') == BUSINESS_TYPE)
    return nodes


def without_area(node):
    return {key: value for key, value in node.items() if key != 'areaServed'}


def check_business_data(business):
    """All copies of the business record must agree (per language), and main.js must carry the same one.

    City landing pages repeat the record with exactly one difference: areaServed is that city.
    """
    by_lang = {}
    for path, lang, node in business:
        by_lang.setdefault(lang, []).append((path, node))
    reference = {}
    for lang, group in by_lang.items():
        general = [(path, node) for path, node in group if path not in CITY_FILES]
        assert general, f'{lang}: no general business record found'
        first_path, first = general[0]
        reference[lang] = first
        for path, node in group:
            if path in CITY_FILES:
                assert without_area(node) == without_area(first), f'{path}: business structured data differs from {first_path} (only areaServed may differ)'
                assert node.get('areaServed') == [{'@type': 'City', 'name': CITY_FILES[path]}], f'{path}: areaServed must be the page city only'
            else:
                assert node == first, f'{path}: business structured data differs from {first_path}'
    base_lang, base = next(iter(reference.items()))
    for lang, node in reference.items():
        for field in SHARED_BUSINESS_FIELDS:
            assert node.get(field) == base.get(field), f'{lang} business record: "{field}" differs from the {base_lang} one'
        assert len(node.get('areaServed', [])) == len(base.get('areaServed', [])), f'{lang} business record: different number of service areas'
        assert 'email' not in node and 'faxNumber' not in node and 'openingHours' not in node and 'openingHoursSpecification' not in node and 'telephone' not in node,             f'{lang} business record must not publish email, fax, telephone or opening hours'
        assert 'aggregateRating' not in node and 'review' not in node, f'{lang} business record must not carry review markup'
        for field in ('geo', 'hasMap'):
            assert node.get(field) == NAP[field], f'{lang} business record: {field} must be {NAP[field]!r}'
        assert node.get('address') == NAP['address'].get(lang, NAP['address']['bg']), f'{lang} business record: address differs from the Google Business Profile address'
        assert MAP_URL in node.get('sameAs', []), f'{lang} business record: sameAs must include the Google Maps listing'
    js = Path('assets/js/main.js').read_text(encoding='utf-8')
    bulgarian = reference.get('bg')
    if bulgarian:
        values = [bulgarian['name'], bulgarian['alternateName'], bulgarian['description'], bulgarian['logo'], bulgarian['image'],
                  bulgarian['address']['addressLocality'], bulgarian['address']['streetAddress'], bulgarian['address']['postalCode'],
                  bulgarian['hasMap'],
                  *[area['name'] for area in bulgarian['areaServed']], *bulgarian['serviceType'], *bulgarian['sameAs']]
        for value in values:
            assert value in js, f'assets/js/main.js: structured-data fallback does not match the pages ("{value}")'
    return sum(len(group) for group in by_lang.values())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.canonical = []
        self.lang = ''
        self.title = ''
        self.in_title = False
        self.in_nav = self.in_main = self.in_footer = self.skip = 0
        self.links = []
        self.anchor = None
        self.words = []
        self.h1 = []
        self.in_h1 = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs.get('lang', '')
        if tag == 'title':
            self.in_title = True
        if tag == 'h1':
            self.in_h1 = True
            self.h1.append('')
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical.append(attrs.get('href', ''))
        if tag == 'nav':
            self.in_nav += 1
        if tag == 'main':
            self.in_main += 1
        if tag == 'footer':
            self.in_footer += 1
        if tag in ('script', 'style', 'template'):
            self.skip += 1
        if tag == 'a':
            self.anchor = [attrs.get('href', ''), '', self.in_nav, self.in_main, self.in_footer]

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.skip:
            return
        if self.in_h1:
            self.h1[-1] += data
        if self.in_main:
            self.words.extend(data.split())
        if self.anchor is not None:
            self.anchor[1] += data

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'h1':
            self.in_h1 = False
        if tag == 'nav':
            self.in_nav -= 1
        if tag == 'main':
            self.in_main -= 1
        if tag == 'footer':
            self.in_footer -= 1
        if tag in ('script', 'style', 'template'):
            self.skip -= 1
        if tag == 'a' and self.anchor is not None:
            self.links.append(self.anchor)
            self.anchor = None


IMG_TAG = re.compile(r'<img\b[^>]*>', re.I | re.S)


def attribute(tag, name):
    match = re.search(r'\s%s=(?:"([^"]*)"|\'([^\']*)\')' % name, tag)
    return None if not match else (match.group(1) if match.group(1) is not None else match.group(2))


def page_base(path, text):
    """URL that relative references of the page resolve against (the site root when the page sets <base href=\"/\">)."""
    if re.search(r'<base\s+href=["\']/["\']', text):
        return HOST + '/'
    folder = path.parent.as_posix()
    return HOST + '/' + ('' if folder == '.' else folder + '/')


def check_images(path, text, base):
    """Every <img> needs alt, width and height and a real (non-placeholder) src that exists."""
    count = 0
    for tag in IMG_TAG.findall(text):
        if attribute(tag, 'id') == 'lightboxImage':
            continue  # filled by the gallery script when a photo is opened
        src = attribute(tag, 'src') or ''
        assert src and not src.startswith('data:'), f'{path}: <img> without a real src: {tag[:90]}'
        assert attribute(tag, 'alt') is not None, f'{path}: <img> without alt: {src}'
        assert attribute(tag, 'width') and attribute(tag, 'height'), f'{path}: <img> without width/height: {src}'
        parsed = urlparse(urljoin(base, src))
        if parsed.netloc == 'memoryphotoandvideo.com':
            assert Path(parsed.path.lstrip('/')).is_file(), f'{path}: image file is missing: {src}'
        count += 1
    return count


def check_image_data(text_by_path):
    """image-seo.csv, the portfolio gallery, its structured data and the image sitemap describe the same photos."""
    with open('image-seo.csv', newline='', encoding='utf-8-sig') as handle:
        rows = list(csv.DictReader(handle))
    assert rows, 'image-seo.csv is empty'
    names = [row['file'] for row in rows]
    assert len(set(names)) == len(names), 'image-seo.csv: duplicate file names'
    alts = [row['alt_bg'] for row in rows]
    assert len(set(alts)) == len(alts), 'image-seo.csv: duplicate alt text'
    for row in rows:
        for field in ('title_bg', 'alt_bg', 'alt_en'):
            assert row[field].strip(), f"image-seo.csv: {row['file']} has no {field}"
        for suffix in ('', '-800', '-480'):
            assert Path(f"assets/gallery/{row['file']}{suffix}.webp").is_file(), f"missing assets/gallery/{row['file']}{suffix}.webp"
    portfolio = text_by_path['portfolio.html']
    tiles = re.findall(r'class="gallery-item"[^>]*data-image="([^"]+)"', portfolio)
    assert tiles == [f'assets/gallery/{name}.webp' for name in names], 'portfolio.html tiles differ from image-seo.csv (run scripts/image_tools.py gallery)'
    graph = []
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', portfolio, re.S):
        graph.extend(json.loads(block).get('@graph', []))
    gallery = next(node for node in graph if node.get('@type') == 'ImageGallery')
    media = gallery['associatedMedia']
    assert [item['contentUrl'] for item in media] == [f'{HOST}/assets/gallery/{name}.webp' for name in names], 'portfolio ImageGallery does not list the same photos'
    assert all(item['creator'].get('@id') == HOST + '/#business' and item['creator'].get('name') == 'Memory Photo And Video' and item['name'] for item in media), 'ImageGallery items need a name and the creator Memory Photo And Video'
    # Image sitemap: every gallery photo, with a title and caption.
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'i': 'http://www.google.com/schemas/sitemap-image/1.1'}
    tree = ET.parse('sitemap-images.xml')
    listed = {}
    for url in tree.findall('s:url', ns):
        for image in url.findall('i:image', ns):
            listed.setdefault(image.findtext('i:loc', namespaces=ns), image)
    for name in names:
        loc = f'{HOST}/assets/gallery/{name}.webp'
        assert loc in listed, f'sitemap-images.xml is missing {loc}'
        assert listed[loc].findtext('i:title', namespaces=ns) and listed[loc].findtext('i:caption', namespaces=ns), f'sitemap-images.xml: {loc} needs title and caption'
    robots = Path('robots.txt').read_text(encoding='utf-8')
    for sitemap in ('sitemap.xml', 'sitemap-images.xml'):
        assert f'Sitemap: {HOST}/{sitemap}' in robots, f'robots.txt does not reference {sitemap}'
    return len(rows)


def validate():
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [node.text for node in ET.parse('sitemap.xml').findall('s:url/s:loc', ns)]
    duplicates = [url for url, count in Counter(urls).items() if count > 1]
    assert not duplicates, f'Duplicate sitemap URLs: {duplicates}'
    expected = set()
    business = []
    texts = {}
    images = 0
    for path in sorted(Path('.').rglob('*.html')):
        if any(part.startswith('.') for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        if '<html' not in text.lower():
            continue  # header.html is an include, not a standalone page.
        texts[path.as_posix()] = text
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
        assert not unknown_types(text), f'{path}: structured data uses types schema.org does not define: {unknown_types(text)}'
        images += check_images(path, text, page_base(path, text))
        if route == '/' or route in CITY_PAGES:
            assert len(page.words) > 100, f'{path}: insufficient main text without JavaScript'
            print(f'{path}: {len(page.words)} words in raw HTML main content')
        if route in CITY_PAGES:
            city = CITY_PAGES[route][0]
            assert MIN_CITY_WORDS <= len(page.words) <= MAX_CITY_WORDS, f'{path}: main text should be {MIN_CITY_WORDS}-{MAX_CITY_WORDS} words, found {len(page.words)}'
            assert page.title.strip().endswith(CITY_TITLE_TAIL) and city in page.title, f'{path}: title must name {city} and end with "{CITY_TITLE_TAIL}"'
            assert any(city in h for h in page.h1), f'{path}: H1 must name {city}'
            assert len(business_nodes(text)) == 1, f'{path}: a city page must carry exactly one {BUSINESS_TYPE} record'
        if page.lang == 'bg' and not path.parts[0] == 'en':
            footer_targets = {urljoin(canonical, href) for href, label, nav, main, foot in page.links if foot}
            for target in CITY_PAGES:
                assert HOST + target in footer_targets, f'{path}: footer is missing the link to {target}'
        if route == '/':
            assert 'Кърджали' in page.title, 'Homepage title must name Кърджали'
            for target, (city, anchor) in CITY_PAGES.items():
                assert any(urljoin(canonical, href) == HOST + target and label.strip() in (anchor, city, anchor.split()[-1])
                           for href, label, nav, main, foot in page.links), f'Homepage missing link {anchor}'
    assert set(urls) == expected, f'Sitemap missing: {expected - set(urls)}; unexpected: {set(urls) - expected}'
    pricing_links = {urljoin(HOST + '/uslugi-ceni.html', href) for href, *_ in Page(texts['uslugi-ceni.html']).links}
    for target in CITY_PAGES:
        assert HOST + target in pricing_links, f'uslugi-ceni.html does not link to {target}'
    records = check_business_data(business)
    photos = check_image_data(texts)
    print(f'Validated all {len(expected)} canonical pages, sitemap coverage, city links, {images} <img> tags, {photos} gallery photos (page, structured data, image sitemap) and {records} consistent business records.')


if __name__ == '__main__':
    validate()
