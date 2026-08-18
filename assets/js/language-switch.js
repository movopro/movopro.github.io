(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');
  if(isEnglish){document.documentElement.style.background='#0c0b09';if(document.body)document.body.style.background='#0c0b09';}

  if(location.pathname.endsWith('/portfolio.html') || location.pathname==='/portfolio.html'){
    const prepare=()=>{
      // Keep the portfolio content visible even if the optional reveal animation
      // script is unavailable or fails to initialize.
      document.querySelectorAll('.portfolio-v2 .v2-reveal').forEach(el=>{
        el.classList.add('v2-visible');
        el.style.opacity='1';
        el.style.transform='none';
      });

      const gallery=document.querySelector('.gallery');
      const nextItems=[...document.querySelectorAll('[data-next-pool="653"]')];

      // Keep all new portfolio items inside the masonry grid.
      if(gallery && nextItems.length){
        const fragment=document.createDocumentFragment();
        nextItems.forEach(item=>fragment.appendChild(item));
        gallery.appendChild(fragment);
      }

      // Do not replace image src/srcset with transparent placeholders.
      // Native browser lazy-loading is reliable here and the lightbox continues
      // to use each item's data-image attribute.
      document.querySelectorAll('.gallery-item img').forEach((img,index)=>{
        img.loading=index<4?'eager':'lazy';
        img.decoding='async';
      });

      // Add a clearly visible way back to the gallery on desktop and mobile.
      const lb=document.getElementById('lightbox');
      const close=document.getElementById('lightboxClose');
      if(lb && close && !document.getElementById('lightboxBack')){
        const back=document.createElement('button');
        back.id='lightboxBack';
        back.type='button';
        back.textContent='← Назад към галерията';
        back.setAttribute('aria-label','Назад към галерията');
        back.style.cssText='position:absolute;left:20px;bottom:20px;z-index:2;padding:12px 18px;border:1px solid rgba(195,152,90,.45);border-radius:999px;background:rgba(9,8,6,.72);backdrop-filter:blur(12px);color:#f3ecdc;font:500 13px Montserrat,Arial,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35);';
        back.addEventListener('mouseenter',()=>{back.style.background='rgba(195,152,90,.18)';});
        back.addEventListener('mouseleave',()=>{back.style.background='rgba(9,8,6,.72)';});
        back.addEventListener('click',()=>close.click());
        lb.appendChild(back);
      }
    };

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});
    else prepare();
  }

  if(location.pathname.endsWith('/uslugi-ceni.html') || location.pathname==='/uslugi-ceni.html'){
    const showPricing=()=>document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale').forEach(el=>{el.style.opacity='1';el.style.transform='none';});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showPricing,{once:true});else showPricing();
    const pricingFix=document.createElement('script');pricingFix.src='/assets/js/pricing-fix.js?v=2026081623';pricingFix.defer=true;document.head.appendChild(pricingFix);
  }

  const loadComplete=()=>{if(document.documentElement.dataset.memoryEnglishComplete==='1')return;document.documentElement.dataset.memoryEnglishComplete='1';const complete=document.createElement('script');complete.src='/assets/js/language-switch-complete.js?v=2026081804';complete.onerror=()=>{};document.head.appendChild(complete);};
  const s=document.createElement('script');s.src='/assets/js/language-switch-runtime.js?v=2026081623';s.onload=loadComplete;s.onerror=loadComplete;document.head.appendChild(s);
})();