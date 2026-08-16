(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Paint the correct dark background immediately. Never hide the page itself:
  // the content and calculator must remain usable even if translation is delayed.
  if(isEnglish){
    document.documentElement.classList.add('lang-en-pending');
    document.documentElement.style.background='#0c0b09';
    if(document.body){
      document.body.classList.add('lang-en-pending');
      document.body.style.setProperty('visibility','visible','important');
      document.body.style.setProperty('background','#0c0b09','important');
    }
  }

  const s=document.createElement('script');
  s.src='/assets/js/language-switch-runtime.js?v=2026081602';
  s.onload=()=>{};
  s.onerror=()=>{
    document.documentElement.classList.remove('lang-en-pending');
    if(document.body) document.body.classList.remove('lang-en-pending');
  };
  document.head.appendChild(s);
})();
