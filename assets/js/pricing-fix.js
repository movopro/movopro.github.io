(()=>{
  const init=()=>{
    if(!location.pathname.endsWith('/uslugi-ceni.html')||window.__pricingFixLoaded)return;
    window.__pricingFixLoaded=true;

    const en=new URLSearchParams(location.search).get('lang')==='en'||location.pathname.startsWith('/en/');
    const q=id=>document.getElementById(id);
    const EUR_TO_BGN=1.95583,MAX_HOURS=24,TRANSPORT=.51;
    const mobile=()=>window.matchMedia('(max-width: 768px)').matches;

    document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale').forEach(el=>{el.style.opacity='1';el.style.transform='none';});

    const moneyEUR=n=>n.toLocaleString(en?'en-US':'bg-BG',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2})+' €';
    const moneyBGN=n=>Math.round(n*EUR_TO_BGN)+(en?' BGN':' лв.');
    const row=(label,value)=>`<div class="line"><div>${label}</div><div class="r">${moneyEUR(value)}</div></div>`;
    const clampHours=(input,min=0)=>{if(!input)return min;let n=Number(input.value);if(!Number.isFinite(n))n=min;n=Math.min(MAX_HOURS,Math.max(min,Math.ceil(n)));input.value=String(n);return n;};

    // Mobile safeguard: calculator result areas are never allowed to pull the page down
    // unless the user explicitly taps a Calculate button.
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
          <div class="inc-item">Outside Kardzhali: €0.51 per km, calculated one way (about BGN 1.00/km).</div>
          <div class="inc-item">More than 100 km from Kardzhali: accommodation for the team is required after the wedding.</div>
          <div class="inc-item">More than 200 km from Kardzhali: accommodation must be arranged and paid for before and after the wedding.</div>
        </div></div>`:`
        <div class="section-topline"><div><h2>Допълнителна информация</h2><p>Условия за транспорт и нощувки при събития извън гр. Кърджали.</p></div><div class="pill">транспорт и нощувки</div></div>
        <div class="included-all" style="margin-bottom:0"><div class="inc-grid">
          <div class="inc-item">Транспорт не се заплаща за събития в рамките на гр. Кърджали.</div>
          <div class="inc-item">За събития извън Кърджали транспортът е 0,51 € / км в едната посока (≈ 1,00 лв./км).</div>
          <div class="inc-item">При сватба на повече от 100 км от гр. Кърджали е необходимо да бъде осигурено място за спане за екипа след сватбата.</div>
          <div class="inc-item">При сватба на повече от 200 км е необходимо да бъде осигурено и заплатено място за спане за екипа преди и след сватбата.</div>
        </div></div>`;
      calcSection.parentNode.insertBefore(info,calcSection);
    }

    const setLabel=(id,bg,enText)=>{const label=document.querySelector(`label[for="${id}"]`);if(label)label.textContent=en?enText:bg;};
    setLabel('km','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventKm','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventHours','Започнати часове','Started hours');
    setLabel('eventPeople','Фотографи / оператори','Photographers / videographers');

    const other=[...document.querySelectorAll('.glass-card')].find(s=>['Други събития','Other events'].includes(s.querySelector('h2')?.textContent.trim()));
    if(other){
      const p=other.querySelector('.section-topline p');
      if(p)p.textContent=en?'For one photographer or one videographer: €120 for the first started hour and €80 for each subsequent started hour.':'За 1 фотограф или 1 оператор: 120 € за първия започнат час и 80 € за всеки следващ започнат час.';
      other.querySelectorAll('.event-rate').forEach(el=>el.textContent=en?'€120 first hour · €80 each next hour':'120 € първи час · 80 € всеки следващ');
    }

    const tabs=[...document.querySelectorAll('.mode-tab')],panels=[...document.querySelectorAll('.mode-panel')];
    tabs.forEach(tab=>{if(tab.dataset.pricingFixBound)return;tab.dataset.pricingFixBound='1';tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active'));panels.forEach(p=>p.classList.remove('visible'));tab.classList.add('active');q('panel-'+tab.dataset.mode)?.classList.add('visible');});});

    const photo=q('photoTeam'),video=q('videoTeam'),ot=q('otHours'),km=q('km'),droneMode=q('droneMode'),droneHours=q('droneHours'),raw=q('rawFiles'),after=q('afterSession');
    const totalEUR=q('totalEUR'),totalBGN=q('totalBGN'),breakdown=q('breakdown');
    const P={photo:{1:656,2:1106},video:{1:719,2:1214},overtime:78,raw:168,after:143,transport:TRANSPORT,droneHour:58,droneDay:224};

    const calcWedding=()=>{
      if(!photo||!video||!totalEUR)return;
      const p=+photo.value||0,v=+video.value||0,h=clampHours(ot,0),kmv=Math.max(0,+km.value||0),people=p+v,dm=droneMode?.value||'none',dh=clampHours(droneHours,1);
      let total=0,lines=[];
      if(p){const x=P.photo[p]||0;total+=x;lines.push(row(en?`Wedding photography: ${p} photographer${p===1?'':'s'} (up to 10h)`:`Сватбена фотография: ${p} фотограф${p===1?'':'и'} (до 10ч)`,x));}
      if(v){const x=P.video[v]||0;total+=x;lines.push(row(en?`Wedding videography: ${v} videographer${v===1?'':'s'} (up to 10h)`:`Сватбена видеография: ${v} оператор${v===1?'':'и'} (до 10ч)`,x));}
      if(h&&people){const x=h*people*P.overtime;total+=x;lines.push(row(en?`Extra hours: ${h}h × ${people} × 78€`:`Доп. часове: ${h}ч × ${people} × 78€`,x));}
      if(dm==='hour'){const x=dh*P.droneHour;total+=x;lines.push(row(en?`Drone: ${dh}h × 58€`:`Дрон: ${dh}ч × 58€`,x));}
      else if(dm==='day'){total+=P.droneDay;lines.push(row(en?'Full-day drone':'Дрон за целия ден',P.droneDay));}
      if(raw?.checked){total+=P.raw;lines.push(row(en?'Raw files':'Сурови файлове',P.raw));}
      if(after?.checked){total+=P.after;lines.push(row(en?'Photo session on a separate day':'Фотосесия в отделен ден',P.after));}
      if(kmv){const x=kmv*P.transport;total+=x;lines.push(row(en?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));}
      totalEUR.textContent=moneyEUR(total);if(totalBGN)totalBGN.textContent=moneyBGN(total);if(breakdown)breakdown.innerHTML=lines.join('')||`<div class="line"><div>${en?'No services selected.':'Няма избрани услуги.'}</div><div class="r">0 €</div></div>`;
    };

    const updateDrone=()=>{if(!droneMode||!droneHours)return;const hourly=droneMode.value==='hour';droneHours.disabled=!hourly;droneHours.style.opacity=hourly?'1':'.45';};
    [photo,video,ot,km,droneMode,droneHours,raw,after].filter(Boolean).forEach(el=>{el.addEventListener('input',calcWedding);el.addEventListener('change',calcWedding);});
    droneMode?.addEventListener('change',updateDrone);
    q('recalcWedding')?.addEventListener('click',()=>{calcWedding();scrollToResult(breakdown||totalEUR);});
    q('resetCalc')?.addEventListener('click',()=>{photo.value='0';video.value='0';ot.value='0';km.value='0';droneMode.value='none';droneHours.value='1';raw.checked=false;after.checked=false;updateDrone();calcWedding();});

    const eventType=q('eventType'),eventHours=q('eventHours'),eventPeople=q('eventPeople'),eventKm=q('eventKm'),eventRaw=q('eventRawFiles'),eventTotalEUR=q('eventTotalEUR'),eventTotalBGN=q('eventTotalBGN'),eventBreakdown=q('eventBreakdown');
    const E={first:120,next:80,raw:168,transport:TRANSPORT};
    const calcEvent=()=>{
      if(!eventTotalEUR)return;
      const h=clampHours(eventHours,1),team=Math.min(4,Math.max(1,Math.ceil(+eventPeople.value||1))),kmv=Math.max(0,+eventKm.value||0);eventPeople.value=String(team);
      const first=team*E.first,extraHours=Math.max(0,h-1),extra=extraHours*team*E.next;let total=first+extra;
      const lines=[row(en?`First started hour: ${team} × €120`:`Първи започнат час: ${team} × 120 €`,first)];
      if(extraHours)lines.push(row(en?`Next hours: ${extraHours}h × ${team} × €80`:`Следващи часове: ${extraHours}ч × ${team} × 80 €`,extra));
      if(kmv){const x=kmv*E.transport;total+=x;lines.push(row(en?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));}
      if(eventRaw?.checked){total+=E.raw;lines.push(row(en?'Raw files':'Сурови файлове',E.raw));}
      eventTotalEUR.textContent=moneyEUR(total);if(eventTotalBGN)eventTotalBGN.textContent=moneyBGN(total);if(eventBreakdown)eventBreakdown.innerHTML=lines.join('');
    };
    [eventType,eventHours,eventPeople,eventKm,eventRaw].filter(Boolean).forEach(el=>{el.addEventListener('input',calcEvent);el.addEventListener('change',calcEvent);});
    q('recalcEvent')?.addEventListener('click',()=>{calcEvent();scrollToResult(eventBreakdown||eventTotalEUR);});
    q('resetEventCalc')?.addEventListener('click',()=>{if(eventType)eventType.value='birthday';eventHours.value='2';eventPeople.value='1';eventKm.value='0';eventRaw.checked=false;calcEvent();});

    const inquiry=q('inquirySection'),inquiryType=q('inquiryType'),selected=q('selectedOffer'),summary=q('inquirySummary'),name=q('clientName'),phone=q('clientPhone'),email=q('clientEmail'),date=q('eventDate'),locationField=q('eventLocation'),note=q('clientNote'),privacy=q('privacyConsent'),send=q('sendInquiry'),status=q('sendStatus');
    const openInquiry=()=>inquiry?.scrollIntoView({behavior:'smooth',block:'start'});
    const weddingSummary=()=>en?`Type: Wedding\nPhotographers: ${+photo.value||0}\nVideographers: ${+video.value||0}\nExtra hours: ${clampHours(ot,0)}\nOne-way distance from Kardzhali (km): ${+km.value||0}\nDrone: ${droneMode.value==='hour'?'Hourly ('+clampHours(droneHours,1)+' h)':droneMode.value==='day'?'Full day':'No'}\nRaw files: ${raw.checked?'Yes':'No'}\nSeparate-day photo session: ${after.checked?'Yes':'No'}\nEstimated total: ${totalEUR.textContent} / ${totalBGN.textContent}`:`Тип: Сватба\nФотографи: ${+photo.value||0}\nОператори: ${+video.value||0}\nДопълнителни часове: ${clampHours(ot,0)}\nРазстояние от Кърджали, еднопосочно (км): ${+km.value||0}\nДрон: ${droneMode.value==='hour'?'По часове ('+clampHours(droneHours,1)+' ч)':droneMode.value==='day'?'За целия ден':'Не'}\nСурови файлове: ${raw.checked?'Да':'Не'}\nФотосесия в отделен ден: ${after.checked?'Да':'Не'}\nОриентировъчна сума: ${totalEUR.textContent} / ${totalBGN.textContent}`;
    const eventSummary=()=>{const m=en?{birthday:'Birthday',baptism:'Baptism',corporate:'Corporate event',other:'Other'}:{birthday:'Рожден ден',baptism:'Кръщене',corporate:'Фирмено събитие',other:'Друго'};return en?`Type: ${m[eventType.value]||'Other'}\nStarted hours: ${clampHours(eventHours,1)}\nPhotographers / videographers: ${+eventPeople.value||1}\nRate: €120 first started hour + €80 each next started hour\nOne-way distance from Kardzhali (km): ${+eventKm.value||0}\nRaw files: ${eventRaw.checked?'Yes':'No'}\nEstimated total: ${eventTotalEUR.textContent} / ${eventTotalBGN.textContent}`:`Тип: ${m[eventType.value]||'Друго'}\nЗапочнати часове: ${clampHours(eventHours,1)}\nФотографи / оператори: ${+eventPeople.value||1}\nТарифа: 120 € първи започнат час + 80 € всеки следващ започнат час\nРазстояние от Кърджали, еднопосочно (км): ${+eventKm.value||0}\nСурови файлове: ${eventRaw.checked?'Да':'Не'}\nОриентировъчна сума: ${eventTotalEUR.textContent} / ${eventTotalBGN.textContent}`;};

    document.querySelectorAll('.package-inquiry-btn').forEach(btn=>{if(btn.dataset.pricingFixBound)return;btn.dataset.pricingFixBound='1';btn.addEventListener('click',()=>{inquiryType.value='Пакетна оферта';selected.value=btn.dataset.package+' — '+btn.dataset.packagePrice;summary.value=en?'Selected offer: '+btn.dataset.package+'\nPrice: '+btn.dataset.packagePrice+'\nType: Package offer':'Избрана оферта: '+btn.dataset.package+'\nЦена: '+btn.dataset.packagePrice+'\nТип: Пакетна оферта';openInquiry();});});
    q('openWeddingInquiry')?.addEventListener('click',()=>{calcWedding();inquiryType.value='Персонална конфигурация';selected.value=en?'Custom wedding configuration':'Персонална конфигурация за сватба';summary.value=weddingSummary();openInquiry();});
    q('openEventInquiry')?.addEventListener('click',()=>{calcEvent();inquiryType.value='Друго събитие';selected.value=en?'Custom configuration for another event':'Персонална конфигурация за друго събитие';summary.value=eventSummary();openInquiry();});

    if(send)send.addEventListener('click',async()=>{
      const n=name.value.trim(),p=phone.value.trim(),e=email.value.trim(),d=date.value.trim(),loc=locationField.value.trim(),nt=note.value.trim(),offer=selected.value.trim(),sum=summary.value.trim();
      if(!n)return status.textContent=en?'Please enter your name.':'Моля, попълнете име.';
      if(!p)return status.textContent=en?'Please enter your phone number.':'Моля, попълнете телефон.';
      if(!e)return status.textContent=en?'Please enter your email.':'Моля, попълнете имейл.';
      if(!d)return status.textContent=en?'Please select the event date.':'Моля, изберете дата на събитието.';
      if(!sum)return status.textContent=en?'Please select an offer or configuration first.':'Моля, първо изберете оферта или конфигурация.';
      if(!privacy.checked)return status.textContent=en?'Please confirm the privacy consent.':'Моля, потвърдете съгласието за лични данни.';
      send.disabled=true;status.textContent=en?'Sending...':'Изпращане...';
      try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:'33fb475c-9d44-449b-9fd0-1fc667dd170e',subject:'Ново запитване от сайта - Memory Photo & Video',from_name:'Memory Photo & Video',name:n,email:e,phone:p,event_date:d,event_location:loc,inquiry_type:inquiryType.value,selected_offer:offer,calculator_summary:sum,note:nt})});const result=await r.json();if(result.success){status.textContent=en?'Your inquiry was sent successfully.':'Запитването беше изпратено успешно.';[name,phone,email,date,locationField,note].forEach(el=>el.value='');privacy.checked=false;}else status.textContent=en?'There was a problem sending the inquiry.':'Възникна проблем при изпращането.';}catch(err){status.textContent=en?'Connection error. Please try again.':'Грешка при връзката. Опитайте отново.';}finally{send.disabled=false;}
    });

    updateDrone();calcWedding();calcEvent();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();