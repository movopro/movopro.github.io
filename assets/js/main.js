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
  const isEnglishPage = location.pathname.startsWith('/en/');

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
        card.href = `${isEnglishPage ? '/en' : ''}/svatba-izbrani.html#kadyr-${index + 1}`;
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
    const wow = document.createElement('style');
    wow.textContent = `
      .home-hero::before{transform:scale(1.08);opacity:.86;animation:homeMediaIn 1.6s cubic-bezier(.16,1,.3,1) .05s both;will-change:transform,opacity;}
      .home-hero::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 52% 38%,rgba(232,201,138,.08),transparent 32%),linear-gradient(180deg,rgba(8,7,5,.04),rgba(8,7,5,.72));opacity:0;animation:homeVeilIn 1.2s cubic-bezier(.16,1,.3,1) .15s forwards;}
      .home-hero__copy{opacity:0;transform:translate(-50%,28px);animation:homeCopyIn 1s cubic-bezier(.16,1,.3,1) .4s forwards;}
      .home-kicker{opacity:0;transform:translateY(10px);animation:homeTextIn .7s cubic-bezier(.16,1,.3,1) .68s forwards;}
      .home-hero h1{opacity:0;transform:translateY(14px);animation:homeTextIn .85s cubic-bezier(.16,1,.3,1) .8s forwards;}
      .home-hero p{opacity:0;transform:translateY(12px);animation:homeTextIn .75s cubic-bezier(.16,1,.3,1) .95s forwards;}
      .home-hero .home-actions{opacity:0;transform:translateY(10px);animation:homeTextIn .7s cubic-bezier(.16,1,.3,1) 1.08s forwards;}
      .home-socials{opacity:0;transform:translateY(8px);animation:homeTextIn .65s cubic-bezier(.16,1,.3,1) 1.18s forwards;}
      .home-filmstrip{position:relative;z-index:3;overflow:hidden;background:#0a0907;border-top:1px solid rgba(195,152,90,.18);border-bottom:1px solid rgba(195,152,90,.18);padding:11px 0;box-shadow:inset 0 1px 0 rgba(255,255,255,.02),0 12px 32px rgba(0,0,0,.16);}
      .home-filmstrip::before,.home-filmstrip::after{content:"";position:absolute;top:0;bottom:0;width:9vw;z-index:2;pointer-events:none;}
      .home-filmstrip::before{left:0;background:linear-gradient(90deg,#0a0907,transparent);}.home-filmstrip::after{right:0;background:linear-gradient(270deg,#0a0907,transparent);}
      .home-filmstrip__track{display:flex;width:max-content;animation:filmstripMove 28s linear infinite;will-change:transform;}
      .home-filmstrip__set{display:flex;align-items:center;gap:34px;padding-right:34px;white-space:nowrap;}
      .home-filmstrip span{font-size:.64rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,201,138,.62);}
      .home-filmstrip .dot{width:3px;height:3px;border-radius:50%;background:rgba(232,201,138,.45);flex:none;}
      .home-filmstrip .mark{width:18px;height:11px;border:1px solid rgba(232,201,138,.26);border-radius:2px;position:relative;flex:none;}
      .home-filmstrip .mark::before,.home-filmstrip .mark::after{content:"";position:absolute;top:2px;bottom:2px;width:2px;background:rgba(232,201,138,.28);}.home-filmstrip .mark::before{left:2px}.home-filmstrip .mark::after{right:2px}
      @keyframes homeMediaIn{from{opacity:.42;transform:scale(1.13)}to{opacity:.86;transform:scale(1.03)}}@keyframes homeVeilIn{from{opacity:0}to{opacity:1}}@keyframes homeCopyIn{from{opacity:0;transform:translate(-50%,28px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes homeTextIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes filmstripMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @media(max-width:900px){.home-filmstrip__set{gap:24px;padding-right:24px;}.home-hero::before{transform:scale(1.04)!important;}}
      @media(max-width:560px){.home-filmstrip{padding:9px 0}.home-filmstrip__track{animation-duration:24s}.home-filmstrip__set{gap:20px;padding-right:20px}.home-filmstrip span{font-size:.56rem;letter-spacing:.2em}.home-filmstrip .mark{width:15px;height:9px}.home-hero__copy{transform:translate(-50%,18px);}.home-hero h1{font-size:clamp(2.4rem,11vw,3.5rem)!important;}}
      @media(prefers-reduced-motion:reduce){.home-hero::before,.home-hero::after,.home-hero__copy,.home-kicker,.home-hero h1,.home-hero p,.home-actions,.home-socials{animation:none!important;opacity:1!important;transform:none!important}.home-filmstrip__track{animation:none!important;transform:none!important;}}
    `;
    document.head.appendChild(wow);

    if (!reduceMotion) {
      const track = document.createElement('div');
      track.className = 'home-filmstrip';
      track.setAttribute('aria-hidden', 'true');
      const labels = isEnglishPage
        ? ['MEMORY','WEDDING','LOVE','EMOTION','MEMORY','WEDDING','LOVE','EMOTION']
        : ['MEMORY','СВАТБА','ЛЮБОВ','ЕМОЦИЯ','MEMORY','СВАТБА','ЛЮБОВ','ЕМОЦИЯ'];
      const makeSet = () => {
        const set = document.createElement('div'); set.className='home-filmstrip__set';
        labels.forEach((label,index)=>{const span=document.createElement('span');span.textContent=label;set.appendChild(span);if(index<labels.length-1){const dot=document.createElement('i');dot.className=index===3?'mark':'dot';set.appendChild(dot);}});
        return set;
      };
      const inner = document.createElement('div'); inner.className='home-filmstrip__track'; inner.appendChild(makeSet()); inner.appendChild(makeSet()); track.appendChild(inner); homeHero.insertAdjacentElement('afterend',track);

      if (canHover && window.innerWidth > 900) {
        let px=0,py=0;
        const onMove=(event)=>{const r=homeHero.getBoundingClientRect();px=((event.clientX-r.left)/r.width-.5)*2;py=((event.clientY-r.top)/r.height-.5)*2;homeHero.style.setProperty('--mx',px);homeHero.style.setProperty('--my',py);};
        homeHero.addEventListener('mousemove',onMove,{passive:true});
        const extra=document.createElement('style');extra.textContent='.home-hero::before{transform:translate(calc(var(--mx,0) * -8px),calc(var(--my,0) * -6px)) scale(1.035)!important}.home-hero::after{transform:translate(calc(var(--mx,0) * -3px),calc(var(--my,0) * -2px))}';document.head.appendChild(extra);
      }
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