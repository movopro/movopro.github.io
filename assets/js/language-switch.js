(()=>{
  if(new URLSearchParams(location.search).get('lang')==='en'){
    history.replaceState(null,'','/en'+location.pathname);
  }
  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081506';
  s.onload=()=>{};
  document.head.appendChild(s);
})();
