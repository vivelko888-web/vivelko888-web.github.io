(()=>{
 const status=document.querySelector('#offline-status'),button=document.querySelector('#save-offline');
 const show=text=>{if(status)status.textContent=text;};let registration;
 if('serviceWorker'in navigator){registration=navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{show('Сохранение без интернета сейчас недоступно. Карточки можно открыть онлайн.');return null;});}
 else{show('Этот браузер не поддерживает сохранение. Карточки доступны онлайн.');if(button)button.disabled=true;}
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(standalone){const note=document.querySelector('#installed-note');if(note)note.hidden=false;}
 if(button)button.addEventListener('click',async()=>{
  button.disabled=true;show('Готовим сохранение…');
  try{
   const reg=await registration;if(!reg)throw new Error('service worker');
   const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),20000))]);
   const worker=ready.active;if(!worker)throw new Error('no worker');
   if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
   const channel=new MessageChannel();let watchdog;
   const arm=()=>{clearTimeout(watchdog);watchdog=setTimeout(()=>{button.disabled=false;show('Сохранение прервалось. Проверьте интернет и повторите.');channel.port1.close();},90000);};
   channel.port1.onmessage=event=>{
    const data=event.data;arm();
    if(data.type==='progress')show(`Сохранено файлов: ${data.done} из ${data.total}. Не закрывайте приложение.`);
    if(data.type==='done'||data.type==='error'){clearTimeout(watchdog);button.disabled=false;channel.port1.close();show(data.type==='done'?'Русские карточки, картинки и записи сохранены. Проверьте их с выключенным интернетом.':data.message);}
   };
   arm();worker.postMessage({type:'CACHE_OFFLINE'},[channel.port2]);
  }catch{button.disabled=false;show('Сохранение недоступно. Откройте сайт через Safari по HTTPS и попробуйте ещё раз.');}
 });
})();
