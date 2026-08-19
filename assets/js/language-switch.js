(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');
  if(isEnglish){document.documentElement.style.background='#0c0b09';if(document.body)document.body.style.background='#0c0b09';}

  if(location.pathname.endsWith('/portfolio.html') || location.pathname==='/portfolio.html' || location.pathname.includes('/portfolio.html')){
    const prepare=()=>{
      document.querySelectorAll('.portfolio-v2 .v2-reveal').forEach(el=>{
        el.classList.add('v2-visible');
        el.style.opacity='1';
        el.style.transform='none';
      });

      const gallery=document.querySelector('.gallery');
      const pool=document.getElementById('portfolioNextPool');
      if(gallery){
        const initialItems=[...gallery.querySelectorAll('.gallery-item')];
        const nextItems=pool?[...pool.content.querySelectorAll('.gallery-item')]:[...document.querySelectorAll('[data-next-pool="653"]')];
        const items=initialItems.concat(nextItems);
        const total=items.length;
        const batchSize=48;
        let visible=Math.min(batchSize,total);

        const configureImage=(item,index)=>{
          item.querySelectorAll('img').forEach(img=>{
            img.loading=index<2?'eager':'lazy';
            img.decoding='async';
            if(index>=2)img.removeAttribute('fetchpriority');
          });
        };

        initialItems.forEach((item,index)=>{
          if(index<visible)configureImage(item,index);
          else{
            item.hidden=true;
            configureImage(item,index);
          }
        });

        if(total>visible){
          const controls=document.createElement('div');
          controls.className='portfolio-gallery-controls';
          controls.setAttribute('role','group');
          controls.setAttribute('aria-label',isEnglish?'More portfolio photos':'Още снимки от портфолиото');

          const status=document.createElement('p');
          status.className='portfolio-gallery-status';
          status.id='portfolioGalleryStatus';
          status.setAttribute('aria-live','polite');

          const more=document.createElement('button');
          more.type='button';
          more.className='portfolio-load-more';
          more.textContent=isEnglish?'Load more photos':'Виж още снимки';

          const update=()=>{
            status.textContent=isEnglish?`Showing ${visible} of ${total} photos`:`Показани ${visible} от ${total} снимки`;
            more.hidden=visible>=total;
          };

          more.addEventListener('click',()=>{
            const end=Math.min(visible+batchSize,total);
            for(let index=visible;index<end;index++){
              const item=items[index];
              if(!item.isConnected)gallery.appendChild(item);
              item.hidden=false;
              configureImage(item,index);
            }
            visible=end;
            update();
          });

          controls.append(status,more);
          gallery.insertAdjacentElement('afterend',controls);
          gallery.setAttribute('aria-describedby',status.id);
          update();
        }
      }

      const lb=document.getElementById('lightbox');
      const close=document.getElementById('lightboxClose');
      if(lb && close){
        lb.setAttribute('role','dialog');
        lb.setAttribute('aria-modal','true');
        lb.setAttribute('aria-label',isEnglish?'Photo viewer':'Преглед на снимка');
        close.setAttribute('aria-label',isEnglish?'Close photo':'Затвори снимката');

        if(!document.getElementById('lightboxBack')){
          const back=document.createElement('button');
          back.id='lightboxBack';
          back.type='button';
          back.textContent=isEnglish?'← Back to gallery':'← Назад към галерията';
          back.setAttribute('aria-label',isEnglish?'Back to gallery':'Назад към галерията');
          back.style.cssText='position:absolute;left:20px;bottom:20px;z-index:2;padding:12px 18px;border:1px solid rgba(195,152,90,.45);border-radius:999px;background:rgba(9,8,6,.72);backdrop-filter:blur(12px);color:#f3ecdc;font:500 13px Montserrat,Arial,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35);';
          back.addEventListener('mouseenter',()=>{back.style.background='rgba(195,152,90,.18)';});
          back.addEventListener('mouseleave',()=>{back.style.background='rgba(9,8,6,.72)';});
          back.addEventListener('click',()=>close.click());
          lb.appendChild(back);
        }

        let lastTrigger=null;
        const syncLightboxState=()=>{
          const open=lb.classList.contains('open');
          document.body.classList.toggle('lightbox-open',open);
          if(open){
            lb.setAttribute('aria-hidden','false');
          }else{
            lb.setAttribute('aria-hidden','true');
            document.body.style.overflow='';
            if(lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
          }
        };

        gallery?.addEventListener('click',event=>{
          const item=event.target.closest('.gallery-item');
          if(item&&gallery.contains(item))lastTrigger=item;
        },true);

        const observer=new MutationObserver(syncLightboxState);
        observer.observe(lb,{attributes:true,attributeFilter:['class']});
        syncLightboxState();

        document.addEventListener('keydown',event=>{
          if(!lb.classList.contains('open')) return;
          if(event.key==='Escape'){
            event.preventDefault();
            close.click();
          }
          if(event.key==='Tab'){
            const focusables=[close,document.getElementById('lightboxBack')].filter(Boolean);
            if(!focusables.length) return;
            const first=focusables[0],last=focusables[focusables.length-1];
            if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
          }
        });
      }
    };

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});
    else prepare();
  }

  if(location.pathname.endsWith('/uslugi-ceni.html') || location.pathname==='/uslugi-ceni.html' || location.pathname.includes('/uslugi-ceni.html')){
    const showPricing=()=>{
      document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale').forEach(el=>{el.style.opacity='1';el.style.transform='none';});

      // The calculator initializes itself on page load. On phones that initialization can
      // trigger its result-scroll helper. A normal navigation to Pricing should always
      // open at the top; result scrolling remains available after an actual Calculate tap.
      if(!location.hash && window.matchMedia('(max-width: 768px)').matches){
        let interacted=false;
        const markInteraction=()=>{interacted=true;};
        document.addEventListener('pointerdown',markInteraction,{once:true,capture:true});
        document.addEventListener('keydown',markInteraction,{once:true,capture:true});
        document.addEventListener('touchstart',markInteraction,{once:true,capture:true,passive:true});
        window.setTimeout(()=>{
          if(!interacted && window.scrollY>0) window.scrollTo({top:0,left:0,behavior:'auto'});
        },260);
      }
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showPricing,{once:true});else showPricing();
  }

  const loadComplete=()=>{if(document.documentElement.dataset.memoryEnglishComplete==='1')return;document.documentElement.dataset.memoryEnglishComplete='1';const complete=document.createElement('script');complete.src='/assets/js/language-switch-complete.js?v=2026081901';complete.onerror=()=>{};document.head.appendChild(complete);};
  const s=document.createElement('script');s.src='/assets/js/language-switch-runtime.js?v=2026081901';s.onload=loadComplete;s.onerror=loadComplete;document.head.appendChild(s);
})();
