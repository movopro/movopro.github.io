// Memory Photo & Video - a quick-contact bar on phones and the "?date=" prefill of the inquiry form.
// Why: the only way to ask for a date used to be the form on the prices page, four screens away from where a couple decides.
// The bar is always available on small screens; call / Viber / WhatsApp buttons appear when assets/js/contact-config.js has numbers.
(function () {
  'use strict';
  var EN = location.pathname.indexOf('/en/') === 0 || new URLSearchParams(location.search).get('lang') === 'en';
  var FORM_PAGE = (EN ? '/en/' : '/') + 'uslugi-ceni.html';
  var cfg = window.MPV_CONTACT || {};
  var digits = function (value) { return String(value || '').replace(/\D+/g, ''); };

  function track(method) {
    if (typeof window.mpvTrack === 'function') window.mpvTrack('contact_click', { method: method, page: location.pathname });
  }

  function addStyle() {
    var css = [
      '.mpv-cbar{position:fixed;left:0;right:0;bottom:0;z-index:1100;display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));',
      'background:rgba(8,12,18,.96);border-top:1px solid rgba(117,165,232,.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.mpv-cbar[hidden]{display:none}',
      '.mpv-cbar a{flex:1 1 0;min-height:46px;display:flex;align-items:center;justify-content:center;padding:0 12px;border-radius:999px;',
      'font-family:inherit;font-weight:600;font-size:.95rem;line-height:1;text-decoration:none;color:#f5f7fb;border:1px solid rgba(117,165,232,.45);background:rgba(20,34,55,.9)}',
      '.mpv-cbar a.mpv-cbar__main{background:#75a5e8;color:#12100c;border-color:#75a5e8;flex:1.6 1 0}',
      '.mpv-cbar a:focus-visible{outline:3px solid #fff;outline-offset:2px}',
      'body.has-mpv-cbar{padding-bottom:calc(70px + env(safe-area-inset-bottom))}',
      '@media (min-width:768px){.mpv-cbar{display:none}body.has-mpv-cbar{padding-bottom:0}}',
      '@media print{.mpv-cbar{display:none}}'
    ].join('');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function makeLink(label, href, method, main) {
    var a = document.createElement('a');
    a.textContent = label;
    a.href = href;
    if (main) a.className = 'mpv-cbar__main';
    if (/^https?:/.test(href)) { a.rel = 'noopener noreferrer'; a.target = '_blank'; }
    a.addEventListener('click', function () { track(method); });
    return a;
  }

  function buildBar() {
    if (document.querySelector('.mpv-cbar')) return;
    var bar = document.createElement('nav');
    bar.className = 'mpv-cbar';
    bar.setAttribute('aria-label', EN ? 'Quick contact' : 'Бърза връзка');
    var phone = digits(cfg.phone), viber = digits(cfg.viber), whatsapp = digits(cfg.whatsapp);
    if (phone) bar.appendChild(makeLink(EN ? 'Call' : 'Обади се', 'tel:+' + phone, 'phone', false));
    if (viber) bar.appendChild(makeLink('Viber', 'viber://chat?number=%2B' + viber, 'viber', false));
    if (whatsapp) bar.appendChild(makeLink('WhatsApp', 'https://wa.me/' + whatsapp, 'whatsapp', false));
    bar.appendChild(makeLink(EN ? 'Send an inquiry' : 'Запитване за дата', FORM_PAGE + '?from=bar#inquirySection', 'inquiry', true));
    document.body.appendChild(bar);
    document.body.classList.add('has-mpv-cbar');

    // Stay out of the way: hide while the cookie notice is up and while the inquiry form itself is on screen.
    var form = document.getElementById('inquirySection');
    var refresh = function () {
      var formVisible = false;
      if (form) { var r = form.getBoundingClientRect(); formVisible = r.top < window.innerHeight - 70 && r.bottom > 0; }
      bar.hidden = formVisible || !!document.querySelector('.mpv-consent');
    };
    var queued = false;
    var schedule = function () { if (queued) return; queued = true; window.setTimeout(function () { queued = false; refresh(); }, 80); };
    if (form) { window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); }
    new MutationObserver(schedule).observe(document.body, { childList: true });
    refresh();
  }

  function prefillDate() {
    var date = new URLSearchParams(location.search).get('date');
    var field = document.getElementById('eventDate');
    if (!field || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return;
    var day = new Date(date + 'T00:00:00');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (isNaN(day.getTime()) || day < today) return;            // a past or impossible date is ignored, never copied into the form
    field.value = date;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function start() {
    addStyle();
    buildBar();
    prefillDate();
    if (location.hash === '#inquirySection') {
      var target = document.getElementById('inquirySection');
      // jump, do not glide: the page has scroll-behavior:smooth and the form is thousands of pixels down
      if (target) setTimeout(function () { target.scrollIntoView({ block: 'start', behavior: 'instant' }); }, 300);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
