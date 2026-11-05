// The "Photobooth inquiry" button on the pricing page: opens the inquiry form with the offer filled in (the same way the package buttons do).
(() => {
  const en = new URLSearchParams(location.search).get('lang') === 'en' || location.pathname.startsWith('/en/');
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
