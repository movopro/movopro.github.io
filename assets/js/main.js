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

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* Mobile navigation: keep keyboard/screen-reader state in sync and make Escape/outside-click close it. */
  if (menuToggle && nav) {
    const burger = document.querySelector('.burger');
    const syncMenuState = () => {
      const open = menuToggle.checked;
      menuToggle.setAttribute('aria-expanded', String(open));
      if (burger) burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
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
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuToggle.checked) {
          menuToggle.checked = false;
          syncMenuState();
        }
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuToggle.checked) {
        menuToggle.checked = false;
        syncMenuState();
        menuToggle.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!menuToggle.checked || !header.contains(event.target)) return;
      /* Do not close the menu when the user is interacting with the burger or a nav link. */
      if (nav.contains(event.target) || burger?.contains(event.target) || event.target === menuToggle) return;
      menuToggle.checked = false;
      syncMenuState();
    });
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
    if (selectedCopy) {
      selectedCopy.textContent = isEnglishPage
        ? 'Some of our favourite frames from real wedding days.'
        : 'Няколко от любимите ни кадри от истински сватбени дни.';
    }

    const collageImg = homeHero.parentElement.querySelector('img[src="assets/weddings/selected-collage.webp"], img[src="/assets/weddings/selected-collage.webp"]');
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
        img.loading = index < 3 ? 'eager' : 'lazy';
        img.decoding = 'async';
        card.appendChild(img);
        grid.appendChild(card);
      });
      link.replaceWith(grid);
    }

    /* Cinematic hero entrance + subtle desktop parallax. */
    if (!reduceMotion) {
      homeHero.classList.add('cinematic-ready');
      requestAnimationFrame(() => homeHero.classList.add('cinematic-in'));
      if (canHover) {
        let raf=0;
        const onMove=(e)=>{
          if (raf) return;
          raf=requestAnimationFrame(()=>{
            const r=homeHero.getBoundingClientRect();
            const x=(e.clientX-r.left)/r.width-.5;
            const y=(e.clientY-r.top)/r.height-.5;
            homeHero.style.setProperty('--hero-x',`${x*10}px`);
            homeHero.style.setProperty('--hero-y',`${y*7}px`);
            raf=0;
          });
        };
        homeHero.addEventListener('pointermove',onMove,{passive:true});
        homeHero.addEventListener('pointerleave',()=>{homeHero.style.setProperty('--hero-x','0px');homeHero.style.setProperty('--hero-y','0px');},{passive:true});
      }
    }

    homeHero.querySelectorAll('.home-btn').forEach(btn=>{
      if (canHover) {
        btn.addEventListener('mouseenter',()=>btn.classList.add('is-hovered'));
        btn.addEventListener('mouseleave',()=>btn.classList.remove('is-hovered'));
      }
    });
  }

  const strip = document.querySelector('.home-filmstrip');
  if (strip) strip.remove();

  if (hero && heroContent && !reduceMotion && canHover) {
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `perspective(1200px) rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg) translate3d(${(x * 4).toFixed(1)}px,${(y * 3).toFixed(1)}px,0)`;
      if (heroBg) heroBg.style.transform = `scale(1.03) translate3d(${(x * 8).toFixed(1)}px,${(y * 6).toFixed(1)}px,0)`;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      heroContent.style.transform = '';
      if (heroBg) heroBg.style.transform = '';
    }, { passive: true });
  }

  if (heroImage && !reduceMotion) {
    heroImage.addEventListener('load', () => heroImage.classList.add('is-loaded'), { once: true });
  }
});
