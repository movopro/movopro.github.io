(()=>{
  const init=()=>{
    if(!/\/uslugi-ceni(\.html)?$/.test(location.pathname)||window.__pricingFixLoaded)return;
    window.__pricingFixLoaded=true;

    const en=new URLSearchParams(location.search).get('lang')==='en'||location.pathname.startsWith('/en/');
    const q=id=>document.getElementById(id);
    const MAX_HOURS=24,TRANSPORT=.51;
    const mobile=()=>window.matchMedia('(max-width: 768px)').matches;

    const moneyEUR=n=>{const s=n.toLocaleString(en?'en-US':'bg-BG',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});if(en)return '€'+s;const [whole,cents]=s.replace(/[\s\u00a0]/g,'').split(',');return whole.replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+(cents?','+cents:'')+'\u00a0€';};
    const row=(label,value)=>`<div class="line"><div>${label}</div><div class="r">${moneyEUR(value)}</div></div>`;
    const clampHours=(input,min=0)=>{if(!input)return min;let n=Number(input.value);if(!Number.isFinite(n))n=min;n=Math.min(MAX_HOURS,Math.max(min,Math.ceil(n)));input.value=String(n);return n;};

    let allowResultScroll=false;
    const nativeScrollIntoView=Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView=function(options){
      if(mobile()&&!allowResultScroll&&this.closest?.('.result-card'))return;
      return nativeScrollIntoView.call(this,options);
    };
    const scrollToResult=target=>{
      if(!target||!mobile())return;
      allowResultScroll=true;
      try{nativeScrollIntoView.call(target,{behavior:'smooth',block:'center'});}finally{setTimeout(()=>{allowResultScroll=false;},250);}
    };

    [q('otHours'),q('droneHours'),q('eventHours')].filter(Boolean).forEach(input=>{
      input.max=String(MAX_HOURS);input.step='1';
      input.addEventListener('change',()=>clampHours(input,input.id==='droneHours'||input.id==='eventHours'?1:0));
    });

    const calcSection=q('panel-wedding')?.closest('.glass-card');
    if(calcSection&&!q('travelInfoCard')){
      const info=document.createElement('section');
      info.id='travelInfoCard';info.className='glass-card reveal';info.style.opacity='1';info.style.transform='none';
      info.innerHTML=en?`
        <div class="section-topline"><div><h2>Additional information</h2><p>Travel and accommodation conditions for events outside Kardzhali.</p></div><div class="pill">travel & accommodation</div></div>
        <div class="included-all" style="margin-bottom:0"><div class="inc-grid">
          <div class="inc-item">No travel fee for events within the city of Kardzhali.</div>
          <div class="inc-item">Outside Kardzhali: €0.51 per km, calculated one way.</div>
          <div class="inc-item">More than 100 km from Kardzhali: accommodation for the team is required after the wedding.</div>
          <div class="inc-item">More than 200 km from Kardzhali: accommodation must be arranged and paid for before and after the wedding.</div>
        </div></div>`:`
        <div class="section-topline"><div><h2>Допълнителна информация</h2><p>Условия за транспорт и нощувки при събития извън гр. Кърджали.</p></div><div class="pill">транспорт и нощувки</div></div>
        <div class="included-all" style="margin-bottom:0"><div class="inc-grid">
          <div class="inc-item">Транспорт не се заплаща за събития в рамките на гр. Кърджали.</div>
          <div class="inc-item">За събития извън Кърджали транспортът е 0,51 € / км в едната посока.</div>
          <div class="inc-item">При сватба на повече от 100 км от гр. Кърджали е необходимо да бъде осигурено място за спане за екипа след сватбата.</div>
          <div class="inc-item">При сватба на повече от 200 км е необходимо да бъде осигурено и заплатено място за спане за екипа преди и след сватбата.</div>
        </div></div>`;
      calcSection.parentNode.insertBefore(info,calcSection);
    }

    const setLabel=(id,bg,enText)=>{const label=document.querySelector(`label[for="${id}"]`);if(label)label.textContent=en?enText:bg;};
    setLabel('km','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventKm','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventHours','Започнати часове','Billable hours');
    setLabel('eventPeople','Фотографи / видеографи','Photographers / videographers');

    const PACKAGE_PRICES=[1450,1950,2700];
    [...document.querySelectorAll('.package-card')].slice(0,3).forEach((card,index)=>{
      const eur=PACKAGE_PRICES[index];
      if(!eur)return;
      const price=card.querySelector('.package-price');
      const btn=card.querySelector('.package-inquiry-btn');
      const display=moneyEUR(eur);
      if(price)price.textContent=display;
      if(btn)btn.dataset.packagePrice=display;
      const firstBullet=card.querySelector('.bullets li');
      if(index===0&&firstBullet)firstBullet.textContent=en?'Team of 2 — 1 photographer + 1 videographer.':'Екип от 2 души — 1 фотограф + 1 видеограф.';
      if(index===1&&firstBullet)firstBullet.textContent=en?'Team of 4 — choose between 2 photographers + 1 videographer + 1 assistant, or 1 photographer + 2 videographers + 1 assistant.':'Екип от 4 души — по избор: двама фотографи + видеограф + асистент или фотограф + двама видеографи + асистент.';
    });

    const other=[...document.querySelectorAll('.glass-card')].find(s=>['Други събития','Other events'].includes(s.querySelector('h2')?.textContent.trim()));
    if(other){
      const p=other.querySelector('.section-topline p');
      if(p)p.textContent=en?'For one photographer or one videographer: €130 for the first hour and €90 for each additional hour; part hours are billed in full.':'За 1 фотограф или 1 видеограф: 130 € за първия започнат час и 90 € за всеки следващ започнат час.';
      other.querySelectorAll('.event-rate').forEach(el=>el.textContent=en?'€130 first hour · €90 each next hour':'130 € първи час · 90 € всеки следващ');
    }

    const tabs=[...document.querySelectorAll('.mode-tab')],panels=[...document.querySelectorAll('.mode-panel')];
    const showTab=tab=>{tabs.forEach(t=>{t.classList.remove('active');t.setAttribute('aria-pressed','false');});panels.forEach(p=>p.classList.remove('visible'));tab.classList.add('active');tab.setAttribute('aria-pressed','true');q('panel-'+tab.dataset.mode)?.classList.add('visible');};
    tabs.forEach(t=>t.setAttribute('aria-pressed',String(t.classList.contains('active'))));
    tabs.forEach(tab=>{if(tab.dataset.pricingFixBound)return;tab.dataset.pricingFixBound='1';tab.addEventListener('click',()=>showTab(tab));});

    const photo=q('photoTeam'),video=q('videoTeam'),ot=q('otHours'),km=q('km'),droneMode=q('droneMode'),droneHours=q('droneHours'),raw=q('rawFiles'),after=q('afterSession');
    const totalEUR=q('totalEUR'),breakdown=q('breakdown');
    const P={photo:{1:720,2:1220},video:{1:790,2:1340},overtime:85,raw:185,after:160,transport:TRANSPORT,droneHour:65,droneDay:250};

    const calcWedding=()=>{
      if(!photo||!video||!totalEUR)return;
      const p=+photo.value||0,v=+video.value||0,h=clampHours(ot,0),kmv=Math.max(0,+km.value||0),people=p+v,dm=droneMode?.value||'none',dh=clampHours(droneHours,1);
      let total=0,lines=[];
      if(p){const x=P.photo[p]||0;total+=x;lines.push(row(en?`Wedding photography: ${p} photographer${p===1?'':'s'} (up to 10h)`:`Сватбена фотография: ${p===1?'1 фотограф':'двама фотографи'} (до 10 ч)`,x));}
      if(v){const x=P.video[v]||0;total+=x;lines.push(row(en?`Wedding videography: ${v} videographer${v===1?'':'s'} (up to 10h)`:`Сватбена видеография: ${v===1?'1 видеограф':'двама видеографи'} (до 10 ч)`,x));}
      if(h&&people){const x=h*people*P.overtime;total+=x;lines.push(row(en?`Extra hours: ${h}h × ${people} × €85`:`Допълнителни часове: ${h} ч × ${people} × 85 €`,x));}
      if(dm==='hour'){const x=dh*P.droneHour;total+=x;lines.push(row(en?`Drone: ${dh}h × €65`:`Дрон: ${dh} ч × 65 €`,x));}
      else if(dm==='day'){total+=P.droneDay;lines.push(row(en?'Full-day drone':'Дрон за целия ден',P.droneDay));}
      if(raw?.checked){total+=P.raw;lines.push(row(en?'Raw files':'Сурови файлове',P.raw));}
      if(after?.checked){total+=P.after;lines.push(row(en?'Photo session on a separate day':'Фотосесия в отделен ден',P.after));}
      if(kmv){const x=kmv*P.transport;total+=x;lines.push(row(en?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));}
      totalEUR.textContent=moneyEUR(total);if(breakdown)breakdown.innerHTML=lines.join('')||`<div class="line"><div>${en?'No services selected.':'Няма избрани услуги.'}</div><div class="r">${moneyEUR(0)}</div></div>`;
    };

    const updateDrone=()=>{if(!droneMode||!droneHours)return;const hourly=droneMode.value==='hour';droneHours.disabled=!hourly;droneHours.style.opacity=hourly?'1':'.45';};
    [photo,video,ot,km,droneMode,droneHours,raw,after].filter(Boolean).forEach(el=>{el.addEventListener('input',calcWedding);el.addEventListener('change',calcWedding);});
    droneMode?.addEventListener('change',updateDrone);
    q('recalcWedding')?.addEventListener('click',()=>{calcWedding();scrollToResult(breakdown||totalEUR);});
    q('resetCalc')?.addEventListener('click',()=>{photo.value='0';video.value='0';ot.value='0';km.value='0';droneMode.value='none';droneHours.value='1';raw.checked=false;after.checked=false;updateDrone();calcWedding();});

    const eventType=q('eventType'),eventHours=q('eventHours'),eventPeople=q('eventPeople'),eventKm=q('eventKm'),eventRaw=q('eventRawFiles'),eventTotalEUR=q('eventTotalEUR'),eventBreakdown=q('eventBreakdown');
    const E={first:130,next:90,raw:185,transport:TRANSPORT};
    const calcEvent=()=>{
      if(!eventTotalEUR)return;
      const h=clampHours(eventHours,1),team=Math.min(4,Math.max(1,Math.ceil(+eventPeople.value||1))),kmv=Math.max(0,+eventKm.value||0);eventPeople.value=String(team);
      const first=team*E.first,extraHours=Math.max(0,h-1),extra=extraHours*team*E.next;let total=first+extra;
      const lines=[row(en?`First started hour: ${team} × €130`:`Първи започнат час: ${team} × 130 €`,first)];
      if(extraHours)lines.push(row(en?`Next hours: ${extraHours}h × ${team} × €90`:`Следващи часове: ${extraHours} ч × ${team} × 90 €`,extra));
      if(kmv){const x=kmv*E.transport;total+=x;lines.push(row(en?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));}
      if(eventRaw?.checked){total+=E.raw;lines.push(row(en?'Raw files':'Сурови файлове',E.raw));}
      eventTotalEUR.textContent=moneyEUR(total);if(eventBreakdown)eventBreakdown.innerHTML=lines.join('');
    };
    [eventType,eventHours,eventPeople,eventKm,eventRaw].filter(Boolean).forEach(el=>{el.addEventListener('input',calcEvent);el.addEventListener('change',calcEvent);});
    q('recalcEvent')?.addEventListener('click',()=>{calcEvent();scrollToResult(eventBreakdown||eventTotalEUR);});
    q('resetEventCalc')?.addEventListener('click',()=>{if(eventType)eventType.value='birthday';eventHours.value='2';eventPeople.value='1';eventKm.value='0';eventRaw.checked=false;calcEvent();});

    const inquiry=q('inquirySection'),inquiryType=q('inquiryType'),selected=q('selectedOffer'),summary=q('inquirySummary'),name=q('clientName'),phone=q('clientPhone'),email=q('clientEmail'),date=q('eventDate'),locationField=q('eventLocation'),note=q('clientNote'),privacy=q('privacyConsent'),send=q('sendInquiry'),status=q('sendStatus');
    const openInquiry=()=>{inquiry?.scrollIntoView({behavior:'smooth',block:'start'});inquiry?.focus({preventScroll:true});};
    // Errors are announced through the status line, marked on the field and the field gets the focus.
    const invalid=(field,message)=>{status.dataset.state='error';status.textContent=message;field?.setAttribute('aria-invalid','true');field?.focus();};
    [name,phone,email,date].forEach(field=>field?.addEventListener('input',()=>field.removeAttribute('aria-invalid')));
    privacy?.addEventListener('change',()=>privacy.removeAttribute('aria-invalid'));
    const weddingSummary=()=>en?`Type: Wedding\nPhotographers: ${+photo.value||0}\nVideographers: ${+video.value||0}\nExtra hours: ${clampHours(ot,0)}\nOne-way distance from Kardzhali (km): ${+km.value||0}\nDrone: ${droneMode.value==='hour'?'Hourly ('+clampHours(droneHours,1)+' h)':droneMode.value==='day'?'Full day':'No'}\nRaw files: ${raw.checked?'Yes':'No'}\nSeparate-day photo session: ${after.checked?'Yes':'No'}\nEstimated total: ${totalEUR.textContent}`:`Тип: Сватба\nФотографи: ${+photo.value||0}\nВидеографи: ${+video.value||0}\nДопълнителни часове: ${clampHours(ot,0)}\nРазстояние от Кърджали, еднопосочно (км): ${+km.value||0}\nДрон: ${droneMode.value==='hour'?'По часове ('+clampHours(droneHours,1)+' ч)':droneMode.value==='day'?'За целия ден':'Не'}\nСурови файлове: ${raw.checked?'Да':'Не'}\nФотосесия в отделен ден: ${after.checked?'Да':'Не'}\nОриентировъчна сума: ${totalEUR.textContent}`;
    const eventSummary=()=>{const m=en?{birthday:'Birthday',baptism:'Baptism',corporate:'Corporate event',other:'Other'}:{birthday:'Рожден ден',baptism:'Кръщене',corporate:'Фирмено събитие',other:'Друго'};return en?`Type: ${m[eventType.value]||'Other'}\nBillable hours: ${clampHours(eventHours,1)}\nPhotographers / videographers: ${+eventPeople.value||1}\nRate: €130 first hour + €90 each additional hour (part hours billed in full)\nOne-way distance from Kardzhali (km): ${+eventKm.value||0}\nRaw files: ${eventRaw.checked?'Yes':'No'}\nEstimated total: ${eventTotalEUR.textContent}`:`Тип: ${m[eventType.value]||'Друго'}\nЗапочнати часове: ${clampHours(eventHours,1)}\nФотографи / видеографи: ${+eventPeople.value||1}\nТарифа: 130 € първи започнат час + 90 € всеки следващ започнат час\nРазстояние от Кърджали, еднопосочно (км): ${+eventKm.value||0}\nСурови файлове: ${eventRaw.checked?'Да':'Не'}\nОриентировъчна сума: ${eventTotalEUR.textContent}`;};

    document.querySelectorAll('.package-inquiry-btn').forEach(btn=>{if(btn.dataset.pricingFixBound)return;btn.dataset.pricingFixBound='1';btn.addEventListener('click',()=>{const pkg=en?({'Стандартен':'Standard','Премиум':'Premium','Ултра':'Ultra'}[btn.dataset.package]||btn.dataset.package):btn.dataset.package;inquiryType.value='Пакетна оферта';selected.value=pkg+' — '+btn.dataset.packagePrice;summary.value=en?'Selected offer: '+pkg+'\nPrice: '+btn.dataset.packagePrice+'\nType: Package quote':'Избрана оферта: '+btn.dataset.package+'\nЦена: '+btn.dataset.packagePrice+'\nТип: Пакетна оферта';openInquiry();});});
    q('openWeddingInquiry')?.addEventListener('click',()=>{calcWedding();inquiryType.value='Индивидуална конфигурация';selected.value=en?'Custom wedding configuration':'Индивидуална конфигурация за сватба';summary.value=weddingSummary();openInquiry();});
    q('openEventInquiry')?.addEventListener('click',()=>{calcEvent();inquiryType.value='Друго събитие';selected.value=en?'Custom configuration for another event':'Индивидуална конфигурация за друго събитие';summary.value=eventSummary();openInquiry();});

    if(send)send.addEventListener('click',async()=>{
      const n=name.value.trim(),p=phone.value.trim(),e=email.value.trim(),d=date.value.trim(),loc=locationField.value.trim(),nt=note.value.trim(),offer=selected.value.trim(),sum=summary.value.trim();
      if(!n)return invalid(name,en?'Please enter your name.':'Моля, попълнете име.');
      if(!p)return invalid(phone,en?'Please enter your phone number.':'Моля, попълнете телефон.');
      if(!e)return invalid(email,en?'Please enter your email.':'Моля, попълнете имейл.');
      if(!d)return invalid(date,en?'Please select the event date.':'Моля, изберете дата на събитието.');
      if(!sum)return invalid(selected,en?'Please select an offer or configuration first.':'Моля, първо изберете оферта или конфигурация.');
      if(!privacy.checked)return invalid(privacy,en?'Please confirm your consent to the processing of your personal data.':'Моля, потвърдете съгласието за обработка на лични данни.');
      send.disabled=true;status.dataset.state='sending';status.textContent=en?'Sending…':'Изпращане…';
      try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:'33fb475c-9d44-449b-9fd0-1fc667dd170e',subject:'Ново запитване от сайта - Memory Photo & Video',from_name:'Memory Photo & Video',name:n,email:e,phone:p,event_date:d,event_location:loc,inquiry_type:inquiryType.value,selected_offer:offer,calculator_summary:sum,note:nt})});const result=await r.json();if(result.success){status.dataset.state='ok';status.textContent=en?'Your inquiry was sent successfully.':'Запитването беше изпратено успешно.';[name,phone,email,date,locationField,note].forEach(el=>el.value='');privacy.checked=false;}else{status.dataset.state='error';status.textContent=en?'There was a problem sending the inquiry.':'Възникна проблем при изпращането.';}}catch(err){status.dataset.state='error';status.textContent=en?'Connection error. Please try again.':'Грешка при връзката. Опитайте отново.';}finally{send.disabled=false;send.focus();}
    });

    updateDrone();calcWedding();calcEvent();
    // Announce the recalculated totals to screen readers (switched on after the first calculation, so nothing is read on load).
    [totalEUR,eventTotalEUR].forEach(el=>{if(el){el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();