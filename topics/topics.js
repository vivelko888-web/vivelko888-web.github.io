(()=>{'use strict';
const $=s=>document.querySelector(s),storeKey='moy-mir-topics-v1';
let categories=[],category=0,index=0,rate=1,audio=null,generation=0,timer=null;
const status=message=>{$('#topic-status').textContent=message;};
function stop(){generation++;clearTimeout(timer);timer=null;if(audio){audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();audio=null;}$('#topic-listen').disabled=false;}
function save(){try{localStorage.setItem(storeKey,JSON.stringify({category:categories[category].id,index,rate}));}catch{/* Cards do not require storage. */}}
function render(){
 stop();const group=categories[category],card=group.cards[index];
 $('#card-area').hidden=false;$('#topic-title').textContent=group.title;$('#topic-word').textContent=card.word;
 $('#topic-image').src=card.image;$('#topic-image').alt='';$('#topic-card').style.setProperty('--topic-color',group.color);
 $('#topic-count').textContent=`Карточка ${index+1} из ${group.cards.length}`;
 $('#topic-card-select').replaceChildren(...group.cards.map((x,i)=>new Option(x.word,String(i),false,i===index)));
 $('#topic-previous').disabled=index===0;$('#topic-next').disabled=index===group.cards.length-1;
 document.querySelectorAll('.topic-category').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===category)));
 status('Звук включается только по нажатию.');save();
}
function select(next){category=next;index=0;render();}
function play(){
 stop();const token=generation,card=categories[category].cards[index];audio=new Audio(card.audio);const current=audio;
 current.playbackRate=rate;current.preservesPitch=true;$('#topic-listen').disabled=true;status('Слушаем: '+card.word);
 const failed=()=>{if(token!==generation)return;stop();status('Не удалось загрузить запись. Проверьте интернет и нажмите «Послушать» ещё раз.');};
 current.onended=()=>{if(token!==generation)return;clearTimeout(timer);$('#topic-listen').disabled=false;status('Можно послушать ещё раз.');};
 current.onerror=failed;timer=setTimeout(failed,20000);
 try{current.play().catch(failed);}catch{failed();}
}
async function load(){
 $('#topic-retry').hidden=true;$('#topic-load-status').textContent='Загружаем карточки…';
 try{
  const response=await fetch('/topics/data.json');if(!response.ok)throw new Error('catalog');
  const data=await response.json();categories=data.categories;
  let saved;try{saved=JSON.parse(localStorage.getItem(storeKey));}catch{}
  const hash=location.hash.slice(1),selected=categories.findIndex(x=>x.id===(hash||saved?.category));category=Math.max(0,selected);
  index=!hash&&Number.isInteger(saved?.index)&&saved.index>=0&&saved.index<categories[category].cards.length?saved.index:0;
  if([.85,1,1.15].includes(saved?.rate))rate=saved.rate;$('#topic-rate').value=String(rate);
  $('#categories').replaceChildren(...categories.map((group,i)=>{
   const button=document.createElement('button');button.type='button';button.className='topic-category';button.style.setProperty('--topic-color',group.color);button.setAttribute('aria-pressed','false');
   const image=document.createElement('img');image.src=group.cards[0].image;image.width=56;image.height=56;image.alt='';
   const label=document.createElement('span');label.textContent=group.title;button.append(image,label);
   button.addEventListener('click',()=>{select(i);$('#card-area').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});return button;
  }));
  render();$('#topic-load-status').textContent='';
 }catch{$('#topic-load-status').textContent='Не удалось загрузить карточки. Проверьте подключение к интернету.';$('#topic-retry').hidden=false;}
}
$('#topic-listen').addEventListener('click',play);
$('#topic-stop').addEventListener('click',()=>{stop();status('Звук остановлен. Можно сделать перерыв.');});
$('#topic-card-select').addEventListener('change',event=>{index=Number(event.target.value);render();});
$('#topic-previous').addEventListener('click',()=>{if(index>0){index--;render();}});
$('#topic-next').addEventListener('click',()=>{if(index+1<categories[category].cards.length){index++;render();}});
$('#topic-rate').addEventListener('change',event=>{stop();rate=Number(event.target.value);save();status('Темп изменён. Нажмите «Послушать».');});
$('#topic-retry').addEventListener('click',load);
window.addEventListener('hashchange',()=>{const next=categories.findIndex(x=>x.id===location.hash.slice(1));if(next>=0)select(next);});
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});load();
})();
