"""Tests for link_weddings.py: run with `python3 scripts/link_weddings_test.py`."""
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import link_weddings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def story(name, eyebrow='Сватбена история'):
    return (f'<html><body><main><div class="wedding-story__wrap"><span class="wedding-story__eyebrow">{eyebrow}</span>'
            f'<h1>{name}</h1></div></main></body></html>')


CITY = '<html><body><main><div><section class="local-section">x</section>\n<section class="local-cta v2-reveal">y</section></div></main></body></html>'
HUB = ('<a href="weddings/b-two.html">b</a><a href="weddings/a-one.html">a</a>')


def site(files):
    tmp = tempfile.TemporaryDirectory()
    root = Path(tmp.name)
    for rel, text in files.items():
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
    return tmp, root


def apply(root):
    for rel, text in link_weddings.plan(root).items():
        (root / rel).write_text(text, encoding='utf-8')


FILES = {
    'videos.html': HUB,
    'weddings/a-one.html': story('Ann &amp; One'),
    'weddings/b-two.html': story('Bea &amp; Two', 'Сватбена история · Родопите'),
    'weddings/c-three.html': story('Cleo &amp; Three'),
    'svatben-fotograf-plovdiv.html': CITY,
    'svatben-fotograf-smolyan.html': CITY,
}


class LinkWeddings(unittest.TestCase):
    def test_every_story_links_to_the_others_but_not_itself(self):
        tmp, root = site(FILES)
        with tmp:
            apply(root)
            text = (root / 'weddings/a-one.html').read_text(encoding='utf-8')
        self.assertIn('href="/weddings/b-two.html">Bea &amp; Two</a>', text)
        self.assertIn('href="/weddings/c-three.html">Cleo &amp; Three</a>', text)
        self.assertNotIn('href="/weddings/a-one.html"', text)
        self.assertIn('Още сватбени истории', text)

    def test_hub_order_first_then_other_pages_alphabetically(self):
        tmp, root = site(FILES)
        with tmp:
            self.assertEqual(link_weddings.story_order(root), ['b-two', 'a-one', 'c-three'])

    def test_city_pages_list_every_story_before_the_call_to_action(self):
        tmp, root = site(FILES)
        with tmp:
            apply(root)
            text = (root / 'svatben-fotograf-plovdiv.html').read_text(encoding='utf-8')
        for slug in ('a-one', 'b-two', 'c-three'):
            self.assertIn(f'href="/weddings/{slug}.html"', text)
        self.assertIn('href="/videos.html"', text)
        self.assertLess(text.index(link_weddings.END), text.index('local-cta'))
        self.assertNotIn('Родопите', text)          # no place is claimed for a city whose story is not named

    def test_only_the_smolyan_page_names_the_rhodope_story(self):
        files = dict(FILES)
        files['weddings/ralitsa-hristos.html'] = story('Ralitsa &amp; Hristos', 'Сватбена история · Родопите')
        tmp, root = site(files)
        with tmp:
            apply(root)
            smolyan = (root / 'svatben-fotograf-smolyan.html').read_text(encoding='utf-8')
            plovdiv = (root / 'svatben-fotograf-plovdiv.html').read_text(encoding='utf-8')
        self.assertIn('история от Родопите — <a href="/weddings/ralitsa-hristos.html">Ralitsa &amp; Hristos</a>', smolyan)
        self.assertNotIn('Родопите', plovdiv)

    def test_rhodope_claim_needs_the_story_to_say_it(self):
        files = dict(FILES)
        files['weddings/ralitsa-hristos.html'] = story('Ralitsa &amp; Hristos')   # eyebrow no longer says Родопите
        tmp, root = site(files)
        with tmp, self.assertRaises(SystemExit):
            link_weddings.plan(root)

    def test_second_run_changes_nothing_and_a_new_story_is_picked_up(self):
        tmp, root = site(FILES)
        with tmp:
            apply(root)
            self.assertEqual(link_weddings.plan(root), {})
            (root / 'weddings/d-four.html').write_text(story('Dan &amp; Four'), encoding='utf-8')
            changed = link_weddings.plan(root)
            self.assertIn('weddings/a-one.html', changed)
            self.assertIn('svatben-fotograf-plovdiv.html', changed)
            self.assertIn('href="/weddings/d-four.html"', changed['svatben-fotograf-plovdiv.html'])
            self.assertEqual(changed['svatben-fotograf-plovdiv.html'].count(link_weddings.START), 1)

    def test_check_mode_reports_without_writing(self):
        tmp, root = site(FILES)
        with tmp:
            before = (root / 'weddings/a-one.html').read_text(encoding='utf-8')
            self.assertEqual(sorted(link_weddings.plan(root)), sorted(set(FILES) - {'videos.html'}))
            self.assertEqual((root / 'weddings/a-one.html').read_text(encoding='utf-8'), before)

    def test_the_real_site_is_up_to_date(self):
        """The checked-in pages already carry the blocks (the sitemap workflow would otherwise have to commit them)."""
        self.assertEqual(link_weddings.plan(ROOT), {}, 'run python3 scripts/link_weddings.py and commit the result')


if __name__ == '__main__':
    unittest.main()
