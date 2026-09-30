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

  /* Pages with their own structured data (home, about, city and wedding pages) keep it;
     replacing or duplicating it produced conflicting #business records. */
  const isNoindex = !!document.querySelector('meta[name="robots"][content*="noindex"]');
  if (!isEnglishPage && !isNoindex && !document.querySelector('script[type="application/ld+json"]')) {

    const pageName = document.title.split('|')[0].trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href || `${location.origin}${path}`;
    const schema = document.createElement('script');
    schema.id = 'mpv-seo-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Photographer',
          '@id': 'https://memoryphotoandvideo.com/#business',
          name: 'Memory Photo And Video',
          alternateName: 'Memory Photo & Video',
          url: 'https://memoryphotoandvideo.com/',
          logo: 'https://memoryphotoandvideo.com/assets/icon-512.png',
          image: 'https://memoryphotoandvideo.com/memory-og-2026.jpg',
          description: 'Сватбена фотография и видеография от Кърджали — за сватби и събития в региона и цяла България.',
          foundingDate: '2017',
          address: { '@type': 'PostalAddress', addressLocality: 'Кърджали', addressCountry: 'BG' },
          areaServed: [{ '@type': 'City', name: 'Кърджали' }, { '@type': 'City', name: 'Пловдив' }, { '@type': 'City', name: 'Хасково' }, { '@type': 'City', name: 'Смолян' }, { '@type': 'Country', name: 'България' }],
          serviceType: ['Сватбена фотография', 'Сватбена видеография', 'Събитийна фотография', 'Събитийно видео'],
          sameAs: ['https://www.instagram.com/memoryphotoandvideo/', 'https://www.facebook.com/MemoryPhotoAndVideo/'],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://memoryphotoandvideo.com/#website',
          url: 'https://memoryphotoandvideo.com/',
          name: 'Memory Photo & Video',
          alternateName: 'Memory Photo And Video',
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
      document.body.classList.toggle('menu-open', menuToggle.checked);
    };

    const closeMenu = ({ focusToggle = false } = {}) => {
      if (!menuToggle.checked) return;
      menuToggle.checked = false;
      syncMenuState();
      if (focusToggle) menuToggle.focus();
    };

    /* The checkbox is the accessible control (a labelled checkbox that controls the navigation);
       the label only draws the burger icon and has no text of its own. */
    nav.id = nav.id || 'site-navigation';
    menuToggle.setAttribute('aria-controls', nav.id);
    if (!menuToggle.getAttribute('aria-label')) {
      menuToggle.setAttribute('aria-label', isEnglishPage ? 'Menu' : 'Меню');
    }
    if (burger) {
      // Older saved copies of the page carried these on the label; the checkbox owns them now.
      ['role', 'tabindex', 'aria-expanded', 'aria-controls', 'aria-label', 'aria-hidden'].forEach(name => burger.removeAttribute(name));
      ['role', 'aria-expanded'].forEach(name => menuToggle.removeAttribute(name));
    }
    menuToggle.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return; // Space already toggles a checkbox
      event.preventDefault();
      menuToggle.click();
    });

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
      : 'Публичният Google рейтинг в момента е 5,0/5 от 21 отзива.';
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
        ? 'Some of our favorite frames from real wedding days.'
        : 'Няколко от любимите ни кадри от истински сватбени дни.';
    }

    homeHero.querySelectorAll('.home-btn').forEach(btn => {
      if (!canHover) return;
      btn.addEventListener('mouseenter', () => btn.classList.add('is-hovered'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('is-hovered'));
    });
  }

  const strip = document.querySelector('.home-filmstrip');
  if (strip) strip.remove();


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

  /* Consent first. Nothing is requested from Google or Meta until the visitor allows it, and the two purposes
     (statistics, advertising) are separate choices. */
  const GA_ID = 'G-WJK01GL7PM';
  const META_PIXEL_ID = '28878319171761421';
  const CONSENT_KEY = 'mpv_consent_v2';
  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return saved && typeof saved === 'object' ? { analytics: saved.analytics === true, ads: saved.ads === true } : null;
    } catch { return null; }
  };
  const writeConsent = choice => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(choice)); }
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

  /* Meta Pixel (Facebook and Instagram ads): Meta's standard base code, started only after the visitor allows advertising. */
  const loadMetaPixel = () => {
    if (window.__mpvPixelLoaded) return;
    window.__mpvPixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  };

  /* Withdrawing consent must also remove what the service already stored on this device. */
  const removeCookies = matches => {
    const names = document.cookie.split(';').map(part => part.split('=')[0].trim()).filter(matches);
    const host = location.hostname;
    const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
    names.forEach(name => domains.forEach(domain => {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    }));
    names.forEach(name => { document.cookie = `${name}=; Max-Age=0; path=/`; });
  };
  const stopAnalytics = () => {
    window[`ga-disable-${GA_ID}`] = true;
    removeCookies(name => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat'));
  };
  const stopMetaPixel = () => {
    if (window.fbq) window.fbq('consent', 'revoke');
    removeCookies(name => name === '_fbp' || name === '_fbc');
  };

  const applyConsent = choice => {
    if (choice.analytics) {
      window[`ga-disable-${GA_ID}`] = false;
      loadAnalytics();
    } else {
      stopAnalytics();
    }
    if (choice.ads) loadMetaPixel();
    else stopMetaPixel();
  };

  const showConsentNotice = ({ focus = false } = {}) => {
    if (document.querySelector('.mpv-consent')) return;
    const say = (bg, en) => (isEnglishPage ? en : bg);
    const current = readConsent() || { analytics: false, ads: false };
    const notice = document.createElement('div');
    notice.className = 'mpv-consent';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', say('Настройки за бисквитки', 'Cookie settings'));
    notice.innerHTML = `
      <div class="mpv-consent__body">
        <p>${say('Използваме бисквитки и подобни технологии само с вашето съгласие. Изберете какво разрешавате.', 'We use cookies and similar technologies only with your consent. Choose what you allow.')}
          <a href="${isEnglishPage ? '/en/privacy.html' : '/privacy.html'}">${say('Политика за поверителност', 'Privacy policy')}</a></p>
        <div class="mpv-consent__choices">
          <label><input type="checkbox" data-purpose="analytics"${current.analytics ? ' checked' : ''}><span>${say('Статистика (Google Analytics)', 'Statistics (Google Analytics)')}</span></label>
          <label><input type="checkbox" data-purpose="ads"${current.ads ? ' checked' : ''}><span>${say('Реклама и измерване (Meta Pixel — Facebook и Instagram)', 'Advertising and measurement (Meta Pixel — Facebook and Instagram)')}</span></label>
        </div>
      </div>
      <div class="mpv-consent__actions">
        <button type="button" data-consent="decline">${say('Отказвам всички', 'Decline all')}</button>
        <button type="button" data-consent="save">${say('Запазете избора', 'Save choices')}</button>
        <button type="button" data-consent="accept">${say('Приемам всички', 'Accept all')}</button>
      </div>`;

    notice.addEventListener('click', event => {
      const action = event.target.closest('[data-consent]')?.dataset.consent;
      if (!action) return;
      const box = purpose => notice.querySelector(`[data-purpose="${purpose}"]`)?.checked === true;
      const choice = action === 'accept' ? { analytics: true, ads: true }
        : action === 'save' ? { analytics: box('analytics'), ads: box('ads') }
        : { analytics: false, ads: false };
      writeConsent(choice);
      notice.remove();
      applyConsent(choice);
    });

    // Right after the skip link (it is fixed at the bottom of the screen), so keyboard and screen reader users meet it early.
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.after(notice);
    else document.body.prepend(notice);
    if (focus) notice.querySelector('[data-consent="decline"]')?.focus({ preventScroll: true });
  };

  const savedConsent = readConsent();
  if (savedConsent) applyConsent(savedConsent);
  else showConsentNotice();

  /* The "Cookie settings" link in the footer lets visitors change their mind at any time. */
  document.addEventListener('click', event => {
    if (!event.target.closest?.('[data-consent-settings]')) return;
    showConsentNotice({ focus: true });
  });

  document.querySelectorAll('[data-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
});

