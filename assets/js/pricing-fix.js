(()=>{
  const init=()=>{
    if(!location.pathname.endsWith('/uslugi-ceni.html')) return;
    if(window.__pricingFixLoaded) return;
    window.__pricingFixLoaded=true;

    const isEnglish=new URLSearchParams(location.search).get('lang')==='en'||location.pathname.startsWith('/en/');
    const q=id=>document.getElementById(id);
    const EUR_TO_BGN=1.95583;
    const MAX_HOURS=24;
    const TRANSPORT_PER_KM=0.51;

    document.querySelectorAll('.pricing-page .reveal,.pricing-page .reveal-left,.pricing-page .reveal-scale')
      .forEach(el=>{el.style.opacity='1';el.style.transform='none';});

    const moneyEUR=n=>n.toLocaleString(isEnglish?'en-US':'bg-BG',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2})+' €';
    const moneyBGN=n=>Math.round(n*EUR_TO_BGN)+(isEnglish?' BGN':' лв.');
    const line=(label,value)=>`<div class="line"><div>${label}</div><div class="r">${moneyEUR(value)}</div></div>`;

    const clampHours=(input,min=0)=>{
      if(!input) return min;
      let n=Number(input.value);
      if(!Number.isFinite(n)) n=min;
      n=Math.min(MAX_HOURS,Math.max(min,Math.ceil(n)));
      input.value=String(n);
      return n;
    };

    [q('otHours'),q('droneHours'),q('eventHours')].filter(Boolean).forEach(input=>{
      input.max=String(MAX_HOURS);
      input.step='1';
      input.addEventListener('change',()=>clampHours(input,input.id==='droneHours'||input.id==='eventHours'?1:0));
    });

    const scrollToResult=target=>{
      if(!target||!window.matchMedia('(max-width: 768px)').matches) return;
      window.setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'center'}),80);
    };

    const calculatorSection=q('panel-wedding')?.closest('.glass-card');
    if(calculatorSection && !q('travelInfoCard')){
      const info=document.createElement('section');
      info.id='travelInfoCard';
      info.className='glass-card reveal';
      info.style.opacity='1';
      info.style.transform='none';
      info.innerHTML=isEnglish?`
        <div class="section-topline">
          <div>
            <h2>Additional information</h2>
            <p>Travel and accommodation conditions for events outside Kardzhali.</p>
          </div>
          <div class="pill">travel & accommodation</div>
        </div>
        <div class="included-all" style="margin-bottom:0">
          <div class="inc-grid">
            <div class="inc-item">No travel fee for events within the city of Kardzhali.</div>
            <div class="inc-item">Outside Kardzhali: €0.51 per km, calculated one way (about BGN 1.00/km).</div>
            <div class="inc-item">More than 100 km from Kardzhali: accommodation for the team is required after the wedding.</div>
            <div class="inc-item">More than 200 km from Kardzhali: accommodation must be arranged and paid for before and after the wedding.</div>
          </div>
        </div>`:`
        <div class="section-topline">
          <div>
            <h2>Допълнителна информация</h2>
            <p>Условия за транспорт и нощувки при събития извън гр. Кърджали.</p>
          </div>
          <div class="pill">транспорт и нощувки</div>
        </div>
        <div class="included-all" style="margin-bottom:0">
          <div class="inc-grid">
            <div class="inc-item">Транспорт не се заплаща за събития в рамките на гр. Кърджали.</div>
            <div class="inc-item">За събития извън Кърджали транспортът е 0,51 € / км в едната посока (≈ 1,00 лв./км).</div>
            <div class="inc-item">При сватба на повече от 100 км от гр. Кърджали е необходимо да бъде осигурено място за спане за екипа след сватбата.</div>
            <div class="inc-item">При сватба на повече от 200 км е необходимо да бъде осигурено и заплатено място за спане за екипа преди и след сватбата.</div>
          </div>
        </div>`;
      calculatorSection.parentNode.insertBefore(info,calculatorSection);
    }

    const setLabel=(forId,bg,en)=>{
      const label=document.querySelector(`label[for="${forId}"]`);
      if(label) label.textContent=isEnglish?en:bg;
    };
    setLabel('km','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventKm','Разстояние от Кърджали (км, еднопосочно)','Distance from Kardzhali (km, one way)');
    setLabel('eventHours','Започнати часове','Started hours');
    setLabel('eventPeople','Фотографи / оператори','Photographers / videographers');

    const otherSection=[...document.querySelectorAll('.glass-card')].find(section=>{
      const title=section.querySelector('h2')?.textContent.trim();
      return title==='Други събития'||title==='Other events';
    });
    if(otherSection){
      const intro=otherSection.querySelector('.section-topline p');
      if(intro) intro.textContent=isEnglish
        ? 'For one photographer or one videographer: €120 for the first started hour and €80 for each subsequent started hour.'
        : 'За 1 фотограф или 1 оператор: 120 € за първия започнат час и 80 € за всеки следващ започнат час.';
      otherSection.querySelectorAll('.event-rate').forEach(el=>{
        el.textContent=isEnglish
          ? '€120 first hour · €80 each next hour'
          : '120 € първи час · 80 € всеки следващ';
      });
    }

    const tabs=[...document.querySelectorAll('.mode-tab')];
    const panels=[...document.querySelectorAll('.mode-panel')];
    tabs.forEach(tab=>{
      if(tab.dataset.pricingFixBound) return;
      tab.dataset.pricingFixBound='1';
      tab.addEventListener('click',()=>{
        tabs.forEach(t=>t.classList.remove('active'));
        panels.forEach(p=>p.classList.remove('visible'));
        tab.classList.add('active');
        q('panel-'+tab.dataset.mode)?.classList.add('visible');
      });
    });

    const photoTeam=q('photoTeam'),videoTeam=q('videoTeam'),otHours=q('otHours'),km=q('km');
    const droneMode=q('droneMode'),droneHours=q('droneHours'),rawFiles=q('rawFiles'),afterSession=q('afterSession');
    const totalEUR=q('totalEUR'),totalBGN=q('totalBGN'),breakdown=q('breakdown');
    const PRICES={photo:{1:656,2:1106},video:{1:719,2:1214},overtime:78,raw:168,after:143,transport:TRANSPORT_PER_KM,droneHour:58,droneDay:224};

    const calcWedding=(shouldScroll=false)=>{
      if(!photoTeam||!videoTeam||!totalEUR) return;
      const p=+photoTeam.value||0;
      const v=+videoTeam.value||0;
      const ot=clampHours(otHours,0);
      const kmv=Math.max(0,+km.value||0);
      const people=p+v;
      const dm=droneMode?.value||'none';
      const dh=clampHours(droneHours,1);
      let total=0,lines=[];

      if(p){
        const x=PRICES.photo[p]||0; total+=x;
        lines.push(line(isEnglish?`Wedding photography: ${p} photographer${p===1?'':'s'} (up to 10h)`:`Сватбена фотография: ${p} фотограф${p===1?'':'и'} (до 10ч)`,x));
      }
      if(v){
        const x=PRICES.video[v]||0; total+=x;
        lines.push(line(isEnglish?`Wedding videography: ${v} videographer${v===1?'':'s'} (up to 10h)`:`Сватбена видеография: ${v} оператор${v===1?'':'и'} (до 10ч)`,x));
      }
      if(ot&&people){
        const x=ot*people*PRICES.overtime; total+=x;
        lines.push(line(isEnglish?`Extra hours: ${ot}h × ${people} × 78€`:`Доп. часове: ${ot}ч × ${people} × 78€`,x));
      }
      if(dm==='hour'){
        const x=dh*PRICES.droneHour; total+=x;
        lines.push(line(isEnglish?`Drone: ${dh}h × 58€`:`Дрон: ${dh}ч × 58€`,x));
      }else if(dm==='day'){
        total+=PRICES.droneDay;
        lines.push(line(isEnglish?'Full-day drone':'Дрон за целия ден',PRICES.droneDay));
      }
      if(rawFiles?.checked){total+=PRICES.raw;lines.push(line(isEnglish?'Raw files':'Сурови файлове',PRICES.raw));}
      if(afterSession?.checked){total+=PRICES.after;lines.push(line(isEnglish?'Photo session on a separate day':'Фотосесия в отделен ден',PRICES.after));}
      if(kmv){
        const x=kmv*PRICES.transport; total+=x;
        lines.push(line(isEnglish?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));
      }

      totalEUR.textContent=moneyEUR(total);
      if(totalBGN) totalBGN.textContent=moneyBGN(total);
      if(breakdown) breakdown.innerHTML=lines.join('')||`<div class="line"><div>${isEnglish?'No services selected.':'Няма избрани услуги.'}</div><div class="r">0 €</div></div>`;
      if(shouldScroll) scrollToResult(breakdown||totalEUR);
    };

    const updateDrone=()=>{
      if(!droneMode||!droneHours) return;
      const hourly=droneMode.value==='hour';
      droneHours.disabled=!hourly;
      droneHours.style.opacity=hourly?'1':'.45';
    };

    [photoTeam,videoTeam,otHours,km,droneMode,droneHours,rawFiles,afterSession].filter(Boolean).forEach(el=>{
      el.addEventListener('input',()=>calcWedding(false));
      el.addEventListener('change',()=>calcWedding(false));
    });
    droneMode?.addEventListener('change',updateDrone);
    q('recalcWedding')?.addEventListener('click',()=>calcWedding(true));
    q('resetCalc')?.addEventListener('click',()=>{
      photoTeam.value='0';videoTeam.value='0';otHours.value='0';km.value='0';droneMode.value='none';droneHours.value='1';rawFiles.checked=false;afterSession.checked=false;
      updateDrone();calcWedding(false);
    });

    const eventType=q('eventType'),eventHours=q('eventHours'),eventPeople=q('eventPeople'),eventKm=q('eventKm'),eventRaw=q('eventRawFiles');
    const eventTotalEUR=q('eventTotalEUR'),eventTotalBGN=q('eventTotalBGN'),eventBreakdown=q('eventBreakdown');
    const EVENT={firstHour:120,nextHour:80,raw:168,transport:TRANSPORT_PER_KM};

    const calcEvent=(shouldScroll=false)=>{
      if(!eventTotalEUR) return;
      const h=clampHours(eventHours,1);
      const people=Math.max(1,Math.ceil(+eventPeople.value||1));
      eventPeople.value=String(Math.min(4,people));
      const team=Math.min(4,people);
      const kmv=Math.max(0,+eventKm.value||0);
      const first=team*EVENT.firstHour;
      const extraHours=Math.max(0,h-1);
      const extra=extraHours*team*EVENT.nextHour;
      let total=first+extra;
      const lines=[line(isEnglish?`First started hour: ${team} × €120`:`Първи започнат час: ${team} × 120 €`,first)];

      if(extraHours){
        lines.push(line(isEnglish?`Next hours: ${extraHours}h × ${team} × €80`:`Следващи часове: ${extraHours}ч × ${team} × 80 €`,extra));
      }
      if(kmv){
        const x=kmv*EVENT.transport; total+=x;
        lines.push(line(isEnglish?`Travel: ${kmv} km × €0.51 (one way)`:`Транспорт: ${kmv} км × 0,51 € (еднопосочно)`,x));
      }
      if(eventRaw?.checked){total+=EVENT.raw;lines.push(line(isEnglish?'Raw files':'Сурови файлове',EVENT.raw));}

      eventTotalEUR.textContent=moneyEUR(total);
      if(eventTotalBGN) eventTotalBGN.textContent=moneyBGN(total);
      if(eventBreakdown) eventBreakdown.innerHTML=lines.join('');
      if(shouldScroll) scrollToResult(eventBreakdown||eventTotalEUR);
    };

    [eventType,eventHours,eventPeople,eventKm,eventRaw].filter(Boolean).forEach(el=>{
      el.addEventListener('input',()=>calcEvent(false));
      el.addEventListener('change',()=>calcEvent(false));
    });
    q('recalcEvent')?.addEventListener('click',()=>calcEvent(true));
    q('resetEventCalc')?.addEventListener('click',()=>{
      if(eventType) eventType.value='birthday';eventHours.value='2';eventPeople.value='1';eventKm.value='0';eventRaw.checked=false;calcEvent(false);
    });

    const inquirySection=q('inquirySection'),inquiryType=q('inquiryType'),selectedOffer=q('selectedOffer'),inquirySummary=q('inquirySummary');
    const clientName=q('clientName'),clientPhone=q('clientPhone'),clientEmail=q('clientEmail'),eventDate=q('eventDate'),eventLocation=q('eventLocation'),clientNote=q('clientNote'),privacy=q('privacyConsent'),send=q('sendInquiry'),status=q('sendStatus');
    const openInquiry=()=>inquirySection?.scrollIntoView({behavior:'smooth',block:'start'});
    const weddingSummary=()=>isEnglish
      ?`Type: Wedding\nPhotographers: ${+photoTeam.value||0}\nVideographers: ${+videoTeam.value||0}\nExtra hours: ${clampHours(otHours,0)}\nOne-way distance from Kardzhali (km): ${+km.value||0}\nDrone: ${droneMode.value==='hour'?'Hourly ('+clampHours(droneHours,1)+' h)':droneMode.value==='day'?'Full day':'No'}\nRaw files: ${rawFiles.checked?'Yes':'No'}\nSeparate-day photo session: ${afterSession.checked?'Yes':'No'}\nEstimated total: ${totalEUR.textContent} / ${totalBGN.textContent}`
      :`Тип: Сватба\nФотографи: ${+photoTeam.value||0}\nОператори: ${+videoTeam.value||0}\nДопълнителни часове: ${clampHours(otHours,0)}\nРазстояние от Кърджали, еднопосочно (км): ${+km.value||0}\nДрон: ${droneMode.value==='hour'?'По часове ('+clampHours(droneHours,1)+' ч)':droneMode.value==='day'?'За целия ден':'Не'}\nСурови файлове: ${rawFiles.checked?'Да':'Не'}\nФотосесия в отделен ден: ${afterSession.checked?'Да':'Не'}\nОриентировъчна сума: ${totalEUR.textContent} / ${totalBGN.textContent}`;

    const eventSummary=()=>{
      const typeMap=isEnglish
        ?{birthday:'Birthday',baptism:'Baptism',corporate:'Corporate event',other:'Other'}
        :{birthday:'Рожден ден',baptism:'Кръщене',corporate:'Фирмено събитие',other:'Друго'};
      return isEnglish
        ?`Type: ${typeMap[eventType.value]||'Other'}\nStarted hours: ${clampHours(eventHours,1)}\nPhotographers / videographers: ${+eventPeople.value||1}\nRate: €120 first started hour + €80 each next started hour\nOne-way distance from Kardzhali (km): ${+eventKm.value||0}\nRaw files: ${eventRaw.checked?'Yes':'No'}\nEstimated total: ${eventTotalEUR.textContent} / ${eventTotalBGN.textContent}`
        :`Тип: ${typeMap[eventType.value]||'Друго'}\nЗапочнати часове: ${clampHours(eventHours,1)}\nФотографи / оператори: ${+eventPeople.value||1}\nТарифа: 120 € първи започнат час + 80 € всеки следващ започнат час\nРазстояние от Кърджали, еднопосочно (км): ${+eventKm.value||0}\nСурови файлове: ${eventRaw.checked?'Да':'Не'}\nОриентировъчна сума: ${eventTotalEUR.textContent} / ${eventTotalBGN.textContent}`;
    };

    document.querySelectorAll('.package-inquiry-btn').forEach(btn=>{
      if(btn.dataset.pricingFixBound) return;
      btn.dataset.pricingFixBound='1';
      btn.addEventListener('click',()=>{
        inquiryType.value='Пакетна оферта';
        selectedOffer.value=btn.dataset.package+' — '+btn.dataset.packagePrice;
        inquirySummary.value=isEnglish
          ?'Selected offer: '+btn.dataset.package+'\nPrice: '+btn.dataset.packagePrice+'\nType: Package offer'
          :'Избрана оферта: '+btn.dataset.package+'\nЦена: '+btn.dataset.packagePrice+'\nТип: Пакетна оферта';
        openInquiry();
      });
    });

    q('openWeddingInquiry')?.addEventListener('click',()=>{
      calcWedding(false);inquiryType.value='Персонална конфигурация';selectedOffer.value=isEnglish?'Custom wedding configuration':'Персонална конфигурация за сватба';inquirySummary.value=weddingSummary();openInquiry();
    });
    q('openEventInquiry')?.addEventListener('click',()=>{
      calcEvent(false);inquiryType.value='Друго събитие';selectedOffer.value=isEnglish?'Custom configuration for another event':'Персонална конфигурация за друго събитие';inquirySummary.value=eventSummary();openInquiry();
    });

    if(send) send.addEventListener('click',async()=>{
      const name=clientName.value.trim(),phone=clientPhone.value.trim(),email=clientEmail.value.trim(),date=eventDate.value.trim(),location=eventLocation.value.trim(),note=clientNote.value.trim(),offer=selectedOffer.value.trim(),summary=inquirySummary.value.trim();
      if(!name) return status.textContent=isEnglish?'Please enter your name.':'Моля, попълнете име.';
      if(!phone) return status.textContent=isEnglish?'Please enter your phone number.':'Моля, попълнете телефон.';
      if(!email) return status.textContent=isEnglish?'Please enter your email.':'Моля, попълнете имейл.';
      if(!date) return status.textContent=isEnglish?'Please select the event date.':'Моля, изберете дата на събитието.';
      if(!summary) return status.textContent=isEnglish?'Please select an offer or configuration first.':'Моля, първо изберете оферта или конфигурация.';
      if(!privacy.checked) return status.textContent=isEnglish?'Please confirm the privacy consent.':'Моля, потвърдете съгласието за лични данни.';
      send.disabled=true;status.textContent=isEnglish?'Sending...':'Изпращане...';
      try{
        const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:'33fb475c-9d44-449b-9fd0-1fc667dd170e',subject:'Ново запитване от сайта - Memory Photo & Video',from_name:'Memory Photo & Video',name,email,phone,event_date:date,event_location:location,inquiry_type:inquiryType.value,selected_offer:offer,calculator_summary:summary,note})});
        const result=await r.json();
        if(result.success){
          status.textContent=isEnglish?'Your inquiry was sent successfully.':'Запитването беше изпратено успешно.';
          [clientName,clientPhone,clientEmail,eventDate,eventLocation,clientNote].forEach(el=>el.value='');privacy.checked=false;
        }else status.textContent=isEnglish?'There was a problem sending the inquiry.':'Възникна проблем при изпращането.';
      }catch(e){status.textContent=isEnglish?'Connection error. Please try again.':'Грешка при връзката. Опитайте отново.';}
      finally{send.disabled=false;}
    });

    updateDrone();
    calcWedding(false);
    calcEvent(false);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();