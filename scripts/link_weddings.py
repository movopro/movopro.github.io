"""Keep the wedding stories (weddings/*.html) linked from the pages that should lead to them (stdlib only).

Why: every wedding watch page used to have exactly one inbound link, from videos.html. Search Console 2026-11-18 reported
weddings/valeria-yanko.html as "URL is unknown to Google" (the five siblings were indexed). Two bounded, deterministic blocks fix that:

  * every wedding page ends with "Още сватбени истории": links to the OTHER stories (siblings, in videos.html order);
  * every city landing page (svatben-fotograf-*.html) gets a "Сватбени филми и истории" section with the stories. Only the
    Smolyan page names a place, and only because the story's own page says "Родопите" (see REGION_STORY).

The blocks sit between marker comments, so a run rewrites them in place (idempotent) and a new weddings/<name>.html is picked up
on the next run. The Build SEO sitemap workflow runs this script before it builds the sitemaps.

Usage:
    python3 scripts/link_weddings.py           # write the blocks where they are missing or out of date
    python3 scripts/link_weddings.py --check   # change nothing; exit 1 when a file would change
"""
from pathlib import Path
import re
import sys

START = '<!-- wedding-stories:start -->'
END = '<!-- wedding-stories:end -->'
CITY_GLOB = 'svatben-fotograf-*.html'
# City page -> (story slug, the word the story's own page must contain for the claim to be true).
REGION_STORY = {'svatben-fotograf-smolyan.html': ('ralitsa-hristos', 'Родопите')}
WEDDING_LINK = re.compile(r'href="/?weddings/([a-z0-9-]+)\.html"')
BLOCK = re.compile(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', re.S)


def story_order(root: Path):
    """Slugs of every wedding page: videos.html order first (the hub's order), any other page after it, alphabetically."""
    pages = sorted(path.stem for path in (root / 'weddings').glob('*.html'))
    hub = (root / 'videos.html').read_text(encoding='utf-8') if (root / 'videos.html').exists() else ''
    ordered = []
    for slug in WEDDING_LINK.findall(hub):
        if slug in pages and slug not in ordered:
            ordered.append(slug)
    return ordered + [slug for slug in pages if slug not in ordered]


def story_name(root: Path, slug: str) -> str:
    """Couple names exactly as the story's own H1 writes them (already HTML-escaped there)."""
    text = (root / 'weddings' / f'{slug}.html').read_text(encoding='utf-8')
    match = re.search(r'<h1>([^<]+)</h1>', text)
    if not match:
        raise SystemExit(f'weddings/{slug}.html has no plain-text <h1>')
    return match.group(1).strip()


def story_link(root: Path, slug: str) -> str:
    return f'<a href="/weddings/{slug}.html">{story_name(root, slug)}</a>'


def wedding_block(root: Path, slug: str, slugs) -> str:
    links = ''.join(story_link(root, other).replace('<a ', '<a class="ghost" ') for other in slugs if other != slug)
    return (f'{START}\n<section class="wedding-story__more"><h2 class="wedding-story__gallery-title">Още сватбени истории</h2>'
            f'<nav class="wedding-story__actions" aria-label="Още сватбени истории">{links}</nav></section>\n{END}\n')


def city_block(root: Path, city_file: str, slugs) -> str:
    special = REGION_STORY.get(city_file)
    if special and special[0] in slugs:
        slug, word = special
        if word not in (root / 'weddings' / f'{slug}.html').read_text(encoding='utf-8'):
            raise SystemExit(f'weddings/{slug}.html no longer says "{word}": update REGION_STORY in scripts/link_weddings.py')
        rest = ', '.join(story_link(root, other) for other in slugs if other != slug)
        intro = (f'Гледайте сватбената ни история от Родопите — {story_link(root, slug)} — и още трейлъри и тийзъри: {rest}.'
                 if rest else f'Гледайте сватбената ни история от Родопите — {story_link(root, slug)}.')
    else:
        intro = 'Гледайте сватбените ни трейлъри и тийзъри: ' + ', '.join(story_link(root, slug) for slug in slugs) + '.'
    return (f'{START}\n<section class="local-section v2-reveal"><span class="v2-eyebrow">Сватбени филми</span>'
            f'<h2>Сватбени филми и истории</h2><div class="local-copy"><p>{intro} Всички филми са на страницата '
            f'<a href="/videos.html">Сватбено видео</a>.</p></div></section>\n{END}\n')


def place(text: str, block: str, anchor: str, last: bool) -> str:
    """Replace the marked block, or insert it before `anchor` (the last occurrence when `last`, else the first)."""
    if START in text:
        return BLOCK.sub(lambda _: block, text, count=1)
    index = text.rfind(anchor) if last else text.find(anchor)
    if index < 0:
        raise SystemExit(f'anchor {anchor!r} not found')
    return text[:index] + block + text[index:]


def plan(root: Path):
    """{relative path: new text} for every file whose blocks are missing or out of date."""
    slugs = story_order(root)
    changes = {}
    for slug in slugs:
        path = root / 'weddings' / f'{slug}.html'
        old = path.read_text(encoding='utf-8')
        new = place(old, wedding_block(root, slug, slugs), '</div></main>', last=True)
        if new != old:
            changes[path.relative_to(root).as_posix()] = new
    for path in sorted(root.glob(CITY_GLOB)):
        old = path.read_text(encoding='utf-8')
        new = place(old, city_block(root, path.name, slugs), '<section class="local-cta', last=False)
        if new != old:
            changes[path.relative_to(root).as_posix()] = new
    return changes


def main(argv):
    root = Path(__file__).resolve().parent.parent
    changes = plan(root)
    if '--check' in argv:
        for rel in changes:
            print(f'out of date: {rel} (run python3 scripts/link_weddings.py)')
        return 1 if changes else 0
    for rel, text in changes.items():
        (root / rel).write_text(text, encoding='utf-8', newline='')
        print(f'updated {rel}')
    print(f'{len(changes)} file(s) updated, {len(story_order(root))} wedding stories.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