/* Homepage hero carousel 2026-09-11 */
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('[data-home-slider]');
  if (!slider || slider.dataset.sliderReady === 'true') return;

  const slides = Array.from(slider.querySelectorAll('[data-home-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-home-slide-to]'));
  const previousButton = slider.querySelector('[data-home-slider-prev]');
  const nextButton = slider.querySelector('[data-home-slider-next]');
  const toggleButton = slider.querySelector('[data-home-slider-toggle]');
  const status = slider.querySelector('[data-home-slider-status]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length < 2) return;

  slider.dataset.sliderReady = 'true';

  let currentIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
  let autoplayTimer = null;
  let userPaused = reduceMotion;
  let pointerInside = false;
  let focusInside = false;
  let touchStartX = null;

  const updateToggle = () => {
    if (!toggleButton) return;
    if (reduceMotion) {
      toggleButton.hidden = true;
      return;
    }

    // The label names the action, so it is not combined with aria-pressed; the icon follows data-state.
    toggleButton.removeAttribute('aria-pressed');
    toggleButton.dataset.state = userPaused ? 'paused' : 'playing';
    toggleButton.setAttribute(
      'aria-label',
      userPaused ? 'Пуснете автоматичната смяна' : 'Спрете автоматичната смяна'
    );
  };

  const showSlide = (requestedIndex, announce = false) => {
    currentIndex = (requestedIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const active = index === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    if (announce && status) {
      status.textContent = `Снимка ${currentIndex + 1} от ${slides.length}`;
    }
  };

  const stopAutoplay = () => {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const canAutoplay = () => (
    !reduceMotion &&
    !userPaused &&
    !pointerInside &&
    !focusInside &&
    !document.hidden
  );

  const startAutoplay = () => {
    stopAutoplay();
    if (!canAutoplay()) return;
    autoplayTimer = window.setInterval(() => showSlide(currentIndex + 1), 5600);
  };

  const moveBy = direction => {
    showSlide(currentIndex + direction, true);
    startAutoplay();
  };

  previousButton?.addEventListener('click', () => moveBy(-1));
  nextButton?.addEventListener('click', () => moveBy(1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index, true);
      startAutoplay();
    });
  });

  toggleButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    updateToggle();
    startAutoplay();
  });

  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(1);
    }
  });

  slider.addEventListener('pointerenter', () => {
    pointerInside = true;
    stopAutoplay();
  });

  slider.addEventListener('pointerleave', () => {
    pointerInside = false;
    startAutoplay();
  });

  slider.addEventListener('focusin', () => {
    focusInside = true;
    stopAutoplay();
  });

  slider.addEventListener('focusout', () => {
    window.setTimeout(() => {
      focusInside = slider.contains(document.activeElement);
      startAutoplay();
    }, 0);
  });

  slider.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStartX = event.clientX;
  }, { passive: true });

  slider.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' || touchStartX === null) return;
    const distance = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 42) return;
    moveBy(distance > 0 ? -1 : 1);
  }, { passive: true });

  slider.addEventListener('pointercancel', () => {
    touchStartX = null;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  showSlide(currentIndex);
  updateToggle();
  startAutoplay();
});

/* Click-to-play YouTube videos: nothing is requested from YouTube's player until the visitor presses play. */
document.addEventListener('click', event => {
  const link = event.target.closest?.('a.yt-embed__play');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const box = link.closest('.yt-embed');
  const id = box?.dataset.ytId;
  if (!id) return;
  event.preventDefault();
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
  frame.title = box.dataset.ytTitle || '';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  link.replaceWith(frame);
  frame.focus();
});
