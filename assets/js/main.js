document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('nav');
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('[data-tilt]');
  const heroBg = document.querySelector('.hero__bg');
  const heroImage = document.querySelector('.hero__frame img');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuToggle && nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { menuToggle.checked = false; });
    });
  }

  const reviewNote = document.querySelector('.v2-review-note');
  if (reviewNote) {
    reviewNote.textContent = 'Публичният Google рейтинг в момента е 5.0/5 от 21 отзива.';
  }

  const revealItems = document.querySelectorAll('.v2-reveal');
  if (revealItems.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(el => el.classList.add('v2-visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v2-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
      revealItems.forEach(el => observer.observe(el));
    }
  }

  /* English pages: make sure the original calculator logic is executed after dynamic page loading. */
  const isEnglishPage = location.pathname.startsWith('/en/');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  if (isEnglishPage && currentPage === 'uslugi-ceni.html') {
    setTimeout(async () => {
      const total = document.getElementById('totalEUR');
      if (!total || total.textContent.trim() !== '0€') return;
      try {
        const html = await fetch('/uslugi-ceni.html', { cache: 'no-store' }).then(r => r.text());
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const scripts = Array.from(doc.querySelectorAll('script:not([src])'));
        const pricingScript = scripts.find(s => s.textContent.includes('const PRICES') && s.textContent.includes('calcWedding'));
        if (!pricingScript) return;
        const script = document.createElement('script');
        script.textContent = pricingScript.textContent;
        document.body.appendChild(script);
      } catch (error) {
        console.warn('English pricing runtime could not be restored.', error);
      }
    }, 250);
  }

  /* Homepage: keep both people visible and center the hero copy. */
  const homeHero = document.querySelector('.home-hero');
  if (homeHero) {
    const style = document.createElement('style');
    style.textContent = `
      .home-hero{min-height:100svh;position:relative;display:block;overflow:hidden;padding:0!important;}
      .home-hero::before{background-position:center top!important;}
      .home-hero__inner{position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;display:block!important;}
      .home-hero__photo{display:none!important;}
      .home-hero__copy{position:absolute;left:50%;bottom:46px;transform:translateX(-50%);width:min(820px,calc(100% - 40px));padding:34px 36px 30px!important;border-radius:24px;background:linear-gradient(145deg,rgba(10,9,7,.78),rgba(10,9,7,.58))!important;backdrop-filter:blur(14px);box-shadow:0 24px 70px rgba(0,0,0,.48);text-align:center;}
      .home-kicker{display:block!important;text-align:center;}
      .home-hero h1{font-size:clamp(3rem,5.7vw,5.8rem)!important;max-width:18ch!important;margin:0 auto!important;line-height:1.02!important;text-wrap:balance;}
      .home-hero p{max-width:680px!important;margin:20px auto 0!important;}
      .home-actions{justify-content:center!important;margin-top:28px!important;}
      .home-socials{justify-content:center!important;margin-top:16px!important;}
      .home-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:100%;aspect-ratio:16/7;}
      .home-photo-grid a{display:block;overflow:hidden;border-radius:14px;background:#111;min-height:0;}
      .home-photo-grid img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .4s ease,filter .4s ease;}
      .home-photo-grid a:hover img{transform:scale(1.035);filter:brightness(1.04);}
      @media(max-width:900px){.home-hero__copy{bottom:28px;width:min(700px,calc(100% - 28px));}.home-hero h1{font-size:clamp(2.7rem,9vw,4.2rem)!important;}.home-photo-grid{aspect-ratio:4/3;}}
      @media(max-width:560px){.home-hero__copy{bottom:18px;padding:26px 20px 24px!important;width:calc(100% - 20px);}.home-hero h1{font-size:clamp(2.4rem,11vw,3.5rem)!important;max-width:18ch!important;}.home-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr));aspect-ratio:auto;}.home-photo-grid a{height:170px;}.home-photo-grid a:nth-child(9){display:none;}}
    `;
    document.head.appendChild(style);

    const selectedCopy = homeHero.parentElement.querySelector('.home-section .home-copy');
    if (selectedCopy) selectedCopy.textContent = 'Няколко от любимите ни кадри от истински сватбени дни.';

    const collageImg = homeHero.parentElement.querySelector('img[src="assets/weddings/selected-collage.webp"], img[src="/assets/weddings/selected-collage.webp"]');
    if (collageImg) {
      const link = collageImg.closest('a') || collageImg.parentElement;
      const grid = document.createElement('div');
      grid.className = 'home-photo-grid';
      const files = ['01.jpg','02.jpg','03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg'];
      files.forEach((file, index) => {
        const card = document.createElement('a');
        card.href = `/en/svatba-izbrani.html#kadyr-${index + 1}`;
        const img = document.createElement('img');
        img.src = `/assets/${file}`;
        img.alt = `Selected wedding photo ${index + 1}`;
        img.loading = index < 3 ? 'eager' : 'lazy';
        img.decoding = 'async';
        card.appendChild(img);
        grid.appendChild(card);
      });
      link.replaceWith(grid);
    }
  }

  if (!hero || !heroContent || reduceMotion || !canHover) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const animate = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    heroContent.style.transform = `rotateY(${currentX * 3.5}deg) rotateX(${currentY * -3.5}deg)`;
    if (heroBg) heroBg.style.transform = `scale(1.04) translate(${currentX * -8}px, ${currentY * -8}px)`;
    if (heroImage) heroImage.style.transform = `scale(1.05) translate(${currentX * -5}px, ${currentY * -5}px)`;
    rafId = requestAnimationFrame(animate);
  };

  hero.addEventListener('mousemove', event => {
    const rect = hero.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    if (!rafId) animate();
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });
});
