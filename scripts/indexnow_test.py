"""Tests for indexnow.py, the key file and the workflow: run with `python3 scripts/indexnow_test.py`. Nothing here reaches the network."""
from contextlib import redirect_stdout
from datetime import date
from pathlib import Path
import io
import json
import re
import sys
import tempfile
import types
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import indexnow  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
KEY = '01234' * 6 + '01'   # a made-up key for the fake network; low entropy on purpose, so secret scanners do not flag it
TODAY = date(2026, 11, 18)
SITEMAP = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://memoryphotoandvideo.com/</loc><lastmod>2026-11-18</lastmod></url>
  <url><loc>https://memoryphotoandvideo.com/old.html</loc><lastmod>2026-09-01</lastmod></url>
  <url><loc>https://memoryphotoandvideo.com/new.html</loc><lastmod>2026-11-17</lastmod></url>
  <url><loc>https://memoryphotoandvideo.com/new.html</loc><lastmod>2026-11-17</lastmod></url>
  <url><loc>https://example.org/other.html</loc><lastmod>2026-11-18</lastmod></url>
  <url><loc>https://memoryphotoandvideo.com/nodate.html</loc></url>
</urlset>
'''
IMAGES = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>https://memoryphotoandvideo.com/new.html</loc>
    <image:image><image:loc>https://memoryphotoandvideo.com/assets/a.webp</image:loc></image:image>
    <image:image><image:loc>https://memoryphotoandvideo.com/assets/b.webp</image:loc></image:image></url>
  <url><loc>https://memoryphotoandvideo.com/</loc>
    <image:image><image:loc>https://memoryphotoandvideo.com/assets/a.webp</image:loc></image:image></url>
</urlset>
'''


def site(key_file=True, key=KEY):
    tmp = tempfile.TemporaryDirectory()
    root = Path(tmp.name)
    (root / 'sitemap.xml').write_text(SITEMAP, encoding='utf-8')
    (root / 'sitemap-images.xml').write_text(IMAGES, encoding='utf-8')
    if key_file:
        (root / f'{key}.txt').write_text(key, encoding='ascii')
    return tmp, root


def args(**kw):
    values = dict(days=1, images='changed', apply=False, wait=0)
    values.update(kw)
    return types.SimpleNamespace(**values)


class Fetch:
    """Fake network: GET of the key file and POST to the endpoint."""

    def __init__(self, key_status=200, post_status=200, key_body=KEY):
        self.calls, self.key_status, self.post_status, self.key_body = [], key_status, post_status, key_body

    def __call__(self, url, data=None, timeout=30):
        self.calls.append((url, data))
        if data is None:
            return self.key_status, self.key_body
        return self.post_status, ''

    @property
    def posts(self):
        return [json.loads(data) for url, data in self.calls if data is not None]


def go(root, a, env, fetch=None, changed=lambda root, since: {'assets/a.webp'}):
    fetch = fetch or Fetch()
    out = io.StringIO()
    with redirect_stdout(out):
        code = indexnow.run(root, a, env=env, fetch=fetch, sleep=lambda s: None, today=TODAY, changed=changed)
    return code, out.getvalue(), fetch


class Selection(unittest.TestCase):
    def test_pages_within_the_window_only_this_host_each_once(self):
        tmp, root = site()
        with tmp:
            pages = indexnow.sitemap_pages(root)
        urls = indexnow.changed_pages(pages, TODAY, 1)
        self.assertEqual(urls, ['https://memoryphotoandvideo.com/', 'https://memoryphotoandvideo.com/new.html', 'https://memoryphotoandvideo.com/nodate.html'])
        self.assertEqual(len(indexnow.changed_pages(pages, TODAY, 0)), 4)      # 0 = every page (still one each, same host)

    def test_image_modes(self):
        tmp, root = site()
        with tmp:
            changed = lambda r, since: {'assets/b.webp'}
            self.assertEqual(indexnow.pick_images(root, 'none', TODAY, 1, changed), [])
            self.assertEqual(indexnow.pick_images(root, 'changed', TODAY, 1, changed), ['https://memoryphotoandvideo.com/assets/b.webp'])
            self.assertEqual(len(indexnow.pick_images(root, 'all', TODAY, 1, changed)), 2)
            self.assertEqual(len(indexnow.pick_images(root, 'changed', TODAY, 0, changed)), 2)   # days 0 means everything


