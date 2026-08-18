(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  // Never hide the document while the English runtime loads.
  if(isEnglish){
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.style.background='#0c0b09';
  }

  // Portfolio performance: do not let hundreds of large gallery images
  // compete with navigation, CSS and the next page. Native lazy loading is
  // not strict enough on every browser, so gallery images are promoted only
  // when they are close to the viewport.
  if(location.pathname.endsWith('/portfolio.html') || location.pathname==='/portfolio.html'){
    const transparent='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const preparePortfolioImages=()=>{
      const images=[...document.querySelectorAll('.gallery-item img')];
      if(!images.length)return;

      images.forEach((img,index)=>{
        // Keep only the first 4 gallery images immediately available.
        // Everything else is deferred until it approaches the viewport.
        if(index<4){
          img.loading='eager';
          img.decoding='async';
          if(index===0)img.fetchPriority='high';
          return;
        }

        if(img.dataset.lazyPrepared==='1')return;
        img.dataset.lazyPrepared='1';
        if(img.getAttribute('src'))img.dataset.src=img.getAttribute('src');
        if(img.getAttribute('srcset'))img.dataset.srcset=img.getAttribute('srcset');
        if(img.getAttribute('sizes'))img.dataset.sizes=img.getAttribute('sizes');
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.removeAttribute('fetchpriority');
        img.loading='lazy';
        img.decoding='async';
        img.src=transparent;
      });

      const loadImage=(img)=>{
        if(img.dataset.loaded==='1')return;
        const src=img.dataset.src;
        if(!src)return;
        img.dataset.loaded='1';
        if(img.dataset.srcset)img.setAttribute('srcset',img.dataset.srcset);
        if(img.dataset.sizes)img.setAttribute('sizes',img.dataset.sizes);
        img.src=src;
      };

      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(entry.isIntersecting){
              loadImage(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },{rootMargin:'900px 0px'});
        images.slice(4).forEach(img=>observer.observe(img));
      }else{
        images.slice(4).forEach(loadImage);
      }
    };

    // Run immediately because this script is loaded at the end of the page.
    preparePortfolioImages();
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
