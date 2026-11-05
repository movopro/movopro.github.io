// Memory Booth: (1) the looping animation plays only while it is on screen, and never for a visitor who asked for less motion (the poster stays);
// (2) the "Photobooth inquiry" button on the pricing page opens the inquiry form with the offer filled in (the same way the package buttons do).
(() => {
  const en = new URLSearchParams(location.search).get('lang') === 'en' || location.pathname.startsWith('/en/');

  const video = document.querySelector('[data-pb-video]');
  if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const watcher = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) video.play().catch(() => {});           // a blocked autoplay just leaves the poster
        else video.pause();
      }
    }, { threshold: 0.3 });
    watcher.observe(video);
  }

  const button = document.querySelector('[data-photobooth-inquiry]');
  if (!button) return;
  button.addEventListener('click', () => {
    const q = (id) => document.getElementById(id);
    const type = q('inquiryType'), selected = q('selectedOffer'), summary = q('inquirySummary'), section = q('inquirySection');
    if (type) type.value = 'Фотобудка';
    if (selected) selected.value = en ? 'Photobooth — from 90 € per hour, minimum 2 hours' : 'Фотобудка — от 90 € на час, минимум 2 часа';
    if (summary) summary.value = en ? 'Selected offer: Photobooth\nPrice: from 90 € per hour, minimum 2 hours\nType: Photobooth' : 'Избрана оферта: Фотобудка\nЦена: от 90 € на час, минимум 2 часа\nТип: Фотобудка';
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section?.focus({ preventScroll: true });
  });
})();
