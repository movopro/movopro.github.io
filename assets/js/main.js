/* Keep visitors on the canonical secure origin. GitHub Pages should also enforce HTTPS server-side. */
if (location.protocol === 'http:' && /(^|\.)memoryphotoandvideo\.com$/i.test(location.hostname)) {
  const secureUrl = new URL(location.href);
  secureUrl.protocol = 'https:';
  location.replace(secureUrl.toString());
}

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
  const isEnglishPage = location.pathname.startsWith('/en/') || new URLSearchParams(location.search).get('lang') === 'en';
  const path = location.pathname === '/index.html' ? '/' : location.pathname;

  /* Local SEO: keep key BG pages aligned with the searches already visible in Search Console. */
  const seoPages = {
    '/': {
      title: 'Сватбен фотограф и видеограф Кърджали | Memory Photo & Video',
      description: 'Memory Photo & Video — сватбен фотограф и видеограф в Кърджали. Професионално фото и видео за сватби и събития в региона и цяла България.'
    },
    '/portfolio.html': {
      title: 'Сватбена фотография в Кърджали | Портфолио | Memory Photo & Video',
      description: 'Разгледайте сватбена фотография от Memory Photo & Video — реални сватби, емоции и детайли от Кърджали, региона и цяла България.'
    },
    '/videos.html': {
      title: 'Сватбено видео и видеограф в Кърджали | Memory Photo & Video',
      description: 'Сватбена видеография от Memory Photo & Video — сватбени филми и видео заснемане в Кърджали, региона и цяла България.'
    },
    '/uslugi-ceni.html': {
      title: 'Цени за сватбен фотограф и видеограф | Memory Photo & Video',
      description: 'Актуални цени и пакети за сватбена фотография и видеография от Memory Photo & Video. Фото и видео услуги за Кърджали и цяла България.'
    },
    '/availability.html': {
      title: 'Свободни дати за сватбен фотограф и видеограф | Memory Photo & Video',
      description: 'Проверете свободните дати за сватбено фото и видео заснемане от Memory Photo & Video и вижте актуалната заетост по месеци.'
    },
    '/about.html': {
      title: 'За Memory Photo & Video | Сватбен фотограф Кърджали',
      description: 'Запознайте се с екипа на Memory Photo & Video — фотографи и видеографи от Кърджали, които снимат сватби и събития от 2017 г.'
    }
  };

  const setMeta = (selector, value, attr = 'content') => {
    const element = document.head.querySelector(selector);
    if (element && value) element.setAttribute(attr, value);
  };

  if (!isEnglishPage && seoPages[path]) {
    const seo = seoPages[path];
    document.title = seo.title;
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);
  }

  if (!isEnglishPage) {
    const existingSchema = document.getElementById('mpv-seo-schema');
    if (existingSchema) existingSchema.remove();

    const pageName = seoPages[path]?.title?.split('|')[0].trim() || document.title.split('|')[0].trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href || `${location.origin}${path}`;
    const schema = document.createElement('script');
    schema.id = 'mpv-seo-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfessionalService',
          '@id': 'https://memoryphotoandvideo.com/#business',
          name: 'Memory Photo & Video',
          url: 'https://memoryphotoandvideo.com/',
          logo: 'https://memoryphotoandvideo.com/logo.png',
          image: 'https://memoryphotoandvideo.com/memory-og-2026.jpg',
          description: 'Сватбена фотография и видеография в Кърджали, региона и цяла България.',
          foundingDate: '2017',
          areaServed: [
            { '@type': 'City', name: 'Кърджали' },
            { '@type': 'AdministrativeArea', name: 'Област Кърджали' },
            { '@type': 'Country', name: 'България' }
          ],
          serviceType: ['Сватбена фотография', 'Сватбена видеография', 'Събитийна фотография', 'Събитийно видео'],
          sameAs: ['https://www.instagram.com/memoryphotoandvideo/', 'https://www.facebook.com/MemoryPhotoAndVideo/']
        },
        {
          '@type': 'WebSite',
          '@id': 'https://memoryphotoandvideo.com/#website',
          url: 'https://memoryphotoandvideo.com/',
          name: 'Memory Photo & Video',
          inLanguage: 'bg-BG',
          publisher: { '@id': 'https://memoryphotoandvideo.com/#business' }
        },
        {
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          url: canonical,
          name: pageName,
          isPartOf: { '@id': 'https://memoryphotoandvideo.com/#website' },
          about: { '@id': 'https://memoryphotoandvideo.com/#business' },
          inLanguage: 'bg-BG'
        }
      ]
    });
    document.head.appendChild(schema);

    /* Add a crawlable local-service path without changing the main navigation. */
    const localUrl = '/svatben-fotograf-kardzhali.html';
    if (path !== localUrl) {
      const footer = document.querySelector('.home-footer__bottom, .v2-footer, footer');
      if (footer && !footer.querySelector('[data-local-seo-link]')) {
        const separator = document.createTextNode(' · ');
        const localLink = document.createElement('a');
        localLink.href = localUrl;
        localLink.textContent = 'Сватбен фотограф Кърджали';
        localLink.dataset.localSeoLink = 'true';
        localLink.style.display = 'inline';
        localLink.style.marginLeft = '.2rem';
        footer.append(separator, localLink);
      }
    }
  }

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* Mobile navigation: keep keyboard/screen-reader state in sync and make Escape/outside-click close it. */
  if (menuToggle && nav && header) {
    const burger = document.querySelector('.burger');
    const syncMenuState = () => {
      const open = menuToggle.checked;
      menuToggle.setAttribute('aria-expanded', String(open));
      if (burger) burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    };

    const closeMenu = ({ focusToggle = false } = {}) => {
      if (!menuToggle.checked) return;
      menuToggle.checked = false;
      syncMenuState();
      if (focusToggle) menuToggle.focus();
    };

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'site-navigation');
    nav.id = nav.id || 'site-navigation';

    if (burger) {
      burger.setAttribute('aria-controls', nav.id);
      burger.setAttribute('role', 'button');
      burger.setAttribute('tabindex', '0');
      burger.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        menuToggle.checked = !menuToggle.checked;
        syncMenuState();
      });
    }

    menuToggle.addEventListener('change', syncMenuState);
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu({ focusToggle: true });
    });

    document.addEventListener('pointerdown', event => {
      if (!menuToggle.checked) return;
      if (nav.contains(event.target) || burger?.contains(event.target) || event.target === menuToggle) return;
      closeMenu();
    }, { passive: true });

    syncMenuState();
  }

  const reviewNote = document.querySelector('.v2-review-note');
  if (reviewNote) {
    reviewNote.textContent = isEnglishPage
      ? 'Our public Google rating is currently 5.0/5 from 21 reviews.'
      : 'Публичният Google рейтинг в момента е 5.0/5 от 21 отзива.';
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

  /* Homepage content enhancements. The final hero layout now lives in CSS so it is stable from first paint. */
  const homeHero = document.querySelector('.home-hero');
  if (homeHero) {
    const homeKicker = homeHero.querySelector('.home-kicker');
    if (homeKicker && !isEnglishPage) homeKicker.textContent = 'Сватбен фотограф и видеограф · Кърджали';

    const selectedCopy = homeHero.parentElement?.querySelector('.home-section .home-copy');
    if (selectedCopy) {
      selectedCopy.textContent = isEnglishPage
        ? 'Some of our favourite frames from real wedding days.'
        : 'Няколко от любимите ни кадри от истински сватбени дни.';
    }

    const collageImg = homeHero.parentElement?.querySelector('img[src="assets/weddings/selected-collage.webp"], img[src="/assets/weddings/selected-collage.webp"]');
    if (collageImg) {
      const link = collageImg.closest('a') || collageImg.parentElement;
      const grid = document.createElement('div');
      grid.className = 'home-photo-grid';
      const files = ['01.jpg','02.jpg','03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg'];

      files.forEach((file, index) => {
        const card = document.createElement('a');
        card.href = `${isEnglishPage ? '/svatba-izbrani.html?lang=en' : '/svatba-izbrani.html'}#kadyr-${index + 1}`;

        const img = document.createElement('img');
        img.src = `/assets/${file}`;
        img.alt = isEnglishPage ? `Selected wedding photo ${index + 1}` : `Избран сватбен кадър ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.fetchPriority = 'low';

        card.appendChild(img);
        grid.appendChild(card);
      });

      link?.replaceWith(grid);
    }

    homeHero.querySelectorAll('.home-btn').forEach(btn => {
      if (!canHover) return;
      btn.addEventListener('mouseenter', () => btn.classList.add('is-hovered'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('is-hovered'));
    });
  }

  const strip = document.querySelector('.home-filmstrip');
  if (strip) strip.remove();

  /* The legacy 653-photo template is not used by the gallery script. Remove it from memory after parsing. */
  document.getElementById('portfolioNextPool')?.remove();

  if (hero && heroContent && !reduceMotion && canHover) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `perspective(1200px) rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg) translate3d(${(x * 4).toFixed(1)}px,${(y * 3).toFixed(1)}px,0)`;
      if (heroBg) heroBg.style.transform = `scale(1.03) translate3d(${(x * 8).toFixed(1)}px,${(y * 6).toFixed(1)}px,0)`;
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      heroContent.style.transform = '';
      if (heroBg) heroBg.style.transform = '';
    }, { passive: true });
  }

  if (heroImage && !reduceMotion) {
    if (heroImage.complete) heroImage.classList.add('is-loaded');
    else heroImage.addEventListener('load', () => heroImage.classList.add('is-loaded'), { once: true });
  }

  /* Consent-first GA4. Nothing is requested from Google Analytics until the visitor accepts. */
  const GA_ID = 'G-WJK01GL7PM';
  const CONSENT_KEY = 'mpv_analytics_consent_v1';
  const getStoredConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); }
    catch { return null; }
  };
  const storeConsent = value => {
    try { localStorage.setItem(CONSENT_KEY, value); }
    catch { /* Browsing can continue even when storage is unavailable. */ }
  };
  const loadAnalytics = () => {
    if (window.__mpvAnalyticsLoaded) return;
    window.__mpvAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  };

  const savedConsent = getStoredConsent();
  if (savedConsent === 'granted') {
    loadAnalytics();
  } else if (savedConsent !== 'denied') {
    const notice = document.createElement('div');
    notice.className = 'mpv-consent';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', isEnglishPage ? 'Analytics preferences' : 'Настройки за анализ');
    notice.innerHTML = `
      <p>${isEnglishPage
        ? 'We use optional analytics only to understand which pages are useful. No analytics is loaded unless you accept.'
        : 'Използваме незадължителна статистика само за да разбираме кои страници са полезни. Анализ не се зарежда без вашето съгласие.'}</p>
      <div class="mpv-consent__actions">
        <button type="button" data-consent="decline">${isEnglishPage ? 'Decline' : 'Отказвам'}</button>
        <button type="button" data-consent="accept">${isEnglishPage ? 'Accept' : 'Приемам'}</button>
      </div>`;

    notice.addEventListener('click', event => {
      const action = event.target.closest('[data-consent]')?.dataset.consent;
      if (!action) return;
      const granted = action === 'accept';
      storeConsent(granted ? 'granted' : 'denied');
      notice.remove();
      if (granted) loadAnalytics();
    });

    document.body.appendChild(notice);
  }
});