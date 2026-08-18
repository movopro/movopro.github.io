(()=>{
  const init=()=>{
    if(!location.pathname.endsWith('/uslugi-ceni.html')) return;
    if(window.__pricingFixLoaded) return;
    window.__pricingFixLoaded=true;

    // Never let the reveal animation make the pricing page unusable.
    document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale')
      .forEach(el=>{el.style.opacity='1';el.style.transform='none';});

    const q=id=>document.getElementById(id);
    const EUR_TO_BGN=1.95583;
    const MAX_HOURS=24;
    const moneyEUR=n=>Math.round(n)+'€';
    const moneyBGN=n=>Math.round(n*EUR_TO_BGN)+' лв.';
    const line=(label,value)=>`<div class="line"><div>${label}</div><div class="r">${moneyEUR(value)}</div></div>`;

    // Keep every hour-based input within a sensible 24-hour maximum.
    const hourInputs=[q('otHours'),q('droneHours'),q('eventHours')].filter(Boolean);
    hourInputs.forEach(input=>{
      input.max=String(MAX_HOURS);
      input.step=input.step || '1';
      input.addEventListener('input',()=>{
        const n=Number(input.value);
        if(Number.isFinite(n) && n>MAX_HOURS) input.value=String(MAX_HOURS);
      });
      input.addEventListener('change',()=>{
        let n=Number(input.value);
        if(!Number.isFinite(n)) n=0;
        n=Math.min(MAX_HOURS,Math.max(0,n));
        input.value=String(n);
      });
    });

    // On phones, after calculating, take the user directly to the result.
    const scrollToResult=(target)=>{
      if(!target) return;
      if(window.matchMedia('(max-width: 768px)').matches){
        window.setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'center'}),80);
      }
    };

    // Tabs
    const tabs=[...document.querySelectorAll('.mode-tab')];
    const panels=[...document.querySelectorAll('.mode-panel')];
    tabs.forEach(tab=>{
      if(tab.dataset.pricingFixBound) return;
      tab.dataset.pricingFixBound='1';
      tab.addEventListener('click',()=>{
        tabs.forEach(t=>t.classList.remove('active'));
        panels.forEach(p=>p.classList.remove('visible'));
        tab.classList.add('active');
        const panel=q('panel-'+tab.dataset.mode);
        if(panel) panel.classList.add('visible');
      });
    });

    // Wedding calculator
    const photoTeam=q('photoTeam'), videoTeam=q('videoTeam'), otHours=q('otHours'), km=q('km');
    const droneMode=q('droneMode'), droneHours=q('droneHours'), rawFiles=q('rawFiles'), afterSession=q('afterSession');
    const totalEUR=q('totalEUR'), totalBGN=q('totalBGN'), breakdown=q('breakdown');
    const PRICES={photo:{1:656,2:1106},video:{1:719,2:1214},overtime:78,raw:168,after:143,transport:.58,droneHour:58,droneDay:224};

    const calcWedding=()=>{
      if(!photoTeam||!videoTeam||!totalEUR) return;
      const p=+photoTeam.value||0,v=+videoTeam.value||0,ot=Math.min(MAX_HOURS,Math.max(0,+otHours.value||0)),kmv=Math.max(0,+km.value||0);
      const people=p+v,dm=droneMode.value,dh=Math.min(MAX_HOURS,Math.max(1,+droneHours.value||1));
      if(otHours) otHours.value=String(ot);
      if(droneHours) droneHours.value=String(dh);
      const droneResult=q('droneHours');
      let total=0,lines=[];
      if(p){const x=PRICES.photo[p]||0;total+=x;lines.push(line(`Сватбена фотография: ${p} фотограф${p===1?'':'и'} (до 10ч)`,x));}
      if(v){const x=PRICES.video[v]||0;total+=x;lines.push(line(`Сватбена видеография: ${v} оператор${v===1?'':'и'} (до 10ч)`,x));}
      if(ot&&people){const x=ot*people*PRICES.overtime;total+=x;lines.push(line(`Доп. часове: ${ot}ч × ${people} × 78€`,x));}
      if(dm==='hour'){const x=dh*PRICES.droneHour;total+=x;lines.push(line(`Дрон: ${dh}ч × 58€`,x));}
      else if(dm==='day'){total+=PRICES.droneDay;lines.push(line('Дрон за целия ден',PRICES.droneDay));}
      if(rawFiles.checked){total+=PRICES.raw;lines.push(line('Сурови файлове',PRICES.raw));}
      if(afterSession.checked){total+=PRICES.after;lines.push(line('Фотосесия в отделен ден',PRICES.after));}
      if(kmv){const x=kmv*PRICES.transport;total+=x;lines.push(line(`Транспорт: ${kmv} км × 0.58€`,x));}
      totalEUR.textContent=moneyEUR(total); if(totalBGN) totalBGN.textContent=moneyBGN(total);
      if(breakdown) breakdown.innerHTML=lines.join('')||'<div class="line"><div>Няма избрани услуги.</div><div class="r">0€</div></div>';
      scrollToResult(breakdown || totalEUR);
    };

    const updateDrone=()=>{
      if(!droneMode||!droneHours)return;
      const hourly=droneMode.value==='hour';
      droneHours.disabled=!hourly; droneHours.style.opacity=hourly?'1':'.45';
    };

    [photoTeam,videoTeam,otHours,km,droneMode,droneHours,rawFiles,afterSession].filter(Boolean).forEach(el=>{
      el.addEventListener('input',calcWedding);el.addEventListener('change',calcWedding);
    });
    if(droneMode) droneMode.addEventListener('change',updateDrone);
    if(q('recalcWedding')) q('recalcWedding').addEventListener('click',calcWedding);
    if(q('resetCalc')) q('resetCalc').addEventListener('click',()=>{
      photoTeam.value='0';videoTeam.value='0';otHours.value='0';km.value='0';droneMode.value='none';droneHours.value='1';rawFiles.checked=false;afterSession.checked=false;updateDrone();calcWedding();
    });

    // Other-events calculator
    const eventType=q('eventType'),eventHours=q('eventHours'),eventPeople=q('eventPeople'),eventKm=q('eventKm'),eventRaw=q('eventRawFiles');
    const eventTotalEUR=q('eventTotalEUR'),eventTotalBGN=q('eventTotalBGN'),eventBreakdown=q('eventBreakdown');
    const EVENT={birthday:88,baptism:99,corporate:128,other:88,raw:168,transport:.58};
    const calcEvent=()=>{
      if(!eventType||!eventTotalEUR)return;
      const type=eventType.value,h=Math.min(MAX_HOURS,Math.max(1,+eventHours.value||1)),people=Math.max(1,+eventPeople.value||1),kmv=Math.max(0,+eventKm.value||0),rate=EVENT[type]||EVENT.other;
      if(eventHours) eventHours.value=String(h);
      let total=h*people*rate,lines=[line(`Покритие: ${h}ч × ${people} × ${rate}€`,total)];
      if(kmv){const x=kmv*EVENT.transport;total+=x;lines.push(line(`Транспорт: ${kmv} км × 0.58€`,x));}
      if(eventRaw.checked){total+=EVENT.raw;lines.push(line('Сурови файлове',EVENT.raw));}
      eventTotalEUR.textContent=moneyEUR(total);if(eventTotalBGN)eventTotalBGN.textContent=moneyBGN(total);
      if(eventBreakdown)eventBreakdown.innerHTML=lines.join('');
      scrollToResult(eventBreakdown || eventTotalEUR);
    };
    [eventType,eventHours,eventPeople,eventKm,eventRaw].filter(Boolean).forEach(el=>{el.addEventListener('input',calcEvent);el.addEventListener('change',calcEvent);});
    if(q('recalcEvent'))q('recalcEvent').addEventListener('click',calcEvent);
    if(q('resetEventCalc'))q('resetEventCalc').addEventListener('click',()=>{eventType.value='birthday';eventHours.value='2';eventPeople.value='1';eventKm.value='0';eventRaw.checked=false;calcEvent();});

    // Inquiry helpers
    const inquirySection=q('inquirySection'),inquiryType=q('inquiryType'),selectedOffer=q('selectedOffer'),inquirySummary=q('inquirySummary');
    const clientName=q('clientName'),clientPhone=q('clientPhone'),clientEmail=q('clientEmail'),eventDate=q('eventDate'),eventLocation=q('eventLocation'),clientNote=q('clientNote'),privacy=q('privacyConsent'),send=q('sendInquiry'),status=q('sendStatus');
    const openInquiry=()=>inquirySection?.scrollIntoView({behavior:'smooth',block:'start'});
    const weddingSummary=()=>`Тип: Сватба\nФотографи: ${+photoTeam.value||0}\nОператори: ${+videoTeam.value||0}\nДопълнителни часове: ${Math.min(MAX_HOURS,+otHours.value||0)}\nТранспорт (км): ${+km.value||0}\nДрон: ${droneMode.value==='hour'?'По часове ('+Math.min(MAX_HOURS,(+droneHours.value||1))+' ч)':droneMode.value==='day'?'За целия ден':'Не'}\nСурови файлове: ${rawFiles.checked?'Да':'Не'}\nФотосесия в отделен ден: ${afterSession.checked?'Да':'Не'}\nОриентировъчна сума: ${totalEUR.textContent} / ${totalBGN.textContent}`;
    const eventSummary=()=>`Тип: ${({birthday:'Рожден ден',baptism:'Кръщене',corporate:'Фирмено събитие',other:'Друго'})[eventType.value]||'Друго'}\nЧасове: ${Math.min(MAX_HOURS,+eventHours.value||1)}\nХора в екипа: ${+eventPeople.value||1}\nТранспорт (км): ${+eventKm.value||0}\nСурови файлове: ${eventRaw.checked?'Да':'Не'}\nОриентировъчна сума: ${eventTotalEUR.textContent} / ${eventTotalBGN.textContent}`;

    document.querySelectorAll('.package-inquiry-btn').forEach(btn=>{
      if(btn.dataset.pricingFixBound) return;btn.dataset.pricingFixBound='1';
      btn.addEventListener('click',()=>{inquiryType.value='Пакетна оферта';selectedOffer.value=btn.dataset.package+' — '+btn.dataset.packagePrice;inquirySummary.value='Избрана оферта: '+btn.dataset.package+'\nЦена: '+btn.dataset.packagePrice+'\nТип: Пакетна оферта';openInquiry();});
    });
    if(q('openWeddingInquiry'))q('openWeddingInquiry').addEventListener('click',()=>{calcWedding();inquiryType.value='Персонална конфигурация';selectedOffer.value='Персонална конфигурация за сватба';inquirySummary.value=weddingSummary();openInquiry();});
    if(q('openEventInquiry'))q('openEventInquiry').addEventListener('click',()=>{calcEvent();inquiryType.value='Друго събитие';selectedOffer.value='Персонална конфигурация за друго събитие';inquirySummary.value=eventSummary();openInquiry();});

    if(send)send.addEventListener('click',async()=>{
      const name=clientName.value.trim(),phone=clientPhone.value.trim(),email=clientEmail.value.trim(),date=eventDate.value.trim(),location=eventLocation.value.trim(),note=clientNote.value.trim(),offer=selectedOffer.value.trim(),summary=inquirySummary.value.trim();
      if(!name)return status.textContent='Моля, попълнете име.';
      if(!phone)return status.textContent='Моля, попълнете телефон.';
      if(!email)return status.textContent='Моля, попълнете имейл.';
      if(!date)return status.textContent='Моля, изберете дата на събитието.';
      if(!summary)return status.textContent='Моля, първо изберете оферта или конфигурация.';
      if(!privacy.checked)return status.textContent='Моля, потвърдете съгласието за лични данни.';
      send.disabled=true;status.textContent='Изпращане...';
      try{
        const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:'33fb475c-9d44-449b-9fd0-1fc667dd170e',subject:'Ново запитване от сайта - Memory Photo & Video',from_name:'Memory Photo & Video',name,email,phone,event_date:date,event_location:location,inquiry_type:inquiryType.value,selected_offer:offer,calculator_summary:summary,note})});
        const result=await r.json();
        if(result.success){status.textContent='Запитването беше изпратено успешно.';[clientName,clientPhone,clientEmail,eventDate,eventLocation,clientNote].forEach(el=>el.value='');privacy.checked=false;}else status.textContent='Възникна проблем при изпращането.';
      }catch(e){status.textContent='Грешка при връзката. Опитайте отново.';}
      finally{send.disabled=false;}
    });

    updateDrone();calcWedding();calcEvent();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
