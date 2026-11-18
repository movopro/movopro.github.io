"""Tell IndexNow search engines (Bing, Yandex, Naver, Seznam and partners - not Google) which pages and pictures changed. Stdlib only.

Run by .github/workflows/indexnow.yml after the sitemap is rebuilt. The key is the repository secret INDEXNOW_KEY (environment variable
of the same name); it is never printed. The public key file `<key>.txt` in the site root has the key as its content (public by design).

    python3 scripts/indexnow.py [--days N] [--images none|changed|all] [--apply] [--wait SECONDS]

    --days N      pages whose sitemap.xml lastmod is within the last N days (0 = every page)         (default 1)
    --images M    also send the image files of sitemap-images.xml: none, changed (files committed within the window), all
    --apply       really send. Without it nothing leaves the machine: the plan is printed (a dry run)
    --wait S      with --apply: wait S seconds first so GitHub Pages has published the pages        (default 90)

Exit codes: 0 sent / dry run / nothing to send / secret not set yet (a notice, so the Actions page stays green until the owner adds it);
1 IndexNow refused the request (bad key, wrong host); 2 the setup is wrong (invalid key, no matching key file in the repository,
the site does not serve the key file). A busy or unreachable IndexNow (HTTP 429, 5xx, network) is a warning and exit 0: the next run repeats it.
"""
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

HOST = 'memoryphotoandvideo.com'
ENDPOINT = 'https://api.indexnow.org/indexnow'
BATCH = 10000                     # the protocol's limit per request
KEY_PATTERN = re.compile(r'[A-Za-z0-9-]{8,128}')
SM = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'i': 'http://www.google.com/schemas/sitemap-image/1.1'}
UA = 'MemoryIndexNow/1'


def sitemap_pages(root: Path):
    """[(loc, lastmod 'YYYY-MM-DD' or '')] of sitemap.xml, https pages of this host only, each once."""
    seen, out = set(), []
    for node in ET.parse(root / 'sitemap.xml').getroot().findall('s:url', SM):
        loc = (node.findtext('s:loc', '', SM) or '').strip()
        if loc.startswith(f'https://{HOST}/') and loc not in seen:
            seen.add(loc)
            out.append((loc, (node.findtext('s:lastmod', '', SM) or '').strip()[:10]))
    return out


def sitemap_images(root: Path):
    """Every image address of sitemap-images.xml (this host, each once, in file order)."""
    seen, out = set(), []
    for loc in ET.parse(root / 'sitemap-images.xml').getroot().iterfind('s:url/i:image/i:loc', SM):
        url = (loc.text or '').strip()
        if url.startswith(f'https://{HOST}/') and url not in seen:
            seen.add(url)
            out.append(url)
    return out


def changed_pages(pages, today: date, days: int):
    since = today - timedelta(days=days)
    out = []
    for loc, mod in pages:
        try:
            recent = date.fromisoformat(mod) >= since
        except ValueError:
            recent = True             # no usable lastmod: better to send than to miss it
        if days == 0 or recent:
            out.append(loc)
    return out


