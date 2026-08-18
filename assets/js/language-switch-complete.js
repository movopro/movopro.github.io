(()=>{
  const p=new URLSearchParams(location.search);
  const en=p.get('lang')==='en'||location.pathname.startsWith('/en/');
  if(!en)return;

  // Final pass for copy generated after the initial runtime translation.
  // Keep this dictionary focused on phrases/fragments that are actually
  // created by main.js, pricing-fix.js, or pages added later.
  const M={
    'Вашият ден. Вашата история.':'Your day. Your story.',
    'Снимаме истинските моменти — тихите, шумните, красивите и неподправените. Фото и видео, които не просто показват как е изглеждал денят, а ви връщат в него.':'We capture the real moments — the quiet, the loud, the beautiful and the unfiltered. Photo and video that do not simply show what the day looked like, but take you back to it.',
    'Разгледай портфолиото':'Browse the portfolio',
    'Няколко мига, които си струва да останат.':'Some moments are worth keeping.',
    'Новата серия вече е подредена в отделна история — емоция, детайли, светлина и истински моменти.':'The new series is now arranged as a separate story — emotion, details, light and real moments.',
    'Виж всички избрани кадри':'View all selected frames',
    'Колаж от избрани сватбени кадри на Memory Photo & Video':'Collage of selected wedding photos by Memory Photo & Video',
    'Публичният Google рейтинг в момента е 5.0/5 от 21 отзива.':'Our public Google rating is currently 5.0/5 from 21 reviews.',
    'Доверието е едно от най-важните неща, когато някой поверява спомените си на нас.':'Trust is one of the most important things when someone entrusts us with their memories.',
    'Избрана серия':'Selected series',
    'Избрани сватбени кадри':'Selected wedding photos',
    'Избрани сватбени фотографии от Memory Photo & Video.':'Selected wedding photographs by Memory Photo & Video.',
    'Подбрани кадри от реални сватбени моменти — емоция, детайли, портрети и атмосфера.':'Selected frames from real wedding moments — emotion, details, portraits and atmosphere.',
    'Избран сватбен кадър':'Selected wedding photo',
    'Цялото портфолио':'Full portfolio',

    // Dynamic wedding calculator output
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

    // Small dynamic fragments used by the calculator
    ' фотографи':' photographers',
    ' фотограф':' photographer',
    ' оператори':' videographers',
    ' оператор':' videographer',
    ' (до 10ч)':' (up to 10h)',
    ' ч':' h',
    ' км':' km',

    // Home / common content that can be inserted dynamically
    'Google отзиви':'Google reviews',
    'Следвайте ни':'Follow us',
    'Бързи връзки':'Quick links',
    'Контакти':'Contact',
    'Всички права запазени.':'All rights reserved.',
    'Музиката е част от атмосферата.':'Music is part of the atmosphere.',
    'Вашият ден е на първо място.':'Your day comes first.',
    'DJ партньор':'DJ partner',
    'Кърджали и цяла България':'Kardzhali and all of Bulgaria',

    // Accessibility / navigation fallbacks
    'Начало':'Home','Портфолио':'Portfolio','Видео':'Videos','Цени':'Pricing','Свободни дати':'Availability','За нас':'About','Меню':'Menu','Отвори менюто':'Open menu','Към съдържанието':'Skip to content','Проверете свободна дата':'Check availability','Проверете свободната дата':'Check availability','Вижте снимките':'View photos','Вижте цените':'View pricing','Вижте работата ни':'View our work','Изпрати запитване':'Send inquiry','Запитване за пакета':'Ask about this package','Нулирай':'Reset','Изчисли':'Calculate','Изпращане...':'Sending...','Резултат':'Result','Обща ориентировъчна сума':'Estimated total','Няма избрани услуги.':'No services selected.'
  };

  const keys=Object.keys(M).sort((a,b)=>b.length-a.length);
  const tr=value=>keys.reduce((text,key)=>text.includes(key)?text.split(key).join(M[key]):text,value||'');

  function translateAll(){
    const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while(node=walker.nextNode())nodes.push(node);
    nodes.forEach(n=>{
      if(!n.nodeValue||!/[А-Яа-яЁё]/.test(n.nodeValue))return;
      if(n.parentElement?.closest('script,style,noscript,template'))return;
      const next=tr(n.nodeValue);
      if(next!==n.nodeValue)n.nodeValue=next;
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
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const remaining=[];let node;
    while(node=walker.nextNode()){
      if(node.parentElement?.closest('script,style,noscript,template'))continue;
      const value=(node.nodeValue||'').trim();
      if(value&&/[А-Яа-яЁё]/.test(value))remaining.push(value);
    }
    const unique=[...new Set(remaining)];
    if(unique.length)console.warn('[Memory EN audit] Remaining Bulgarian text:',unique);
    else console.info('[Memory EN audit] PASS — no Bulgarian text nodes remain.');
  }

  const run=()=>{
    translateAll();
    setTimeout(translateAll,100);
    setTimeout(translateAll,400);
    setTimeout(audit,800);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();

  let timer=0;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(translateAll,40);
  }).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content','alt','title','aria-label','placeholder','value']});
})();
