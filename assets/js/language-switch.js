(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');
  if(isEnglish){document.documentElement.style.background='#0c0b09';if(document.body)document.body.style.background='#0c0b09';}

  if(location.pathname.endsWith('/uslugi-ceni.html') || location.pathname==='/uslugi-ceni.html' || location.pathname.includes('/uslugi-ceni.html')){
    const showPricing=()=>{
      document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale').forEach(el=>{el.style.opacity='1';el.style.transform='none';});

      // The calculator initializes itself on page load. On phones that initialization can
      // trigger its result-scroll helper. A normal navigation to Pricing should always
      // open at the top; result scrolling remains available after an actual Calculate tap.
      if(!location.hash && window.matchMedia('(max-width: 768px)').matches){
        let interacted=false;
        const markInteraction=()=>{interacted=true;};
        document.addEventListener('pointerdown',markInteraction,{once:true,capture:true});
        document.addEventListener('keydown',markInteraction,{once:true,capture:true});
        document.addEventListener('touchstart',markInteraction,{once:true,capture:true,passive:true});
        window.setTimeout(()=>{
          if(!interacted && window.scrollY>0) window.scrollTo({top:0,left:0,behavior:'auto'});
        },260);
      }
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showPricing,{once:true});else showPricing();
  }

  /* Pages that exist in both languages (the language button points to the matching page). */
  window.__mpvPages=['index.html','portfolio.html','videos.html','uslugi-ceni.html','availability.html','about.html','svatba-izbrani.html','privacy.html'];

  if(isEnglish){
    // English mode: load the translation runtime, then the full dictionary.
    const loadComplete=()=>{if(document.documentElement.dataset.memoryEnglishComplete==='1')return;document.documentElement.dataset.memoryEnglishComplete='1';const complete=document.createElement('script');complete.src='/assets/js/language-switch-complete.js?v=20260929';complete.onerror=()=>{};document.head.appendChild(complete);};
    const s=document.createElement('script');s.src='/assets/js/language-switch-runtime.js?v=20260929';s.onload=loadComplete;s.onerror=loadComplete;document.head.appendChild(s);
  }else{
    // Bulgarian mode: only the "EN" button is needed, so the English scripts are not downloaded at all.
    document.querySelectorAll('.language-switch').forEach(el=>el.remove());
    const file=location.pathname.replace(/^\//,'')||'index.html';
    const current=window.__mpvPages.includes(file)?file:'index.html';
    const style=document.createElement('style');
    style.textContent='.language-switch{position:fixed!important;top:10px!important;right:12px!important;z-index:1002!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-width:0!important;width:auto!important;height:42px!important;padding:8px 12px!important;box-sizing:border-box!important;border-radius:999px!important;white-space:nowrap!important}@media(max-width:880px){.language-switch{right:82px!important;top:9px!important}}';
    document.head.appendChild(style);
    const sw=document.createElement('a');
    sw.className='language-switch';
    sw.href=current==='index.html'?'/en/':'/en/'+current;
    sw.setAttribute('aria-label','Switch to English');
    sw.innerHTML='<span class="flag">🇬🇧</span><span class="code">EN</span>';
    sw.onclick=e=>{e.preventDefault();location.replace(sw.href)};
    document.body.appendChild(sw);
  }

  // Independent enhancement layer: never blocks navigation, pricing, or language switching.
  const wow=document.createElement('script');
  wow.src='/assets/js/wow-polish.js?v=20260929';
  wow.defer=true;
  wow.onerror=()=>{};
  document.head.appendChild(wow);
})();
