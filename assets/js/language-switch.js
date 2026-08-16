(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Paint the correct dark background immediately. Do not hide the whole page:
  // if the translator is delayed, the page must still remain usable.
  if(isEnglish){
    document.documentElement.classList.add('lang-en-pending');
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.classList.add('lang-en-pending');
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081601';
  s.onload=()=>{};
  s.onerror=()=>{
    document.documentElement.classList.remove('lang-en-pending');
    if(document.body) document.body.classList.remove('lang-en-pending');
  };
  document.head.appendChild(s);
})();
