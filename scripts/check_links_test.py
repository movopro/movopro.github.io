"""Tests for check_links.py: run with `python3 scripts/check_links_test.py`."""
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_links  # noqa: E402


def site(files):
    tmp = tempfile.TemporaryDirectory()
    root = Path(tmp.name)
    for rel, text in files.items():
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
    return tmp, root


class CheckLinks(unittest.TestCase):
    def test_clean_site_has_no_problems(self):
        tmp, root = site({
            'index.html': '<a href="about.html#team">x</a><a href="/en/">e</a><img src="/a.png" srcset="/a.png 1x, b.png 2x">',
            'about.html': '<h2 id="team">t</h2>',
            'en/index.html': '<a href="../index.html">bg</a>',
            'a.png': 'x', 'b.png': 'x',
        })
        with tmp:
            problems, _ = check_links.check_internal(root)
        self.assertEqual(problems, [])

    def test_missing_file_anchor_and_image_are_reported(self):
        tmp, root = site({
            'index.html': '<a href="gone.html">g</a><a href="about.html#nope">a</a><img src="/missing.webp"><script src="x.js"></script>',
            'about.html': '<h2 id="team">t</h2>',
        })
        with tmp:
            problems, _ = check_links.check_internal(root)
        text = '\n'.join(problems)
        self.assertIn('gone.html -> file not found', text)
        self.assertIn('anchor #nope', text)
        self.assertIn('/missing.webp -> file not found', text)
        self.assertIn('x.js -> file not found', text)

    def test_base_href_changes_resolution(self):
        tmp, root = site({
            'en/index.html': '<base href="/"><link rel="stylesheet" href="assets/s.css">',
            'assets/s.css': 'x',
        })
        with tmp:
            problems, _ = check_links.check_internal(root)
        self.assertEqual(problems, [])

    def test_excluded_files_count_as_missing(self):
        tmp, root = site({
            'index.html': '<img src="/private/p.jpg">',
            '_config.yml': 'exclude:\n  - private\n',
            'private/p.jpg': 'x',
        })
        with tmp:
            problems, _ = check_links.check_internal(root)
        self.assertEqual(len(problems), 1)

    def test_external_and_special_schemes_are_collected_not_failed(self):
        tmp, root = site({
            'index.html': '<a href="https://example.org/x#y">e</a><a href="mailto:a@b.c">m</a><a href="tel:+1">t</a>',
        })
        with tmp:
            problems, external = check_links.check_internal(root)
        self.assertEqual(problems, [])
        self.assertEqual(list(external), ['https://example.org/x'])


if __name__ == '__main__':
    unittest.main()
