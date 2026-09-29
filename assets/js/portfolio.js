/* Portfolio gallery: "load more" pagination and the photo viewer (lightbox).
   The first batch of photos is visible in the HTML; the rest is revealed on demand. */
(() => {
  'use strict';

  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const isEnglish = location.pathname.startsWith('/en/') || new URLSearchParams(location.search).get('lang') === 'en';
  const say = (bg, en) => (isEnglish ? en : bg);
  const items = [...gallery.querySelectorAll('.gallery-item')];
  const BATCH = 48;

  /* ---------- Load more ---------- */
  const total = items.length;
  let shown = items.filter(item => !item.hidden).length;

  document.querySelectorAll('.portfolio-gallery-controls').forEach(node => node.remove());
  if (total > shown) {
    const controls = document.createElement('div');
    controls.className = 'portfolio-gallery-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', say('Още снимки от портфолиото', 'More portfolio photos'));

    const status = document.createElement('p');
    status.className = 'portfolio-gallery-status';
    status.id = 'portfolioGalleryStatus';
    status.setAttribute('aria-live', 'polite');

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'portfolio-load-more';
    more.textContent = say('Вижте още снимки', 'Load more photos');

    const update = () => {
      status.textContent = say(`Показани ${shown} от ${total} снимки`, `Showing ${shown} of ${total} photos`);
      more.hidden = shown >= total;
    };

    more.addEventListener('click', () => {
      const end = Math.min(shown + BATCH, total);
      for (let i = shown; i < end; i += 1) items[i].hidden = false;
      shown = end;
      update();
    });

    controls.append(status, more);
    gallery.insertAdjacentElement('afterend', controls);
    gallery.setAttribute('aria-describedby', status.id);
    update();
  }

  /* ---------- Photo viewer ---------- */
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  const closeButton = document.getElementById('lightboxClose');
  const prevButton = document.getElementById('lightboxPrev');
  const nextButton = document.getElementById('lightboxNext');
  const backButton = document.getElementById('lightboxBack');
  const counter = document.getElementById('lightboxCount');
  if (!lightbox || !image || !closeButton) return;

  let index = -1;
  let trigger = null;
  let token = 0;

  const visibleItems = () => items.filter(item => !item.hidden);
  const isOpen = () => lightbox.classList.contains('open');
  const preload = src => { if (src) { const warm = new Image(); warm.decoding = 'async'; warm.src = src; } };

  const render = () => {
    const list = visibleItems();
    const item = list[index];
    if (!item) return;
    const thumb = item.querySelector('img');
    const mine = ++token;
    const loader = new Image();
    image.classList.add('is-loading');
    const done = failed => {
      if (mine !== token) return;
      image.src = failed ? (thumb?.currentSrc || thumb?.src || '') : loader.src;
      image.alt = thumb?.alt || '';
      image.classList.remove('is-loading');
    };
    loader.onload = () => done(false);
    loader.onerror = () => done(true);
    loader.src = item.dataset.image || thumb?.currentSrc || thumb?.src || '';

    if (counter) counter.textContent = `${index + 1} / ${list.length}`;
    const single = list.length < 2;
    if (prevButton) prevButton.hidden = single;
    if (nextButton) nextButton.hidden = single;
    if (!single) {
      preload(list[(index + 1) % list.length].dataset.image);
      preload(list[(index - 1 + list.length) % list.length].dataset.image);
    }
  };

  const step = delta => {
    const count = visibleItems().length;
    if (count < 2) return;
    index = (index + delta + count) % count;
    render();
  };

  const open = item => {
    index = visibleItems().indexOf(item);
    if (index < 0) return;
    trigger = item;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    render();
    closeButton.focus();
  };

  const close = () => {
    if (!isOpen()) return;
    token += 1;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (trigger && trigger.isConnected && !trigger.hidden) trigger.focus({ preventScroll: true });
    trigger = null;
  };

  gallery.addEventListener('click', event => {
    const item = event.target.closest('.gallery-item');
    if (!item || !gallery.contains(item)) return;
    event.preventDefault();
    open(item);
  });

  closeButton.addEventListener('click', close);
  backButton?.addEventListener('click', close);
  prevButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });

  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); return; }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); return; }
    if (event.key !== 'Tab') return;
    // Keep keyboard focus inside the open viewer.
    const focusable = [closeButton, prevButton, nextButton, backButton].filter(node => node && !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (!lightbox.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
  });

  // Swipe left/right on touch screens.
  let startX = null;
  let startY = 0;
  lightbox.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { startX = null; return; }
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    if (startX === null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