class Run(unittest.TestCase):
    def test_no_secret_is_a_green_notice_and_sends_nothing(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(apply=True), {})
        self.assertEqual(code, 0)
        self.assertIn('::notice::INDEXNOW_KEY is not set', out)
        self.assertEqual(fetch.calls, [])

    def test_default_is_a_dry_run(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(), {'INDEXNOW_KEY': KEY})
        self.assertEqual(code, 0)
        self.assertIn('dry run', out)
        self.assertEqual(fetch.calls, [])

    def test_apply_checks_the_key_file_then_posts_pages_and_images(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(apply=True), {'INDEXNOW_KEY': KEY})
        self.assertEqual(code, 0)
        self.assertEqual(fetch.calls[0][0], f'https://memoryphotoandvideo.com/{KEY}.txt')
        body = fetch.posts[0]
        self.assertEqual(body['host'], 'memoryphotoandvideo.com')
        self.assertEqual(body['key'], KEY)
        self.assertEqual(body['keyLocation'], f'https://memoryphotoandvideo.com/{KEY}.txt')
        self.assertEqual(body['urlList'], ['https://memoryphotoandvideo.com/', 'https://memoryphotoandvideo.com/new.html',
                                           'https://memoryphotoandvideo.com/nodate.html', 'https://memoryphotoandvideo.com/assets/a.webp'])

    def test_the_key_is_never_printed(self):
        for status in (200, 202, 403, 429, 503, 0):
            tmp, root = site()
            with tmp:
                code, out, _ = go(root, args(apply=True), {'INDEXNOW_KEY': KEY}, Fetch(post_status=status))
            self.assertNotIn(KEY, out, f'key printed for HTTP {status}')
        tmp, root = site(key_file=False)
        with tmp:
            code, out, _ = go(root, args(apply=True), {'INDEXNOW_KEY': KEY})
        self.assertNotIn(KEY, out)

    def test_exit_codes_of_the_answers(self):
        expected = {200: 0, 202: 0, 429: 0, 500: 0, 0: 0, 400: 1, 403: 1, 422: 1}
        for status, want in expected.items():
            tmp, root = site()
            with tmp:
                code, out, _ = go(root, args(apply=True), {'INDEXNOW_KEY': KEY}, Fetch(post_status=status))
            self.assertEqual(code, want, f'HTTP {status}')

    def test_a_secret_without_a_matching_key_file_is_an_error(self):
        tmp, root = site(key_file=False)
        with tmp:
            code, out, fetch = go(root, args(apply=True), {'INDEXNOW_KEY': KEY})
        self.assertEqual(code, 2)
        self.assertIn('::error::', out)
        self.assertEqual(fetch.calls, [])

    def test_an_invalid_key_is_refused_before_anything_else(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(apply=True), {'INDEXNOW_KEY': 'no good!'})
        self.assertEqual(code, 2)
        self.assertEqual(fetch.calls, [])

    def test_a_site_that_does_not_serve_the_key_is_an_error_and_nothing_is_posted(self):
        for bad in (Fetch(key_status=404, key_body=''), Fetch(key_status=200, key_body='something else')):
            tmp, root = site()
            with tmp:
                code, out, _ = go(root, args(apply=True), {'INDEXNOW_KEY': KEY}, bad)
            self.assertEqual(code, 2)
            self.assertEqual(bad.posts, [])

    def test_an_unreachable_site_is_only_a_warning(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(apply=True), {'INDEXNOW_KEY': KEY}, Fetch(key_status=0, key_body=''))
        self.assertEqual(code, 0)
        self.assertIn('::warning::', out)
        self.assertEqual(fetch.posts, [])

    def test_large_lists_are_sent_in_batches(self):
        tmp, root = site()
        with tmp:
            original = indexnow.BATCH
            indexnow.BATCH = 2
            try:
                code, out, fetch = go(root, args(apply=True), {'INDEXNOW_KEY': KEY})
            finally:
                indexnow.BATCH = original
        self.assertEqual([len(post['urlList']) for post in fetch.posts], [2, 2])

    def test_nothing_changed_sends_nothing(self):
        tmp, root = site()
        with tmp:
            code, out, fetch = go(root, args(apply=True, images='none'), {'INDEXNOW_KEY': KEY}, changed=lambda r, s: set())
            (root / 'sitemap.xml').write_text(SITEMAP.replace('2026-11-18', '2026-01-01').replace('2026-11-17', '2026-01-01').replace('<loc>https://memoryphotoandvideo.com/nodate.html</loc>', ''), encoding='utf-8')
            code, out, fetch = go(root, args(apply=True, images='none'), {'INDEXNOW_KEY': KEY})
        self.assertEqual(code, 0)
        self.assertIn('nothing to send', out)
        self.assertEqual(fetch.calls, [])


