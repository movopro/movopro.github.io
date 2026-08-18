(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');

  if(isEnglish){
    document.documentElement.style.background='#0c0b09';
    if(document.body) document.body.style.background='#0c0b09';
  }

  // Portfolio performance: keep the initial page interactive and let images
  // load progressively. This is stricter than browser-native lazy loading.
  if(location.pathname.endsWith('/portfolio.html') || location.pathname==='/portfolio.html'){
    const transparent='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const preparePortfolioImages=()=>{
      const items=[...document.querySelectorAll('.gallery-item')];
      if(!items.length)return;

      const images=[];
      items.forEach((item,index)=>{
        const img=item.querySelector('img');
        if(!img)return;
        images.push(img);

        // Only the first four are allowed into the initial request queue.
        if(index<4){
          img.loading='eager';
          img.decoding='async';
          img.removeAttribute('fetchpriority');
          if(index===0)img.fetchPriority='high';
          return;
        }

        if(img.dataset.lazyPrepared==='1')return;
        img.dataset.lazyPrepared='1';

        const picture=item.querySelector('picture');
        const source=picture?.querySelector('source');
        if(source?.getAttribute('srcset')){
          source.dataset.lazySrcset=source.getAttribute('srcset');
          source.removeAttribute('srcset');
        }

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
        const item=img.closest('.gallery-item');
        const picture=item?.querySelector('picture');
        const source=picture?.querySelector('source');
        if(source?.dataset.lazySrcset){
          source.setAttribute('srcset',source.dataset.lazySrcset);
          delete source.dataset.lazySrcset;
        }
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

    preparePortfolioImages();
  }

  // Pricing fallback: keep the page and calculator visible.
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
