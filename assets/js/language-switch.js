document.addEventListener('DOMContentLoaded',()=>{
  const path=location.pathname;
  const isEnglish=path.startsWith('/en/');
  const clean=path.replace(/^\/en\//,'').replace(/^\//,'')||'index.html';
  const map={'':'index.html','index.html':'index.html','portfolio.html':'portfolio.html','videos.html':'videos.html','uslugi-ceni.html':'uslugi-ceni.html','availability.html':'availability.html','about.html':'about.html','svatba-izbrani.html':'svatba-izbrani.html'};
  const file=map[clean]||'index.html';
  const href=isEnglish?`/${file}`:`/en/${file}`;
  const a=document.createElement('a');
  a.className='language-switch';
  a.href=href;
  a.setAttribute('aria-label',isEnglish?'Switch to Bulgarian':'Switch to English');
  a.innerHTML=isEnglish?'<span class="flag">🇧🇬</span><span class="code">BG</span>':'<span class="flag">🇬🇧</span><span class="code">EN</span>';
  document.body.appendChild(a);

  if(!isEnglish) return;

  const extra={
    'Истории, които започват с един кадър.':'Stories that begin with a single frame.',
    'Наблюдаваме, предвиждаме и се намесваме само когато моментът го изисква. Така кадрите остават живи, а не постановъчни.':'We observe, anticipate and step in only when the moment calls for it. That way, the images stay alive rather than staged.',
    'Това е само част от работата ни. В реалния ден вниманието ни е върху вас — не върху това колко снимки ще направим.':'This is only part of our work. On the day itself, our attention is on you — not on how many photographs we can take.',
    'Разкажете ни за вашата дата':'Tell us about your date',
    'Ясни пакети,':'Clear packages,',
    'професионално':'professional',
    'покритие':'coverage',
    'и гъвкав':'and flexible',
    'калкулатор.':'calculator.',
    'Wedding film не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than a montage. It is rhythm, sound, glances and those seconds that would otherwise pass too quickly.',
    'Всички стойности са ориентировъчни и могат да се адаптират според локация, програма, продължителност и допълнителни изисквания.':'All prices are indicative and can be adapted to the location, schedule, duration and additional requirements.',
    'Актуализирана логика':'Updated logic',
    'Няколко мига, които си струва да останат.':'Some moments are worth keeping close.',
    'Няколко от любимите ни кадри от истински сватбени дни.':'Some of our favourite moments from real weddings.',
    'Професионално структурирани':'Professionally structured',
    'Сватбено покритие':'Wedding coverage',
    'Гъвкави комбинации':'Flexible combinations',
    'Три различни нива според мащаба на събитието, желаното покритие и нужния екип.':'Three levels based on the scale of the event, desired coverage and team size.',
    'Денят ви, разказан в движение.':'Your day, told in motion.',
    'Сватбен филм не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than a montage. It is rhythm, sound, glances and those seconds that would otherwise pass too quickly.',
    'Представително документално видео.':'Documentary presentation video.',
    'Елегантно и естествено сватбено усещане.':'An elegant and natural wedding feel.',
    'Една нестандартна сватба дълбоко в Родопите.':'A unique wedding deep in the Rhodopes.',
    'Моменти на нежност, блестящи от любов.':'Moments of tenderness and love.',
    'Проверете свободна дата':'Check availability',
    'Проверете свободната дата':'Check availability',
    'Проверете свободните дати':'Check availability',
    'Разгледай портфолиото':'View portfolio',
    'Разгледайте портфолиото':'View portfolio',
    'Вижте снимките':'View photos',
    'Вижте цените':'View pricing',
    'Виж всички видеа':'View all videos',
    'Вижте всички видеа':'View all videos',
    'Портфолио':'Portfolio','Начало':'Home','Видео':'Videos','Цени':'Pricing','Свободни дати':'Availability','За нас':'About',
    'Подбрани кадри':'Selected frames','Философията на Memory':'The Memory philosophy','Естествено. Емоционално. Вечно.':'Natural. Emotional. Timeless.',
    'Google отзиви':'Google reviews','Следвайте ни':'Follow us','Бързи връзки':'Quick links','Кърджали · България':'Kardzhali · Bulgaria',
    'Сватбени филми':'Wedding films','Вижте историята':'Feel the story','Пуснете звука.':'Turn up the sound.','Сватби':'Weddings','Сватбени истории':'Wedding stories','Бизнес и реклама':'Business & advertising','Бизнес и рекламни видеа':'Business & advertising videos','Балове':'School proms','Балове и училищни трейлъри':'School proms and trailers','Нека създадем':'Let’s create',
    'Хората зад кадрите':'The people behind the frames','Не сме просто зад камерата.':'We are more than people behind the camera.','Нашата история':'Our story','Видеограф · Основател':'Videographer · Founder','Фотограф и видеооператор · Съосновател':'Photographer & videographer · Co-founder','Асистент-оператор и монтажист':'Camera assistant & editor',
    'Услуги и цени':'Services & Pricing','Ясни пакети, професионално покритие и гъвкав калкулатор.':'Clear packages, professional coverage and a flexible calculator.','Сватбени пакети':'Wedding packages','Калкулатор':'Calculator','Сватба':'Wedding','Друго събитие':'Other event','Изпрати запитване':'Send inquiry','Нулирай':'Reset','Изчисли':'Calculate',
    'Свободно':'Available','Частично':'Partial','Заето':'Booked','Легенда':'Legend','Предишен месец':'Previous month','Следващ месец':'Next month','Пн':'Mon','Вт':'Tue','Ср':'Wed','Чт':'Thu','Пт':'Fri','Сб':'Sat','Нд':'Sun','Януари':'January','Февруари':'February','Март':'March','Април':'April','Май':'May','Юни':'June','Юли':'July','Август':'August','Септември':'September','Октомври':'October','Ноември':'November','Декември':'December',
    '© 2026':'© 2026'
  };

  const translate=s=>{
    let out=s||'';
    for(const [bg,en] of Object.entries(extra)) out=out.split(bg).join(en);
    return out;
  };

  const run=()=>{
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while(n=walker.nextNode()) nodes.push(n);
    nodes.forEach(node=>{
      if(node.parentElement?.closest('script,style,textarea')) return;
      if(node.nodeValue && /[А-Яа-яЁё]/.test(node.nodeValue)) node.nodeValue=translate(node.nodeValue);
    });
    document.querySelectorAll('title,meta[content],[alt],[aria-label],[title],[placeholder]').forEach(el=>{
      ['content','alt','aria-label','title','placeholder'].forEach(k=>{if(el.hasAttribute(k)) el.setAttribute(k,translate(el.getAttribute(k)||''));});
    });
    document.title=translate(document.title);
  };

  run();
  new MutationObserver(()=>run()).observe(document.body,{subtree:true,childList:true,characterData:true});
});
