(()=>{
  const p=new URLSearchParams(location.search);
  const en=p.get('lang')==='en'||location.pathname.startsWith('/en/');
  if(!en)return;

  const M={
    /* Portfolio */
    'Подбрано сватбено фото портфолио на Memory Photo & Video — емоция, светлина, детайл и естествени моменти.':'A curated wedding photography portfolio by Memory Photo & Video — emotion, light, detail and authentic moments.',
    'Подбрани кадри от сватби, фотосесии и специални събития.':'Selected frames from weddings, photo sessions and special events.',
    'Подбрани кадри':'Selected frames',
    'Истории, които започват с един кадър.':'Stories that begin with a single frame.',
    'Тук не търсим просто „перфектната“ снимка. Търсим онази, която след години ще ви върне мириса на букета, погледа на човека до вас и начина, по който е звучала онази вечер.':'We are not simply looking for the “perfect” photo. We are looking for the one that years from now will bring back the scent of the bouquet, the look of the person beside you and the way that evening sounded.',
    'Философията на Memory':'The Memory philosophy',
    'Естествено. Емоционално. Вечно.':'Natural. Emotional. Timeless.',
    'Наблюдаваме, предвиждаме и се намесваме само когато моментът го изисква. Така кадрите остават живи, а не постановъчни.':'We observe, anticipate and step in only when the moment requires it. That keeps the frames alive rather than staged.',
    'Сватбена фотогалерия':'Wedding photo gallery',
    'Отвори снимка':'Open photo',
    'Memory Photo & Video — портфолио':'Memory Photo & Video — portfolio',
    'Сватбена фотография':'Wedding photography',
    'Сватбена фотография — нов кадър':'Wedding photography — new frame',
    'Това е само част от работата ни. В реалния ден вниманието ни е върху вас — не върху това колко снимки ще направим.':'This is only a selection of our work. On the actual day, our attention is on you — not on how many photos we take.',

    /* Videos */
    'Сватбени видеа | Memory Photo & Video':'Wedding Videos | Memory Photo & Video',
    'Сватбени филми, сватбени трейлъри с кино визия, бизнес видеа и трейлъри за балове от Memory Photo & Video.':'Wedding films, cinematic wedding trailers, business videos and prom trailers by Memory Photo & Video.',
    'Сватбени филми':'Wedding films',
    'Денят ви, разказан в движение.':'Your day, told in motion.',
    'Сватбен филм не е просто монтаж от кадри. Той е ритъм, звук, погледи и онези секунди, които иначе минават твърде бързо.':'A wedding film is more than an edit of footage. It is rhythm, sound, glances and those seconds that otherwise pass too quickly.',
    'Вижте историята':'See the story',
    'Пуснете звука.':'Turn up the sound.',
    'Тук е мястото да усетите атмосферата, преди още да сме се запознали.':'This is where you can feel the atmosphere before we have even met.',
    'Сватби':'Weddings',
    'Сватбени истории':'Wedding stories',
    'Подбрани трейлъри и тийзъри от истински сватбени дни.':'Selected trailers and teasers from real wedding days.',
    'Емоционален сватбен трейлър с кино атмосфера.':'An emotional wedding trailer with a cinematic atmosphere.',
    'Сватбен трейлър с кино визия':'Cinematic wedding trailer',
    'Емоционален сватбен трейлър.':'An emotional wedding trailer.',
    'Сватбен трейлър':'Wedding trailer',
    'Кратък сватбен трейлър с кино визия.':'A short cinematic wedding trailer.',
    'Елегантно и естествено сватбено усещане.':'An elegant and natural wedding feeling.',
    'Сватбен тийзър':'Wedding teaser',
    'Една нестандартна сватба дълбоко в Родопите.':'A unique wedding deep in the Rhodopes.',
    'Моменти на нежност, блестящи от любов.':'Moments of tenderness, glowing with love.',
    'Бизнес и реклама':'Business & Advertising',
    'Бизнес и рекламни видеа':'Business & Advertising Videos',
    'Истории за брандове, места и услуги.':'Stories for brands, places and services.',
    'Представително документално видео.':'A documentary-style presentation video.',
    'Промо видео':'Promo video',
    'Динамично промо видео.':'A dynamic promotional video.',
    'Балове':'Proms',
    'Балове и училищни трейлъри':'Proms & School Trailers',
    'Енергия, хора и моменти, които заслужават да останат.':'Energy, people and moments worth keeping.',
    'Трейлър за бал 2026.':'Prom trailer 2026.',
    'Трейлър за бал':'Prom trailer',
    'Проверете датата си и ни разкажете накратко как си представяте вашия ден.':'Check your date and briefly tell us how you imagine your day.',

    /* Shared / navigation / accessibility */
    'Икона на Memory Photo & Video':'Memory Photo & Video icon',
    'Отвори менюто':'Open menu',
    'Затвори':'Close',
    'Начало':'Home','Портфолио':'Portfolio','Видео':'Videos','Цени':'Pricing','Свободни дати':'Availability','За нас':'About',
    'Проверете свободна дата':'Check availability','Проверете свободната дата':'Check availability','Вижте снимките':'View photos','Вижте цените':'View pricing',
    'Към съдържанието':'Skip to content','Меню':'Menu',

    /* Availability / calendar */
    'Свободни дати | Memory Photo & Video':'Availability | Memory Photo & Video',
    'Проверете свободните дати за вашето събитие и вижте актуалната заетост по месеци.':'Check availability for your event and see the current schedule by month.',
    'Проверете свободните дати за вашето събитие и се ориентирайте бързо кои дати са свободни.':'Check availability for your event and quickly see which dates are available.',
    'Актуален календар':'Live calendar','Ясен статус':'Clear status','Бърза следваща стъпка':'Quick next step',
    'СВОБОДНО / ЧАСТИЧНО / ЗАЕТО':'AVAILABLE / PARTIALLY / BOOKED',
    'Предишен месец':'Previous month','Следващ месец':'Next month',
    'Свободен':'Available','Свободна':'Available','Свободни':'Available','Частично':'Partially booked','Частично свободен':'Partially booked','Зает':'Booked','Заето':'Booked',
    'Януари':'January','Февруари':'February','Март':'March','Април':'April','Май':'May','Юни':'June','Юли':'July','Август':'August','Септември':'September','Октомври':'October','Ноември':'November','Декември':'December',
    'Пн':'Mon','Вт':'Tue','Ср':'Wed','Чт':'Thu','Пт':'Fri','Сб':'Sat','Нд':'Sun',

    /* Common labels that can appear in generated UI */
    'Изпращане...':'Sending...','Резултат':'Result','Обща ориентировъчна сума':'Estimated total','Няма избрани услуги.':'No services selected.',
    'Изчисли':'Calculate','Нулирай':'Reset','Калкулатор':'Calculator','Други събития':'Other events','Тип събитие':'Event type','Часове':'Hours','Хора в екипа':'Team members',
    'Рожден ден':'Birthday','Кръщене':'Baptism','Фирмено събитие':'Corporate event','Друго':'Other','Индивидуален проект':'Individual project',
    'Име':'Name','Телефон':'Phone','Имейл':'Email','Дата на събитието':'Event date','Локация':'Location','Избрана оферта':'Selected offer','Обобщение':'Summary','Допълнителни детайли':'Additional details',
    'Съгласен/на съм личните ми данни да бъдат използвани за връзка по това запитване.':'I agree that my personal data may be used to contact me regarding this inquiry.',
    'Моля, попълнете име.':'Please enter your name.','Моля, попълнете телефон.':'Please enter your phone number.','Моля, попълнете имейл.':'Please enter your email.','Моля, изберете дата на събитието.':'Please select the event date.',
    'Запитването беше изпратено успешно.':'Your inquiry was sent successfully.','Възникна проблем при изпращането.':'There was a problem sending your inquiry.','Грешка при връзката. Опитайте отново.':'Connection error. Please try again.'
  };

  const keys=Object.keys(M).sort((a,b)=>b.length-a.length);
  const tr=v=>keys.reduce((x,k)=>x.includes(k)?x.split(k).join(M[k]):x,v||'');

  function translateNodeText(node){
    if(!node.nodeValue || !/[А-Яа-яЁё]/.test(node.nodeValue))return;
    const parent=node.parentElement;
    if(parent?.closest('script,style,noscript,template'))return;
    const next=tr(node.nodeValue);
    if(next!==node.nodeValue)node.nodeValue=next;
  }

  function translateAll(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while(n=walker.nextNode())nodes.push(n);
    nodes.forEach(translateNodeText);

    document.querySelectorAll('title,meta[content],img[alt],iframe[title],[aria-label],[title],[placeholder],input[value],textarea[placeholder]').forEach(el=>{
      ['content','alt','title','aria-label','placeholder','value'].forEach(a=>{
        if(el.hasAttribute(a)){
          const old=el.getAttribute(a),next=tr(old);
          if(next!==old)el.setAttribute(a,next);
        }
      });
    });
    document.title=tr(document.title);
    document.documentElement.lang='en';
  }

  function audit(){
    if(!document.body)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const remaining=[];let n;
    while(n=walker.nextNode()){
      if(n.parentElement?.closest('script,style,noscript,template'))continue;
      if(/[А-Яа-яЁё]/.test(n.nodeValue||''))remaining.push(n.nodeValue.trim());
    }
    const unique=[...new Set(remaining.filter(Boolean))];
    if(unique.length)console.warn('[Memory EN audit] Untranslated Bulgarian text:',unique);
    else console.info('[Memory EN audit] PASS — no Bulgarian text nodes remain.');
  }

  const run=()=>{translateAll();setTimeout(()=>{translateAll();audit()},120);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  let timer=0;
  new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(translateAll,60)}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content','alt','title','aria-label','placeholder','value']});
})();
