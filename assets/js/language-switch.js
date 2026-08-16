(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Never hide the document while the English runtime loads. This keeps pages such as Pricing
  // and the calculator immediately visible and prevents a blank-page state.
  if(isEnglish){
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.style.background='#0c0b09';
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081603';
  s.onerror=()=>{};
  document.head.appendChild(s);
})();
