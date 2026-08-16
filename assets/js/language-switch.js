(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Never hide the document while the English runtime loads.
  if(isEnglish){
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.style.background='#0c0b09';
  }

  // Pricing used a scroll-reveal rule that could leave the whole page invisible
  // when its inline observer failed or was interrupted. Keep the page fail-safe:
  // content is visible first; animations may enhance it afterwards.
  if(location.pathname.endsWith('/uslugi-ceni.html') || location.pathname === '/uslugi-ceni.html'){
    const showPricing = () => {
      document.querySelectorAll('.pricing-page .reveal, .pricing-page .reveal-left, .pricing-page .reveal-scale')
        .forEach(el => { el.style.opacity='1'; el.style.transform='none'; });
    };
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showPricing, {once:true});
    else showPricing();
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081604';
  s.onerror=()=>{};
  document.head.appendChild(s);
})();