class Repository(unittest.TestCase):
    """The checked-in key file, the workflow and the scripts agree with each other."""

    def key_files(self):
        return [path for path in REPO.glob('*.txt') if re.fullmatch(r'[0-9a-f]{32}\.txt', path.name)]

    def test_exactly_one_public_key_file_whose_content_is_its_name(self):
        files = self.key_files()
        self.assertEqual(len(files), 1, 'the site root needs exactly one <key>.txt')
        self.assertTrue(files[0].read_text(encoding='ascii').strip() == files[0].stem, 'key file content must equal its name')   # no assertEqual: it would print the key

    def test_the_key_appears_nowhere_else_in_the_repository(self):
        key = self.key_files()[0].stem
        for path in REPO.rglob('*'):
            parts = path.relative_to(REPO).parts
            if not path.is_file() or '.git' in parts or '__pycache__' in parts or path.suffix in ('.webp', '.png', '.jpg', '.ico', '.woff2', '.mp4'):
                continue
            if path.name == f'{key}.txt':
                continue
            self.assertFalse(key in path.read_text(encoding='utf-8', errors='ignore'), f'the key is written in {path.relative_to(REPO)}')   # no assertNotIn: it would print the key

    def test_workflow_reads_the_secret_runs_the_script_and_is_dry_by_default(self):
        text = (REPO / '.github/workflows/indexnow.yml').read_text(encoding='utf-8')
        self.assertIn('secrets.INDEXNOW_KEY', text)
        self.assertIn('scripts/indexnow.py', text)
        self.assertIn('workflows: ["Build SEO sitemap"]', text)
        self.assertRegex(text, r'uses: actions/checkout@[0-9a-f]{40}')          # pinned by SHA like the other workflows
        self.assertNotRegex(text, r'echo[^\n]*INDEXNOW_KEY')                    # never echoed
        self.assertNotIn('set -x', text)
        try:
            import yaml
        except ImportError:
            return
        data = yaml.safe_load(text)
        triggers = data.get('on', data.get(True))
        self.assertIs(triggers['workflow_dispatch']['inputs']['apply']['default'], False)
        self.assertEqual(triggers['workflow_run']['types'], ['completed'])
        self.assertEqual(data['permissions'], {'contents': 'read'})

    def test_the_sitemap_workflow_still_runs_the_generators_and_tests(self):
        text = (REPO / '.github/workflows/build-sitemap.yml').read_text(encoding='utf-8')
        for needle in ('scripts/link_weddings.py', 'scripts/build_sitemap.py', 'scripts/validate_seo.py', 'scripts/check_links.py',
                       'scripts/link_weddings_test.py', 'scripts/indexnow_test.py'):
            self.assertIn(needle, text)
        self.assertLess(text.index('run: python3 scripts/link_weddings.py'), text.index('run: python3 scripts/build_sitemap.py'))

    def test_robots_txt_lists_every_sitemap_and_the_key_is_not_a_page(self):
        robots = (REPO / 'robots.txt').read_text(encoding='utf-8')
        for sitemap in REPO.glob('*sitemap*.xml'):
            self.assertIn(f'Sitemap: https://memoryphotoandvideo.com/{sitemap.name}', robots)
        self.assertNotRegex((REPO / 'sitemap.xml').read_text(encoding='utf-8'), r'[0-9a-f]{32}\.txt')


if __name__ == '__main__':
    unittest.main()
