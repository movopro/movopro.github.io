const startLanguageRuntime=()=>{
  const path=location.pathname;
  const isEnglish=path.startsWith('/en/');
  const clean=path.replace(/^\/en\//,'').replace(/^\//,'')||'index.html';
  const map={'':'index.html','index.html':'index.html','portfolio.html':'portfolio.html','videos.html':'videos.html','uslugi-ceni.html':'uslugi-ceni.html','availability.html':'availability.html','about.html':'about.html','svatba-izbrani.html':'svatba-izbrani.html'};
  const file=map[clean]||'index.html';
  const href=isEnglish?`/${file}`:`/en/${file}`;

  /* Remove every old switcher before creating the one canonical control. */
  document.querySelectorAll('.language-switch').forEach(el=>el.remove());
  const switchStyle=document.createElement('style');
  switchStyle.textContent=`
    .language-switch{position:fixed!important;top:10px!important;right:12px!important;z-index:99999!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-width:0!important;width:auto!important;height:42px!important;padding:8px 12px!important;box-sizing:border-box!important;border-radius:999px!important;white-space:nowrap!important;}
    @media (max-width:1100px) and (pointer:coarse){
      html,body{overflow-x:hidden!important;max-width:100%!important;}
      .home-filmstrip{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;}
      .home-hero{display:flex!important;align-items:center!important;justify-content:center!important;min-height:100svh!important;overflow:hidden!important;padding:82px 12px 28px!important;box-sizing:border-box!important;}
      .home-hero__inner{position:relative!important;inset:auto!important;width:min(680px,calc(100% - 24px))!important;max-width:680px!important;display:block!important;margin:0 auto!important;}
      .home-hero__photo{display:none!important;}
      .home-hero__copy{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;max-width:680px!important;margin:0 auto!important;box-sizing:border-box!important;text-align:center!important;padding:26px 20px 24px!important;}
      .home-kicker,.home-hero h1,.home-hero p{display:block!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important;}
      .home-hero h1{max-width:18ch!important;line-height:1.02!important;}
      .home-hero p{max-width:58ch!important;line-height:1.7!important;}
      .home-hero .home-actions,.home-hero .home-socials{display:flex!important;justify-content:center!important;align-items:center!important;}
      .home-hero .home-btn{transform:none!important;}
      .home-section,.home-section__head,.home-review,.home-video,.dj-card,.home-cta{text-align:center!important;}
      .home-section__head{grid-template-columns:1fr!important;}
      .home-review,.home-video,.dj-card{grid-template-columns:1fr!important;}
      .home-actions,.home-socials,.dj-links{justify-content:center!important;}
    }
  `;
  document.head.appendChild(switchStyle);

  const a=document.createElement('a');
  a.className='language-switch';
  a.href=href;
  a.setAttribute('aria-label',isEnglish?'Switch to Bulgarian':'Switch to English');
  a.innerHTML=isEnglish?'<span class="flag">🇧🇬</span><span class="code">BG</span>':'<span class="flag">🇬🇧</span><span class="code">EN</span>';
  document.body.appendChild(a);
  if(!isEnglish)return;

  const extra={
    'Истории, които започват с един кадър.':'Stories that begin with a single frame.',
    'Наблюдаваме, предвиждаме и се намесваме само когато моментът го изисква. Така кадрите остават живи, а не постановъчни.':'We observe, anticipate and step in only when the moment calls for it. That way, the images stay alive rather than staged.',
    'Това е само част от работата ни. В реалния ден вниманието ни е върху вас — не върху това колко снимки ще направим.':'This is only part of our work. On the day itself, our attention is on you — not on how many photographs we can take.',
    'Разкажете ни за вашата дата':'Tell us about your date','Ясни пакети,':'Clear packages,','професионално':'professional','покритие':'coverage','и гъвкав':'and flexible','калкулатор.':'calculator.',
    'Wedding film не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than a montage. It is rhythm, sound, glances and those seconds that would otherwise pass too quickly.',
    'Всички стойности са ориентировъчни и могат да се адаптират според локация, програма, продължителност и допълнителни изисквания.':'All prices are indicative and can be adapted to the location, schedule, duration and additional requirements.',
    'Актуализирана логика':'Updated logic','Няколко мига, които си струва да останат.':'Some moments are worth keeping close.','Няколко от любимите ни кадри от истински сватбени дни.':'Some of our favourite moments from real weddings.','Професионално структурирани':'Professionally structured','Сватбено покритие':'Wedding coverage','Гъвкави комбинации':'Flexible combinations','Три различни нива според мащаба на събитието, желаното покритие и нужния екип.':'Three levels based on the scale of the event, desired coverage and team size.','Денят ви, разказан в движение.':'Your day, told in motion.',
    'Сватбен филм не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than a montage. It is rhythm, sound, glances and those seconds that would otherwise pass too quickly.',
    'Представително документално видео.':'Documentary presentation video.','Елегантно и естествено сватбено усещане.':'An elegant and natural wedding feel.','Една нестандартна сватба дълбоко в Родопите.':'A unique wedding deep in the Rhodopes.','Моменти на нежност, блестящи от любов.':'Moments of tenderness and love.',
    'Проверете свободна дата':'Check availability','Проверете свободната дата':'Check availability','Проверете свободните дати':'Check availability','Разгледай портфолиото':'View portfolio','Разгледайте портфолиото':'View portfolio','Вижте снимките':'View photos','Вижте цените':'View pricing','Виж всички видеа':'View all videos','Вижте всички видеа':'View all videos',
    'Портфолио':'Portfolio','Начало':'Home','Видео':'Videos','Цени':'Pricing','Свободни дати':'Availability','За нас':'About','Подбрани кадри':'Selected frames','Философията на Memory':'The Memory philosophy','Естествено. Емоционално. Вечно.':'Natural. Emotional. Timeless.','Google отзиви':'Google reviews','Следвайте ни':'Follow us','Бързи връзки':'Quick links','Кърджали · България':'Kardzhali · Bulgaria',
    'Сватбени филми':'Wedding films','Вижте историята':'Feel the story','Пуснете звука.':'Turn up the sound.','Сватби':'Weddings','Сватбени истории':'Wedding stories','Бизнес и реклама':'Business & advertising','Бизнес и рекламни видеа':'Business & advertising videos','Балове':'School proms','Балове и училищни трейлъри':'School proms and trailers','Нека създадем':'Let’s create',
    'Хората зад кадрите':'The people behind the frames','Не сме просто зад камерата.':'We are more than people behind the camera.','Нашата история':'Our story','Видеограф · Основател':'Videographer · Founder','Фотограф и видеооператор · Съосновател':'Photographer & videographer · Co-founder','Асистент-оператор и монтажист':'Camera assistant & editor',
    'Услуги и цени':'Services & Pricing','Ясни пакети, професионално покритие и гъвкав калкулатор.':'Clear packages, professional coverage and a flexible calculator.','Сватбени пакети':'Wedding packages','Калкулатор':'Calculator','Сватба':'Wedding','Друго събитие':'Other event','Изпрати запитване':'Send inquiry','Нулирай':'Reset','Изчисли':'Calculate',
    'Свободно':'Available','Частично':'Partial','Заето':'Booked','Легенда':'Legend','Предишен месец':'Previous month','Следващ месец':'Next month','Пн':'Mon','Вт':'Tue','Ср':'Wed','Чт':'Thu','Пт':'Fri','Сб':'Sat','Нд':'Sun','Януари':'January','Февруари':'February','Март':'March','Април':'April','Май':'May','Юни':'June','Юли':'July','Август':'August','Септември':'September','Октомври':'October','Ноември':'November','Декември':'December','© 2026':'© 2026'
  };
  const translate=s=>{let out=s||'';for(const [bg,en]of Object.entries(extra))out=out.split(bg).join(en);return out;};
  const run=()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);
    nodes.forEach(node=>{if(node.parentElement?.closest('script,style,textarea'))return;if(node.nodeValue&&/[А-Яа-яЁё]/.test(node.nodeValue))node.nodeValue=translate(node.nodeValue);});
    document.querySelectorAll('title,meta[content],[alt],[aria-label],[title],[placeholder]').forEach(el=>['content','alt','aria-label','title','placeholder'].forEach(k=>{if(el.hasAttribute(k))el.setAttribute(k,translate(el.getAttribute(k)||''));}));
    document.title=translate(document.title);
  };
  run();let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,100)}).observe(document.body,{subtree:true,childList:true,characterData:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startLanguageRuntime,{once:true});else startLanguageRuntime();
