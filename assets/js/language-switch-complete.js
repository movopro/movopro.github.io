(()=>{
  const p=new URLSearchParams(location.search);
  const en=p.get('lang')==='en'||location.pathname.startsWith('/en/');
  if(!en)return;

  /*
   * Final translation pass.
   * The main runtime handles the static site copy. This layer is intentionally
   * focused on copy that is created later by main.js / pricing-fix.js and on
   * pages/phrases that were previously outside the original dictionary.
   */
  const M={
    /* Home */
    'Вашият ден. Вашата история.':'Your day. Your story.',
    'Снимаме истинските моменти — тихите, шумните, красивите и неподправените. Фото и видео, които не просто показват как е изглеждал денят, а ви връщат в него.':'We capture the real moments — the quiet, the loud, the beautiful and the unfiltered. Photo and video that do not simply show what the day looked like, but take you back to it.',
    'Разгледай портфолиото':'Browse the portfolio',
    'Избрани кадри':'Selected frames',
    'Няколко мига, които си струва да останат.':'Some moments are worth keeping.',
    'Новата серия вече е подредена в отделна история — емоция, детайли, светлина и истински моменти.':'The new series is now arranged as a separate story — emotion, details, light and real moments.',
    'Виж всички избрани кадри':'View all selected frames',
    'Виж всички избрани кадри':'View all selected frames',
    'Колаж от избрани сватбени кадри на Memory Photo & Video':'Collage of selected wedding photos by Memory Photo & Video',
    'Публичният Google рейтинг в момента е 5.0/5 от 21 отзива.':'Our public Google rating is currently 5.0/5 from 21 reviews.',
    'Google отзиви':'Google reviews',
    'Доверието е едно от най-важните неща, когато някой поверява спомените си на нас.':'Trust is one of the most important things when someone entrusts us with their memories.',
    'Вашият ден е на първо място.':'Your day comes first.',
    'Музиката е част от атмосферата.':'Music is part of the atmosphere.',
    'DJ партньор':'DJ partner',
    'Следвайте ни':'Follow us',
    'Бързи връзки':'Quick links',
    'Контакти':'Contact',
    'Телефон':'Phone',
    'Имейл':'Email',
    'Кърджали и цяла България':'Kardzhali and all of Bulgaria',
    'Всички права запазени.':'All rights reserved.',

    /* Selected wedding gallery */
    'Избрани сватбени кадри | Memory Photo & Video':'Selected Wedding Photos | Memory Photo & Video',
    'Избрани сватбени фотографии от Memory Photo & Video.':'Selected wedding photographs by Memory Photo & Video.',
    'Избрана серия':'Selected series',
    'Подбрани кадри от реални сватбени моменти — емоция, детайли, портрети и атмосфера.':'Selected frames from real wedding moments — emotion, details, portraits and atmosphere.',
    'Избрани сватбени кадри':'Selected wedding photos',
    'Избран сватбен кадър':'Selected wedding photo',
    'Цялото портфолио':'Full portfolio',

    /* Pricing calculator: generated after the translation scripts load */
    'Сватбена фотография:':'Wedding photography:',
    'Сватбена видеография:':'Wedding videography:',
    'Доп. часове:':'Extra hours:',
    'Допълнителни часове:':'Extra hours:',
    'Дрон за целия ден':'Drone for the full day',
    'Дрон:':'Drone:',
    'Сурови файлове':'Raw files',
    'Фотосесия в отделен ден':'Photo session on a separate day',
    'Транспорт:':'Travel:',
    'Покритие:':'Coverage:',
    'По часове':'Hourly',
    'За целия ден':'Full day',
    'Не':'No',
    'Да':'Yes',
    'Тип: Сватба':'Type: Wedding',
    'Тип:':'Type:',
    'Фотографи:':'Photographers:',
    'Оператори:':'Videographers:',
    'Транспорт (км):':'Travel (km):',
    'Дрон: По часове':'Drone: Hourly',
    'Дрон: За целия ден':'Drone: Full day',
    'Дрон: Не':'Drone: No',
    'Сурови файлове: Да':'Raw files: Yes',
    'Сурови файлове: Не':'Raw files: No',
    'Фотосесия в отделен ден: Да':'Photo session on a separate day: Yes',
    'Фотосесия в отделен ден: Не':'Photo session on a separate day: No',
    'Ориентировъчна сума:':'Estimated total:',
    'Пакетна оферта':'Package quote',
    'Персонална конфигурация':'Custom configuration',
    'Друго събитие':'Other event',
    'Персонална конфигурация за сватба':'Custom wedding configuration',
    'Персонална конфигурация за друго събитие':'Custom configuration for another event',
    'Избрана оферта:':'Selected offer:',
    'Цена:':'Price:',
    'Тип: Пакетна оферта':'Type: Package quote',
    'Моля, потвърдете съгласието за лични данни.':'Please confirm your consent for personal data.',

    /* Common fragments used by generated calculator output */
    ' фотограф':' photographer',
    ' фотографи':' photographers',
    ' оператор':' videographer',
    ' оператори':' videographers',
    ' (до 10ч)':' (up to 10h)',
    ' ч':' h',
    ' км':' km',
    'Публичният':'Public',
    'отзив':'review',
    'отзиви':'reviews',

    /* About / team */
    'Хората зад кадрите':'The people behind the frames',
    'Не сме просто зад камерата.':'We are more than people behind the camera.',
    'Нашата история':'Our story',
    'От 2017 г. създаваме СПОМЕНИ.':'Since 2017, we have been creating MEMORIES.',
    'Видеограф · Основател':'Videographer · Founder',
    'Фотограф и видеооператор · Съосновател':'Photographer & Videographer · Co-founder',
    'Асистент-оператор и монтажист':'Assistant Camera Operator & Editor',
    'Професионалният ми път започна още през 2010 г. с местния фотоклуб в Кърджали, а през 2012 г. направих първите си стъпки в събитийната фотография. По-късно работих по различни фото и видео проекти, включително проекти в НАТФИЗ и рекламни клипове.':'My professional journey began in 2010 with the local photography club in Kardzhali, and in 2012 I took my first steps into event photography. Later, I worked on various photo and video projects, including projects at NATFIZ and commercial productions.',
    'През последните години фокусът ми е основно видеографията — светлина, ритъм, емоция и детайл, които превръщат едно събитие в история.':'In recent years, my focus has been primarily on videography — light, rhythm, emotion and detail that turn an event into a story.',
    'Виктор навлиза във фотографията през 2015–2016 г. и бързо развива свой поглед към динамичните и емоционални моменти.':'Viktor entered photography in 2015–2016 and quickly developed his own eye for dynamic and emotional moments.',
    'Днес той е равностоен партньор и ключова част от екипа — от фотозаснемането до режисурата и монтажа.':'Today he is an equal partner and a key part of the team — from photography to directing and editing.',
    'Светлан снима от 2020 г. и се присъедини към екипа с нов поглед и сериозни технически умения.':'Svetlan has been shooting since 2020 and joined the team with a fresh perspective and strong technical skills.',
    'Със собствен опит в дигиталната среда и силен усет към монтажа допринася за завършения вид на всяко видео.':'With experience in the digital space and a strong sense for editing, he contributes to the finished look of every video.',
    'През 2017 г. обединихме уменията и страстта си и основахме':'In 2017, we brought our skills and passion together and founded',
    'Работим по сватби, кръщенета, годежи, рождени дни и фирмени събития. Целта ни е да бъдем спокойната част от деня ви, докато създаваме кадрите, които ще останат.':'We work on weddings, baptisms, engagements, birthdays and corporate events. Our goal is to be the calm part of your day while creating the frames that will last.',
    'Нашата цел е проста: когато гледате снимките и филма след години, да не виждате просто красиво съдържание. Да видите себе си.':'Our goal is simple: when you look at your photos and film years later, we do not want you to see simply beautiful content. We want you to see yourselves.',

    /* Navigation / accessibility */
    'Начало':'Home','Портфолио':'Portfolio','Видео':'Videos','Цени':'Pricing','Свободни дати':'Availability','За нас':'About','Меню':'Menu','Отвори менюто':'Open menu','Към съдържанието':'Skip to content','Проверете свободна дата':'Check availability','Проверете свободната дата':'Check availability','Вижте снимките':'View photos','Вижте цените':'View pricing','Вижте работата ни':'View our work','Изпрати запитване':'Send inquiry','Запитване за пакета':'Ask about this package','Нулирай':'Reset','Изчисли':'Calculate'
  };

  const keys=Object.keys(M).sort((a,b)=>b.length-a.length);
  const tr=v=>keys.reduce((x,k)=>x.includes(k)?x.split(k).join(M[k]):x,v||'');

  function translateAll(){
    const root=document.body||document.documentElement;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while(n=walker.nextNode())nodes.push(n);
    nodes.forEach(node=>{
      if(!node.nodeValue||!/[А-Яа-яЁё]/.test(node.nodeValue))return;
      if(node.parentElement?.closest('script,style,noscript,template'))return;
      const next=tr(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    });

    document.querySelectorAll('title,meta[content],img[alt],iframe[title],[aria-label],[title],[placeholder],input[value],textarea[placeholder]').forEach(el=>{
      ['content','alt','title','aria-label','placeholder','value'].forEach(attr=>{
        if(!el.hasAttribute(attr))return;
        const old=el.getAttribute(attr)||'',next=tr(old);
        if(next!==old)el.setAttribute(attr,next);
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
      const value=(n.nodeValue||'').trim();
      if(value&&/[А-Яа-яЁё]/.test(value))remaining.push(value);
    }
    const unique=[...new Set(remaining)];
    if(unique.length){
      console.warn('[Memory EN audit] Remaining Bulgarian text:',unique);
    }else{
      console.info('[Memory EN audit] PASS — no Bulgarian text nodes remain.');
    }
  }

  const run=()=>{
    translateAll();
    setTimeout(translateAll,80);
    setTimeout(audit,500);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();

  let timer=0;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(translateAll,40);
  }).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content','alt','title','aria-label','placeholder','value']});
})();
