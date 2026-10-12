// Run: node --test scripts/events.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function load() {
  const listeners = [];
  const sandbox = {
    location: { protocol: 'https:', hostname: 'memoryphotoandvideo.com', pathname: '/uslugi-ceni.html', href: 'https://memoryphotoandvideo.com/' },
    document: { addEventListener: (type, fn) => listeners.push({ type, fn }) },
    URL, console,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8'), sandbox);
  return { sandbox, listeners };
}

test('classifies links', () => {
  const { sandbox: w } = load();
  const host = 'memoryphotoandvideo.com';
  assert.equal(w.mpvEventForLink('tel:+359000', host), 'contact_phone_click');
  assert.equal(w.mpvEventForLink('mailto:a@b.bg', host), 'contact_email_click');
  assert.equal(w.mpvEventForLink('https://wa.me/359', host), 'contact_whatsapp_click');
  assert.equal(w.mpvEventForLink('https://m.me/x', host), 'contact_messenger_click');
  assert.equal(w.mpvEventForLink('https://www.instagram.com/memoryphotoandvideo/', host), 'social_click');
  assert.equal(w.mpvEventForLink('https://www.facebook.com/MemoryPhotoAndVideo/', host), 'social_click');
  assert.equal(w.mpvEventForLink('https://www.google.com/maps/search/?api=1&query=x', host), 'google_reviews_click');
  assert.equal(w.mpvEventForLink('availability.html', host), 'availability_cta_click');
  assert.equal(w.mpvEventForLink('/en/availability.html', host), 'availability_cta_click');
  assert.equal(w.mpvEventForLink('portfolio.html', host), null);
  assert.equal(w.mpvEventForLink('https://example.org/availability.html', host), null);
  assert.equal(w.mpvEventForLink('http://[bad', host), null);
});

test('mpvTrack sends only when gtag exists and statistics are not disabled', () => {
  const { sandbox: w } = load();
  assert.equal(w.mpvTrack('social_click'), false);           // no consent: gtag is undefined
  const calls = [];
  w.gtag = (...args) => calls.push(args);
  assert.equal(w.mpvTrack('generate_lead', { form_id: 'x' }), true);
  assert.deepEqual(calls[0], ['event', 'generate_lead', { form_id: 'x' }]);
  w['ga-disable-G-WJK01GL7PM'] = true;                        // consent withdrawn
  assert.equal(w.mpvTrack('generate_lead'), false);
});

test('click handler reports a social link click', () => {
  const { sandbox: w, listeners } = load();
  const calls = [];
  w.gtag = (...args) => calls.push(args);
  const click = listeners.filter(l => l.type === 'click').pop().fn;
  const a = { getAttribute: () => 'https://www.instagram.com/memoryphotoandvideo/', href: 'https://www.instagram.com/memoryphotoandvideo/' };
  click({ target: { closest: () => a } });
  assert.equal(calls[0][1], 'social_click');
  click({ target: { closest: () => null } });
  assert.equal(calls.length, 1);
});