def git_changed_files(root: Path, since: datetime):
    """Files committed since `since` (UTC), by `git log`; an empty set when git cannot tell."""
    try:
        text = subprocess.run(['git', 'log', f'--since={since:%Y-%m-%dT%H:%M:%SZ}', '--name-only', '--pretty=format:', '--', 'assets'],
                              cwd=root, capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return set()
    return {line.strip() for line in text.splitlines() if line.strip()}


def pick_images(root: Path, mode: str, today: date, days: int, changed=git_changed_files):
    images = sitemap_images(root)
    if mode == 'none':
        return []
    if mode == 'all' or days == 0:
        return images
    midnight = datetime(today.year, today.month, today.day, tzinfo=timezone.utc) - timedelta(days=days)
    files = changed(root, midnight)
    prefix = f'https://{HOST}/'
    return [url for url in images if url[len(prefix):] in files]


def http(url, data=None, timeout=30):
    """(status, first 500 bytes of the body as text); status 0 when the server cannot be reached. Redirects are not followed."""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    headers = {'User-Agent': UA}
    if data is not None:
        headers['Content-Type'] = 'application/json; charset=utf-8'
    request = urllib.request.Request(url, data=data, method='POST' if data is not None else 'GET', headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect).open(request, timeout=timeout) as response:
            return response.status, response.read(500).decode('utf-8', 'replace').strip()
    except urllib.error.HTTPError as error:
        return error.code, ''
    except OSError:
        return 0, ''


def note(kind, message):
    print(f'::{kind}::{message}', flush=True)


def run(root: Path, args, env=None, fetch=http, sleep=time.sleep, today=None, changed=git_changed_files):
    env = os.environ if env is None else env
    today = today or datetime.now(timezone.utc).date()
    key = (env.get('INDEXNOW_KEY') or '').strip()
    pages = changed_pages(sitemap_pages(root), today, args.days)
    images = pick_images(root, args.images, today, args.days, changed)
    urls = pages + [url for url in images if url not in pages]
    print(f'plan: {len(pages)} page(s) and {len(images)} image(s) changed within {args.days} day(s) (0 = everything)')
    for url in urls[:10]:
        print('  ', url)
    if len(urls) > 10:
        print(f'   ... and {len(urls) - 10} more')
    if not key:
        note('notice', 'INDEXNOW_KEY is not set: nothing was sent. Add the repository secret (Settings -> Secrets and variables -> Actions) to turn IndexNow on.')
        return 0
    if not KEY_PATTERN.fullmatch(key):
        note('error', 'INDEXNOW_KEY is not a valid IndexNow key (8-128 letters, digits or dashes)')
        return 2
    key_file = root / f'{key}.txt'
    if not key_file.is_file() or key_file.read_text(encoding='utf-8').strip() != key:
        note('error', 'the repository has no <key>.txt in its root whose name and content equal the INDEXNOW_KEY secret')
        return 2
    if not urls:
        note('notice', 'nothing changed in the window: nothing to send')
        return 0
    if not args.apply:
        note('notice', 'dry run (add --apply to send)')
        return 0
    if args.wait:
        sleep(args.wait)
    for attempt in range(1, 6):       # GitHub Pages may still be publishing the key file
        status, body = fetch(f'https://{HOST}/{key}.txt')
        if status == 200 and body == key:
            break
        print(f'key file not visible yet (attempt {attempt}, HTTP {status})')
        if attempt < 5:
            sleep(30)
    else:
        if status == 0:
            note('warning', 'the site could not be reached to check the key file; the next run repeats this')
            return 0
        note('error', f'https://{HOST}/<key>.txt does not serve the key')
        return 2
    for start in range(0, len(urls), BATCH):
        batch = urls[start:start + BATCH]
        payload = json.dumps({'host': HOST, 'key': key, 'keyLocation': f'https://{HOST}/{key}.txt', 'urlList': batch}).encode('utf-8')
        status, _ = fetch(ENDPOINT, payload)
        if status in (200, 202):
            print(f'IndexNow accepted {len(batch)} URL(s) (HTTP {status})')
        elif status == 0 or status == 429 or status >= 500:
            note('warning', f'IndexNow is busy or unreachable (HTTP {status}); the next run repeats this')
            return 0
        else:
            note('error', f'IndexNow refused {len(batch)} URL(s) with HTTP {status}')
            return 1
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--days', type=int, default=1)
    parser.add_argument('--images', choices=('none', 'changed', 'all'), default='changed')
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--wait', type=int, default=90)
    args = parser.parse_args(argv)
    if args.days < 0:
        parser.error('--days must not be negative')
    return run(Path(__file__).resolve().parent.parent, args)


if __name__ == '__main__':
    sys.exit(main())
