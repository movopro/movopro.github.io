(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Mark English mode immediately so there is no white flash while the translator initializes.
  if(isEnglish){
    document.documentElement.classList.add('lang-en-pending');
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.classList.add('lang-en-pending');
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081507';
  s.onload=()=>{};
  document.head.appendChild(s);
})();
