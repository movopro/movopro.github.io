(()=>{
  const params=new URLSearchParams(location.search);
  const isEnglish=params.get('lang')==='en' || location.pathname.startsWith('/en/');
  const cleanPath=location.pathname.replace(/^\/en\//,'').replace(/^\//,'') || 'index.html';
  const fileMap={'':'index.html','index.html':'index.html','portfolio.html':'portfolio.html','videos.html':'videos.html','uslugi-ceni.html':'uslugi-ceni.html','availability.html':'availability.html','about.html':'about.html','svatba-izbrani.html':'svatba-izbrani.html'};
  const currentFile=fileMap[cleanPath]||'index.html';

  // Keep exactly one language control.
  document.querySelectorAll('.language-switch').forEach(el=>el.remove());
  if(!document.getElementById('language-runtime-style')){
    const st=document.createElement('style');
    st.id='language-runtime-style';
    st.textContent=`
      html.lang-en-pending{background:#0c0b09!important}
      body.lang-en-pending{background:#0c0b09!important;visibility:hidden!important}
      .language-switch{position:fixed!important;top:10px!important;right:12px!important;z-index:99999!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-width:0!important;width:auto!important;height:42px!important;padding:8px 12px!important;box-sizing:border-box!important;border-radius:999px!important;white-space:nowrap!important}
      @media(max-width:1100px) and (pointer:coarse){
        .language-switch{right:68px!important;top:9px!important}
        html,body{overflow-x:hidden!important;max-width:100%!important}
        .home-filmstrip{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}
        .home-hero{display:flex!important;align-items:center!important;justify-content:center!important;min-height:100svh!important;overflow:hidden!important;padding:82px 12px 28px!important;box-sizing:border-box!important}
        .home-hero__inner{position:relative!important;inset:auto!important;width:min(680px,calc(100% - 24px))!important;max-width:680px!important;display:block!important;margin:0 auto!important}
        .home-hero__photo{display:none!important}
        .home-hero__copy{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;max-width:680px!important;margin:0 auto!important;box-sizing:border-box!important;text-align:center!important;padding:26px 20px 24px!important}
        .home-kicker,.home-hero h1,.home-hero p{display:block!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important}
        .home-hero h1{max-width:18ch!important;line-height:1.02!important}
        .home-hero p{max-width:58ch!important;line-height:1.7!important}
        .home-hero .home-actions,.home-hero .home-socials{display:flex!important;justify-content:center!important;align-items:center!important}
        .home-section,.home-section__head,.home-review,.home-video,.dj-card,.home-cta{text-align:center!important}
        .home-section__head{grid-template-columns:1fr!important}
        .home-review,.home-video,.dj-card{grid-template-columns:1fr!important}
        .home-actions,.home-socials,.dj-links{justify-content:center!important}
      }
    `;
    document.head.appendChild(st);
  }

  const control=document.createElement('a');
  control.className='language-switch';
  control.href=isEnglish?`/${currentFile}`:`/${currentFile}?lang=en`;
  control.setAttribute('aria-label',isEnglish?'Switch to Bulgarian':'Switch to English');
  control.innerHTML=isEnglish?'<span class="flag">🇧🇬</span><span class="code">BG</span>':'<span class="flag">🇬🇧</span><span class="code">EN</span>';
  if(document.body) document.body.appendChild(control);

  if(!isEnglish){
    document.documentElement.classList.remove('lang-en-pending');
    if(document.body) document.body.classList.remove('lang-en-pending');
    return;
  }

  const map={
    'Начало':'Home','Портфолио':'Portfolio','Видео':'Videos','Цени':'Pricing','Ценоразпис':'Pricing','Свободни дати':'Availability','За нас':'About','Меню':'Menu','Отвори менюто':'Open menu','Към съдържанието':'Skip to content',
    'Проверете свободна дата':'Check availability','Проверете свободната дата':'Check availability','Проверете свободните дати':'Check availability','Проверете датата си':'Check your date','Вижте снимките':'View photos','Разгледай портфолиото':'View portfolio','Разгледайте портфолиото':'View portfolio','Виж всички видеа':'View all videos','Вижте всички видеа':'View all videos','Вижте работата ни':'View our work','Вижте цените':'View pricing','Към портфолиото':'View portfolio','Към калкулатора':'View calculator','Изпрати запитване':'Send inquiry','Запитване за пакета':'Ask about this package','Нулирай':'Reset','Изчисли':'Calculate',
    'Вашият ден. Вашата история.':'Your day. Your story.','Снимаме истинските моменти — тихите, шумните, красивите и неподправените. Фото и видео, които не просто показват как е изглеждал денят, а ви връщат в него.':'We capture the quiet, the loud, the beautiful and the real. Photos and films made to bring you back to the feeling of the day — not simply show how it looked.',
    'Избрани кадри':'Selected frames','Подбрани кадри':'Selected frames','Няколко мига, които си струва да останат.':'Some moments are worth keeping close.','Няколко от любимите ни кадри от истински сватбени дни.':'Some of our favourite frames from real wedding days.','Новата серия вече е подредена в отделна история — емоция, детайли, светлина и истински моменти.':'The new series is arranged as a separate story — emotion, details, light and real moments.','Виж всички избрани кадри':'View the full selected series','Пълно портфолио':'Full portfolio','Истории, които започват с един кадър.':'Stories that begin with a single frame.','Философията на Memory':'The Memory philosophy','Естествено. Емоционално. Вечно.':'Natural. Emotional. Timeless.','Наблюдаваме, предвиждаме и се намесваме само когато моментът го изисква. Така кадрите остават живи, а не постановъчни.':'We observe, anticipate and step in only when the moment calls for it. That way, the images stay alive rather than staged.','Това е само част от работата ни. В реалния ден вниманието ни е върху вас — не върху това колко снимки ще направим.':'This is only part of our work. On the day itself, our attention is on you — not on how many photographs we can take.',
    'Google отзиви':'Google reviews','Доверието е едно от най-важните неща, когато някой поверява спомените си на нас.':'Trust is one of the most important things when someone entrusts their memories to us.','Виж всички 21 отзива в Google →':'See all 21 Google reviews →','Вашият ден е на първо място.':'Your day comes first.','Вижте всички реални мнения в Google и преценете сами как клиентите описват преживяването.':'See all real reviews on Google and decide for yourself how clients describe the experience.','Красив кадър, спокоен процес.':'Beautiful images, a calm process.','Добрата работа започва преди самото събитие — с ясна комуникация и внимание към детайла.':'Good work starts before the event itself — with clear communication and attention to detail.','Публичният Google рейтинг в момента е 5.0/5 от 21 отзива.':'Our public Google rating is currently 5.0/5 from 21 reviews.',
    'Историята не спира в един кадър.':'The story does not stop at a single frame.','Звукът, движението и паузите дават живот на спомена. Вижте кратък сватбен филм и след това разгледайте всички видеа.':'Sound, movement and pauses bring a memory to life. Watch a short wedding film and then explore all our videos.','Сватбен филм':'Wedding film','Вашата история, разказана с движение и звук.':'Your story, told through movement and sound.','Когато сте готови да видите още, целият ни видео архив е събран на едно място.':'When you are ready to see more, our full video archive is in one place.',
    'DJ партньор':'DJ partner','Музиката е част от атмосферата.':'Music is part of the atmosphere.','DJ PeppyStar е независим партньор, към когото можете да се обърнете директно за музика и озвучаване.':'DJ PeppyStar is an independent partner you can contact directly for music and sound.','Енергия, стил и правилната музика за вашето събитие.':'Energy, style and the right music for your event.','Сватби, частни събития и фирмени партита. Подбор на музика според публиката и атмосферата.':'Weddings, private events and corporate parties. Music selected for the audience and atmosphere.',
    'Вашата дата':'Your date','Да запазим този ден завинаги.':'Let’s keep this day forever.','Проверете свободната дата и ни разкажете малко за вашата сватба.':'Check your date and tell us a little about your wedding.','Кърджали · България':'Kardzhali · Bulgaria','Следвайте ни':'Follow us','Бързи връзки':'Quick links','Сватбена фотография и видеография с внимание към емоцията, светлината и детайла.':'Wedding photography and videography focused on emotion, light and detail.','Всички права запазени.':'All rights reserved.',
    'Сватбени филми':'Wedding films','Денят ви, разказан в движение.':'Your day, told in motion.','Сватбен филм не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than a montage. It is rhythm, sound, glances and those seconds that would otherwise pass too quickly.','Вижте историята':'Feel the story','Пуснете звука.':'Turn up the sound.','Тук е мястото да усетите атмосферата, преди още да сме се запознали.':'This is where you can feel the atmosphere before we even meet.','Сватби':'Weddings','Сватбени истории':'Wedding stories','Подбрани трейлъри и тийзъри от истински сватбени дни.':'Selected trailers and teasers from real wedding days.','Емоционален сватбен трейлър с кино атмосфера.':'An emotional wedding trailer with a cinematic atmosphere.','Емоционален сватбен трейлър.':'Emotional wedding trailer.','Кратък сватбен трейлър с кино визия.':'Short wedding trailer with a cinematic feel.','Елегантно и естествено сватбено усещане.':'An elegant and natural wedding feel.','Една нестандартна сватба дълбоко в Родопите.':'A unique wedding deep in the Rhodopes.','Моменти на нежност, блестящи от любов.':'Moments of tenderness and love.','Сватбен трейлър':'Wedding trailer','Сватбен тийзър':'Wedding teaser','с кино визия':'with a cinematic feel','Бизнес и реклама':'Business & advertising','Бизнес и рекламни видеа':'Business & advertising videos','Истории за брандове, места и услуги.':'Stories for brands, venues and services.','Представително документално видео.':'Documentary presentation video.','Динамично промо видео.':'Dynamic promotional video.','Промо видео':'Promotional video','Балове':'School proms','Балове и училищни трейлъри':'School proms and trailers','Енергия, хора и моменти, които заслужават да останат.':'Energy, people and moments worth remembering.','Трейлър за бал 2026.':'Prom trailer 2026.','Трейлър за бал':'Prom trailer','Нека създадем':'Let’s create','Вашият филм може да започне тук.':'Your film can start here.','Проверете датата си и ни разкажете накратко как си представяте вашия ден.':'Check your date and tell us briefly how you imagine your day.',
    'Хората зад кадрите':'The people behind the frames','Не сме просто зад камерата.':'We are more than people behind the camera.','Ние сме хората, които ще прекарат с вас най-важните часове от един ден, който сте чакали дълго. Затова за нас професионализмът започва с отношението, не с техниката.':'We are the people who will spend the most important hours of a long-awaited day with you. For us, professionalism starts with how we treat you, not with the equipment.','Най-силният кадър е този, който ви кара да почувствате момента, а не просто да го видите.':'The strongest frame is the one that makes you feel the moment, not simply see it.','Видеограф · Основател':'Videographer · Founder','Фотограф и видеооператор · Съосновател':'Photographer & videographer · Co-founder','Асистент-оператор и монтажист':'Camera assistant & editor','Нашата история':'Our story','От 2017 г. създаваме Memory.':'We have been creating Memory since 2017.','През 2017 г. обединихме уменията и страстта си и основахме Memory Photo & Video — студио, посветено на сватбени и семейни събития в Кърджали и региона.':'In 2017 we combined our skills and passion and founded Memory Photo & Video — a studio dedicated to weddings and family events in Kardzhali and the region.','Работим по сватби, кръщенета, годежи, рождени дни и фирмени събития. Целта ни е да бъдем спокойната част от деня ви, докато създаваме кадрите, които ще останат.':'We work at weddings, christenings, engagements, birthdays and corporate events. Our goal is to be the calm part of your day while creating the frames that remain.','Нашата цел е проста: когато гледате снимките и филма след години, да не виждате просто красиво съдържание. Да видите себе си.':'Our goal is simple: years from now, when you watch the photos and film, we want you to see more than beautiful content. We want you to see yourselves.',
    'Услуги и цени':'Services & Pricing','Ясни пакети, професионално покритие и гъвкав калкулатор.':'Clear packages, professional coverage and a flexible calculator.','Ясни пакети,':'Clear packages,','професионално':'professional','покритие':'coverage','и гъвкав':'and flexible','калкулатор.':'calculator.','Тук ще откриеш актуалните сватбени пакети, ориентировъчни цени за други събития и калкулатор, с който можеш да изчислиш приблизителна стойност според екип, допълнителни часове, транспорт, дрон и допълнителни услуги.':'Here you will find our current wedding packages, indicative prices for other events and a calculator for an estimate based on team size, extra hours, travel, drone and additional services.','До 10 часа':'Up to 10 hours','Сватбено покритие':'Wedding coverage','Фото + видео':'Photo + video','Гъвкави комбинации':'Flexible combinations','Актуализирани цени':'Updated pricing','Професионално структурирани':'Professionally structured','Сватбени пакети':'Wedding packages','Три различни нива според мащаба на събитието, желаното покритие и нужния екип.':'Three levels based on the scale of the event, desired coverage and team size.','до 10 часа ангажимент':'up to 10 hours','Всеки пакет включва':'Every package includes','Неограничен брой кадри и обработка.':'Unlimited photographs and editing.','Видео трейлър с най-важните моменти.':'Wedding trailer with the key moments.','Цял репортажен филм.':'Full documentary wedding film.','Фотосесия в деня на сватбата.':'Couple session on the wedding day.','Заснемане до 10 часа.':'Up to 10 hours of coverage.','Запис на звук с външен рекордер.':'External audio recording.','Репортажна фотография.':'Documentary wedding photography.','Предаване на готовия материал.':'Delivery of the finished material.','Стандартен':'Standard','Премиум':'Premium','Препоръчан':'Recommended','Ултра':'Ultra','Подходящ за':'Best for','Екип от 2 души — 1 фотограф + 1 оператор.':'2-person team — 1 photographer + 1 videographer.','Пълно покритие на сватбения ден с ясен баланс между фото и видео.':'Full wedding-day coverage with a balanced photo/video approach.','Подходящ пакет за двойки, които искат силно и изчистено цялостно покритие.':'A strong all-round package for couples who want clean, complete coverage.','Екип от 3 души — 2 фотографи + 1 оператор или 1 фотограф + 2 оператори.':'3-person team — 2 photographers + 1 videographer or 1 photographer + 2 videographers.','По-широко покритие на подготовката, детайлите и паралелните моменти.':'Broader coverage of preparations, details and parallel moments.','По-богат монтаж, по-силен трейлър и по-голяма визуална свобода.':'Richer editing, a stronger trailer and more visual freedom.','Екип от 4 души — 2 фотографи + 2 оператори.':'4-person team — 2 photographers + 2 videographers.','Максимално покритие с повече ъгли, повече динамика и по-пълен разказ.':'Maximum coverage with more angles, more dynamics and a fuller story.','Най-силният вариант за по-големи сватби и двойки, които искат максимално покритие.':'The strongest option for larger weddings and couples wanting maximum coverage.','Дрон заснемане — включено.':'Drone coverage — included.','Фото албум до 25 × 25 см — включен.':'Photo album up to 25 × 25 cm — included.','Следсватбена фотосесия — включена.':'Post-wedding photo session — included.','Всички стойности са ориентировъчни и могат да се адаптират според локация, програма, продължителност и допълнителни изисквания.':'All prices are indicative and can be adapted to the location, schedule, duration and additional requirements.','Калкулатор':'Calculator','Ориентировъчна стойност според избрания екип, допълнителни часове и услуги.':'An estimate based on your chosen team, extra hours and services.','Актуализирана логика':'Updated logic','Сватба':'Wedding','Друго събитие':'Other event','Допълнителни часове':'Extra hours','Транспорт':'Travel','Дрон':'Drone','Албум':'Album','Допълнителни услуги':'Additional services',
    'Свободни дати':'Availability','Проверете свободните дати за вашето събитие и вижте актуалната заетост по месеци.':'Check availability for your event and see the current booking status by month.','Свободни':'Available','Частично':'Partially available','Заето':'Booked','Легенда':'Legend','Предишен месец':'Previous month','Следващ месец':'Next month','Януари':'January','Февруари':'February','Март':'March','Април':'April','Май':'May','Юни':'June','Юли':'July','Август':'August','Септември':'September','Октомври':'October','Ноември':'November','Декември':'December','Пн':'Mon','Вт':'Tue','Ср':'Wed','Чт':'Thu','Пт':'Fri','Сб':'Sat','Нд':'Sun','Изберете година':'Select year','Следващата година':'Next year','Предишната година':'Previous year','Вашата дата':'Your date','Да запазим този ден завинаги.':'Let’s keep this day forever.','Разкажете ни за вашата дата':'Tell us about your date',
    '© 2026':'© 2026','Икона на Memory Photo & Video':'Memory Photo & Video icon'
  };

  // Longer phrases first; then individual UI words. This catches mixed BG/EN fragments too.
  const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
  const translate=value=>{
    let out=value||'';
    for(const key of keys) if(out.includes(key)) out=out.split(key).join(map[key]);
    return out;
  };

  const translatePage=()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while(node=walker.nextNode()) nodes.push(node);
    for(const n of nodes){
      if(n.parentElement?.closest('script,style,textarea,noscript')) continue;
      let value=n.nodeValue||'';
      if(/^(?:\\n|\/n)+$/.test(value.trim())){n.nodeValue='';continue;}
      if(/[А-Яа-яЁё]/.test(value)) n.nodeValue=translate(value);
    }
    document.querySelectorAll('title,meta[content],[alt],[aria-label],[title],[placeholder]').forEach(el=>{
      for(const attr of ['content','alt','aria-label','title','placeholder']) if(el.hasAttribute(attr)) el.setAttribute(attr,translate(el.getAttribute(attr)||''));
    });
    document.title=translate(document.title);

    // Keep English mode when moving through the normal site's internal links.
    document.querySelectorAll('a[href]').forEach(link=>{
      const raw=link.getAttribute('href');
      if(!raw || raw.startsWith('#') || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return;
      if(raw.includes('lang=en')) return;
      const hash=raw.includes('#')?raw.slice(raw.indexOf('#')):'';
      const base=hash?raw.slice(0,raw.indexOf('#')):raw;
      if(!base || base.startsWith('../') || base.startsWith('/assets/')) return;
      if(base.startsWith('/')) link.setAttribute('href',`${base}?lang=en${hash}`); else link.setAttribute('href',`/${base}?lang=en${hash}`);
    });

    document.documentElement.classList.remove('lang-en-pending');
    if(document.body) document.body.classList.remove('lang-en-pending');
  };

  const run=()=>{try{translatePage()}catch(e){console.warn('English translation runtime:',e);document.documentElement.classList.remove('lang-en-pending');if(document.body)document.body.classList.remove('lang-en-pending')}};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  let timer=0;
  if(document.body) new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,80)}).observe(document.body,{subtree:true,childList:true,characterData:true});
  setTimeout(()=>{document.documentElement.classList.remove('lang-en-pending');if(document.body)document.body.classList.remove('lang-en-pending')},1800);
})();
