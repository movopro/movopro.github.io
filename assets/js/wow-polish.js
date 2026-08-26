(()=>{
  if(window.__memoryWowPolish) return;
  window.__memoryWowPolish=true;

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];

  const init=()=>{
    /* Scroll progress */
    const progress=document.createElement('div');
    progress.id='wowScrollProgress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);

    let raf=0;
    const syncScroll=()=>{
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        const p=Math.min(1,Math.max(0,scrollY/max));
        document.documentElement.style.setProperty('--wow-progress',String(p));

        const homeHero=q('.home-hero');
        if(homeHero && !reduceMotion){
          const amount=Math.min(18,scrollY*.035);
          homeHero.style.setProperty('--wow-hero-scroll',`${amount}px`);
        }

        const cue=q('.wow-scroll-cue');
        if(cue) cue.classList.toggle('wow-cue-hidden',scrollY>70);
        raf=0;
      });
    };
    addEventListener('scroll',syncScroll,{passive:true});
    addEventListener('resize',syncScroll,{passive:true});
    syncScroll();

    /* Decorative hero cue, no text/content changes. */
    const homeHero=q('.home-hero');
    if(homeHero && !reduceMotion && !q('.wow-scroll-cue',homeHero)){
      const cue=document.createElement('span');
      cue.className='wow-scroll-cue';
      cue.setAttribute('aria-hidden','true');
      homeHero.appendChild(cue);
    }

    /* Progressive scroll reveals. Only classes/styles, never text. */
    const selectors=[
      '.home-section__head','.review-summary','.review-box','.video-card','.video-copy','.dj-card','.home-cta',
      '.v2-section > *','.v2-service','.v2-step','.v2-cta',
      '.pricing-hero','.included-all','.package-card','.calc-card','.event-card',
      '.about-grid > *','.team-card','.portfolio-head','.video-info-v2'
    ];
    const revealTargets=[];
    selectors.forEach(sel=>qa(sel).forEach(el=>{if(!revealTargets.includes(el)) revealTargets.push(el);}));

    revealTargets.forEach((el,index)=>{
      if(el.classList.contains('v2-reveal') || el.classList.contains('reveal') || el.classList.contains('reveal-left') || el.classList.contains('reveal-scale')) return;
      el.classList.add('wow-reveal');
      el.dataset.wowDelay=String(index%4);
    });

    if(reduceMotion || !('IntersectionObserver' in window)){
      qa('.wow-reveal').forEach(el=>el.classList.add('wow-visible'));
    }else{
      const observer=new IntersectionObserver((entries,obs)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('wow-visible');
            obs.unobserve(entry.target);
          }
        });
      },{threshold:.08,rootMargin:'0px 0px -30px'});
      qa('.wow-reveal').forEach(el=>observer.observe(el));
    }

    /* Desktop-only ambient pointer glow on the hero. */
    if(homeHero && canHover && !reduceMotion){
      let heroRaf=0;
      homeHero.addEventListener('pointermove',event=>{
        if(heroRaf) return;
        heroRaf=requestAnimationFrame(()=>{
          const r=homeHero.getBoundingClientRect();
          const x=((event.clientX-r.left)/Math.max(1,r.width)-.5)*22;
          const y=((event.clientY-r.top)/Math.max(1,r.height)-.5)*16;
          homeHero.style.setProperty('--wow-hero-x',`${x}px`);
          homeHero.style.setProperty('--wow-hero-y',`${y}px`);
          heroRaf=0;
        });
      },{passive:true});
      homeHero.addEventListener('pointerleave',()=>{
        homeHero.style.setProperty('--wow-hero-x','0px');
        homeHero.style.setProperty('--wow-hero-y','0px');
      },{passive:true});
    }

    /* Defensive UX audit fixes: external links and image decoding only. */
    qa('a[target="_blank"]').forEach(link=>{
      const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
      rel.add('noopener');rel.add('noreferrer');
      link.setAttribute('rel',[...rel].join(' '));
    });
    qa('img').forEach((img,index)=>{
      if(index>1 && !img.hasAttribute('decoding')) img.decoding='async';
    });
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
