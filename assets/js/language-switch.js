(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');
  if(isEnglish){document.documentElement.style.background='#0c0b09';if(document.body)document.body.style.background='#0c0b09';}

  if(/\/uslugi-ceni(\.html)?$/.test(location.pathname)){
    const keepAtTop=()=>{
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
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',keepAtTop,{once:true});else keepAtTop();
  }

  /* Pages that exist in both languages (the language button points to the matching page). */
  window.__mpvPages=['index.html','portfolio.html','videos.html','uslugi-ceni.html','availability.html','about.html','svatba-izbrani.html','privacy.html'];

  /* The language button: one implementation for both languages. */
  const addLanguageButton=()=>{
    document.querySelectorAll('.language-nav,.language-switch').forEach(el=>el.remove());
    // "/en/portfolio.html", "/portfolio.html" and the extensionless "/portfolio" all mean the same page.
    let file=location.pathname.replace(/^\/en(?=\/|$)/,'').replace(/^\/+/,'');
    if(!file||file.endsWith('/'))file+='index.html';
    else if(!/\.[a-z0-9]+$/i.test(file))file+='.html';
    const current=window.__mpvPages.includes(file)?file:'index.html';
    const target=isEnglish?(current==='index.html'?'/':'/'+current):(current==='index.html'?'/en/':'/en/'+current);

    const sw=document.createElement('a');
    sw.className='language-switch';
    sw.href=target+location.hash;
    sw.hreflang=isEnglish?'bg':'en';
    if(!isEnglish)sw.lang='en'; // the label is English text on a Bulgarian page
    sw.setAttribute('aria-label',isEnglish?'Switch to Bulgarian (BG)':'Switch to English (EN)'); // contains the visible "BG"/"EN"
    sw.innerHTML=isEnglish?'<span class="flag">🇧🇬</span><span class="code">BG</span>':'<span class="flag">🇬🇧</span><span class="code">EN</span>';
    // The button is fixed at the top right, so it also sits in the header: it belongs to the banner landmark
    // and comes right after the menu in the tab order instead of after the footer.
    const host=document.querySelector('header .nav-wrap');
    if(host)host.appendChild(sw);
    else{
      const nav=document.createElement('div');
      nav.className='language-nav';
      nav.setAttribute('role','navigation');
      nav.setAttribute('aria-label',isEnglish?'Language':'Език');
      nav.appendChild(sw);
      document.body.appendChild(nav);
    }
  };
  if(document.body)addLanguageButton();else document.addEventListener('DOMContentLoaded',addLanguageButton,{once:true});

  if(isEnglish){
    // English mode: load the translation runtime, then the full dictionary.
    const loadComplete=()=>{if(document.documentElement.dataset.memoryEnglishComplete==='1')return;document.documentElement.dataset.memoryEnglishComplete='1';const complete=document.createElement('script');complete.src='/assets/js/language-switch-complete.js?v=20260929';complete.onerror=()=>{};document.head.appendChild(complete);};
    const s=document.createElement('script');s.src='/assets/js/language-switch-runtime.js?v=20260929';s.onload=loadComplete;s.onerror=loadComplete;document.head.appendChild(s);
  }

  // Independent enhancement layer: never blocks navigation, pricing, or language switching.
  const wow=document.createElement('script');
  wow.src='/assets/js/wow-polish.js?v=20260929';
  wow.defer=true;
  wow.onerror=()=>{};
  document.head.appendChild(wow);
})();
