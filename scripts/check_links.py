"""Crawl every published HTML page offline: internal links, anchors, images, scripts, stylesheets (stdlib only).

Usage:
    python3 scripts/check_links.py            # internal check, exit 1 when something is broken
    python3 scripts/check_links.py --external # also GET/HEAD every external URL (polite, rate limited)

Files that _config.yml excludes from the published site count as missing, because GitHub Pages does not serve them.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import re
import sys
import time

HOST = 'memoryphotoandvideo.com'
ROOT = Path(__file__).resolve().parent.parent
# Pages that are fragments or templates rather than published documents.
NOT_PAGES = {'header.html'}
SKIP_SCHEMES = ('mailto:', 'tel:', 'javascript:', 'data:', 'sms:', 'whatsapp:')


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []   # (kind, url)
        self.ids = set()
        self.base = None
        self._in_script = False

    def handle_starttag(self, tag, attrs):
        a = {k: v for k, v in attrs if v is not None}
        if tag == 'base' and 'href' in a and self.base is None:
            self.base = a['href']
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'a' and a.get('name'):
            self.ids.add(a['name'])
        if tag == 'a' and 'href' in a:
            self.refs.append(('a', a['href']))
        elif tag == 'link' and 'href' in a:
            if a.get('rel', '').lower() not in ('alternate', 'canonical') or a.get('hreflang') is None:
                self.refs.append(('link', a['href']))
        elif tag in ('script', 'img', 'source', 'video', 'audio', 'iframe') and 'src' in a:
            self.refs.append((tag, a['src']))
        if tag in ('img', 'source') and 'srcset' in a:
            for part in a['srcset'].split(','):
                piece = part.strip().split()
                if piece:
                    self.refs.append(('srcset', piece[0]))
        if tag == 'video' and 'poster' in a:
            self.refs.append(('poster', a['poster']))
        if tag == 'meta' and a.get('content', '').startswith('http') and (
                a.get('property') in ('og:image', 'og:url') or a.get('name') in ('twitter:image',)):
            self.refs.append(('meta', a['content']))


def excluded_paths(root):
    config = root / '_config.yml'
    items, active = [], False
    if not config.exists():
        return items
    for line in config.read_text(encoding='utf-8').splitlines():
        if re.match(r'^exclude:\s*$', line):
            active = True
        elif active and re.match(r'^\s+-\s+', line):
            items.append(re.sub(r'^\s+-\s+', '', line).strip().strip('"\'').rstrip('/'))
        elif active and line.strip() and not line.startswith((' ', '\t')):
            active = False
    return items


def pages(root):
    out = []
    for path in sorted(root.rglob('*.html')):
        rel = path.relative_to(root).as_posix()
        if rel in NOT_PAGES or rel.startswith(('.git/', 'node_modules/', '_site/')):
            continue
        out.append(rel)
    return out


def route_for(rel):
    return '/' + rel


def resolve_local(url_path, root, excluded):
    """Map a URL path to a served file, the way GitHub Pages does. Returns a relative path or None."""
    path = unquote(url_path)
    rel = path.lstrip('/')
    candidates = []
    if path.endswith('/') or rel == '':
        candidates.append(rel + 'index.html')
    else:
        candidates += [rel, rel + '.html', rel + '/index.html']
    for cand in candidates:
        target = (root / cand)
        if target.is_file():
            if any(cand == ex or cand.startswith(ex + '/') for ex in excluded):
                continue
            return cand
    return None


def collect(root):
    excluded = excluded_paths(root)
    parsed = {}
    for rel in pages(root):
        p = PageParser()
        p.feed((root / rel).read_text(encoding='utf-8', errors='replace'))
        parsed[rel] = p
    return excluded, parsed


def check_internal(root=ROOT):
    """Return (problems, external_urls). Problems are strings 'page: kind url -> reason'."""
    excluded, parsed = collect(root)
    problems, external = [], {}
    for rel, parser in parsed.items():
        base = 'https://' + HOST + route_for(rel)
        if parser.base:
            base = urljoin(base, parser.base)
        for kind, raw in parser.refs:
            raw = raw.strip()
            if not raw or raw.startswith(SKIP_SCHEMES):
                continue
            absolute = urljoin(base, raw)
            u = urlparse(absolute)
            if u.scheme not in ('http', 'https'):
                continue
            if u.netloc.lower() not in (HOST, 'www.' + HOST):
                if kind in ('a', 'iframe', 'link', 'script', 'img', 'source', 'srcset', 'video', 'poster', 'meta'):
                    external.setdefault(absolute.split('#')[0], []).append(rel)
                continue
            target = resolve_local(u.path, root, excluded)
            if target is None:
                problems.append(f'{rel}: {kind} {raw} -> file not found')
                continue
            if u.fragment and target.endswith('.html'):
                other = parsed.get(target)
                frag = unquote(u.fragment)
                if other is not None and frag not in other.ids and frag.lower() != 'top':
                    problems.append(f'{rel}: {kind} {raw} -> anchor #{frag} not in {target}')
    return problems, external


def check_external(urls, delay=0.6, timeout=15):
    import urllib.request
    import urllib.error
    bad = []
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; MemoryLinkCheck/1.0)'}
    last_host = {}
    for url in sorted(urls):
        host = urlparse(url).netloc
        wait = delay - (time.time() - last_host.get(host, 0))
        if wait > 0:
            time.sleep(wait)
        status = None
        for method in ('HEAD', 'GET'):
            req = urllib.request.Request(url, method=method, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    status = resp.status
            except urllib.error.HTTPError as err:
                status = err.code
            except Exception as err:  # network error: report, do not crash
                status = type(err).__name__
            last_host[host] = time.time()
            if status == 200 or (isinstance(status, int) and 200 <= status < 400):
                break
        else:
            bad.append((url, status))
    return bad


def main(argv):
    problems, external = check_internal()
    for line in problems:
        print('BROKEN', line)
    print(f'internal: {len(parsed_count())} pages, {len(problems)} problems; {len(external)} distinct external URLs')
    code = 1 if problems else 0
    if '--external' in argv:
        bad = check_external(external)
        for url, status in bad:
            print('EXTERNAL', status, url, 'used on', ', '.join(sorted(set(external[url]))[:3]))
        print(f'external: {len(external) - len(bad)} ok, {len(bad)} not reachable (login walls and bot blocks show as 403/429/999)')
    return code


def parsed_count():
    return pages(ROOT)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
