(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Never hide the document while the English runtime loads.
  if(isEnglish){
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.style.background='#0c0b09';
  }

  // Pricing used a scroll-reveal rule that could leave the whole page invisible.
  // Keep the content visible first; the pricing fallback also protects the calculator.
  if(location.pathname.endsWith('/uslugi-ceni.html') || location.pathname === '/uslugi-ceni.html'){
    const showPricing=()=>document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale')
      .forEach(el=>{el.style.opacity='1';el.style.transform='none';});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showPricing,{once:true});else showPricing();

    const pricingFix=document.createElement('script');
    pricingFix.src='/assets/js/pricing-fix.js?v=2026081623';
    pricingFix.defer=true;
    document.head.appendChild(pricingFix);
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081623';
  s.onerror=()=>{};
  document.head.appendChild(s);
})();
