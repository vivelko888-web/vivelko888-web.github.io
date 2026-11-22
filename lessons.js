// Lessons and optional bookmarks stay in this browser; no child identifiers.
const alphabet = [
 ['А','Арбуз','🍉'],['Б','Банан','🍌'],['В','Вода','💧'],['Г','Гриб','🍄'],
 ['Д','Дом','🏠'],['Е','Енот','🦝'],['Ё','Ёж','🦔'],['Ж','Жук','🐞'],
 ['З','Зонт','☂️'],['И','Иголка','🪡'],['Й','Йогурт','🥛'],['К','Кот','🐈'],
 ['Л','Лимон','🍋'],['М','Мяч','⚽'],['Н','Нос','👃'],['О','Облако','☁️'],
 ['П','Пингвин','🐧'],['Р','Рыба','🐟'],['С','Солнце','☀️'],['Т','Тигр','🐅'],
 ['У','Утка','🦆'],['Ф','Фонарь','🔦'],['Х','Хлеб','🍞'],['Ц','Цветок','🌼'],
 ['Ч','Часы','⏰'],['Ш','Шар','🎈'],['Щ','Щётка','🪥'],['Ъ','Твёрдый знак',''],
 ['Ы','Сыр','🧀'],['Ь','Мягкий знак',''],['Э','Экран','🖥️'],
 ['Ю','Юла',''],['Я','Яблоко','🍎']
];
const ones=['','Один','Два','Три','Четыре','Пять','Шесть','Семь','Восемь','Девять'];
const teens=['Десять','Одиннадцать','Двенадцать','Тринадцать','Четырнадцать','Пятнадцать','Шестнадцать','Семнадцать','Восемнадцать','Девятнадцать'];
const tens=['','','Двадцать','Тридцать','Сорок','Пятьдесят','Шестьдесят','Семьдесят','Восемьдесят','Девяносто'];
function numberName(n){
 if(n===100)return 'Сто';if(n===101)return 'Сто один';
 if(n<10)return ones[n];if(n<20)return teens[n-10];
 return [tens[Math.floor(n/10)],ones[n%10].toLowerCase()].filter(Boolean).join(' ');
}
const wordCards=[
 ['МА · МА','Мама','👩'],['ПА · ПА','Папа','👨'],['БА · БА','Баба','👵'],
 ['РЫ · БА','Рыба','🐟'],['ВО · ДА','Вода','💧'],['ЛУ · НА','Луна','🌙'],
 ['КА · ША','Каша','🥣'],['РУ · КА','Рука','✋'],['НО · ГА','Нога','🦵'],
 ['ЛИ · СА','Лиса','🦊'],['КО · ЗА','Коза','🐐'],['СО · ВА','Сова','🦉'],
 ['РО · ЗА','Роза','🌹'],['ВА · ЗА','Ваза','🏺'],['БУ · СЫ','Бусы','📿'],
 ['СА · НИ','Сани','🛷'],['ГУ · СИ','Гуси',''],['ДЕ · РЕ · ВО','Дерево','🌳'],
 ['МА · ШИ · НА','Машина','🚗'],['МО · ЛО · КО','Молоко','🥛']
];
let lessons={
 letters:alphabet.map(([main,word,icon])=>({main,word,icon,say:`${main}. ${word}`})),
 numbers:Array.from({length:101},(_,i)=>({main:String(i+1),word:numberName(i+1),icon:'',say:numberName(i+1)})),
 syllables:[...'БВГДЗКЛМНРСТ'].flatMap(c=>[...'АОУЫЭ'].map(v=>({main:c+v,word:'Слушаем и повторяем',icon:'',say:c+v}))),
 words:wordCards.map(([main,word,icon])=>({main,word,icon,say:word,parts:main.split(' · ')}))
};
const language=document.documentElement.lang||'ru';
const locale=window.lessonLocales?.[language];
if(language!=='ru'&&!locale){
 const message=({pl:'Nie udało się wczytać kart. Odśwież stronę.',fr:'Impossible de charger les cartes. Actualisez la page.',de:'Die Karten konnten nicht geladen werden. Bitte lade die Seite neu.',it:'Impossibile caricare le schede. Aggiorna la pagina.',es:'No se pudieron cargar las tarjetas. Actualiza la página.',pt:'Não foi possível carregar os cartões. Atualize a página.'})[language.toLowerCase().split('-')[0]]??'The cards could not load. Please refresh the page.';
 document.querySelector('#speech-status').textContent=message;
 document.querySelectorAll('#try button,#try select').forEach(control=>control.disabled=true);
 throw new Error('Lesson language bundle unavailable');
}
if(locale)lessons=locale.lessons;
const labels=locale?.labels??{letters:'Знакомимся с буквами',numbers:'Знакомимся с числами',syllables:'Соединяем звуки',words:'Читаем по слогам'};
const ruUi={saved:'Место занятия сохраняется только в этом браузере.',noStorage:'Браузер не разрешает сохранение. Занятия доступны без него.',last:'Последняя карточка. Можно повторить любимое или выбрать другой раздел.',pace:'Можно заниматься столько, сколько удобно.',tap:'Звук включается только по нажатию.',rateChanged:'Скорость изменена. Нажмите «Послушать».',unsupported:'Браузер не поддерживает озвучивание. Карточки доступны без звука.',noVoice:'Русский голос не найден. Установите русский голос в настройках речи устройства и попробуйте снова.',finished:'Можно послушать ещё раз.',parts:'Слушаем по слогам: ',listening:'Слушаем…',speechError:'Не удалось воспроизвести голос. Проверьте громкость и русский голос устройства.',stopped:'Звук остановлен. Можно сделать перерыв.'};
const text=key=>(locale?.ui??ruUi)[key];
const speechLang=locale?.speechLang??'ru-RU';
const colors={letters:'mint',numbers:'blue',syllables:'lilac',words:'peach'};
const storageKey='moy-mir-lessons-v1'+(language==='ru'?'':'-'+language);
let type='letters',index=0,rate=.65,preferredVoice='',recordingSet='ready',recordingAudio=null,speechGeneration=0,speechTimer=null,playbackWatchdog=null,activeUtterance=null,progress={};
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved==='object'){
 for(const key of Object.keys(lessons))if(Number.isInteger(saved[key])&&saved[key]>=0&&saved[key]<lessons[key].length)progress[key]=saved[key];
 if(Object.hasOwn(lessons,saved.type)){type=saved.type;index=progress[type]??0;}
 if([.5,.65,.85].includes(saved.rate))rate=saved.rate;
 if(typeof saved.voice==='string')preferredVoice=saved.voice;
 if(['ready','system'].includes(saved.recordingSet))recordingSet=saved.recordingSet;
}}catch{/* Private browsers may disallow storage. Lessons still work. */}
const $=s=>document.querySelector(s),tabs=[...document.querySelectorAll('[role=tab]')],sample=$('#sample'),status=$('#speech-status');
// Keep stopping available without opening the adult sound settings.
sample.after($('#stop-speech'));$('#stop-speech').classList.add('stop-playback');
function save(){progress[type]=index;try{localStorage.setItem(storageKey,JSON.stringify({...progress,type,rate,voice:preferredVoice,recordingSet}));$('#save-status').textContent=text('saved');}catch{$('#save-status').textContent=text('noStorage');}}
function stopSpeech(){speechGeneration++;clearTimeout(speechTimer);clearTimeout(playbackWatchdog);speechTimer=null;playbackWatchdog=null;if(activeUtterance){activeUtterance.onend=null;activeUtterance.onerror=null;activeUtterance=null;}if(recordingAudio){recordingAudio.onended=null;recordingAudio.onerror=null;recordingAudio.pause();recordingAudio.removeAttribute('src');recordingAudio.load();recordingAudio=null;}if('speechSynthesis'in window&&(window.speechSynthesis.speaking||window.speechSynthesis.pending))window.speechSynthesis.cancel();$('#listen').disabled=false;$('#listen-parts').disabled=false;if($('#listen-letter'))$('#listen-letter').disabled=false;}
const recordingSettings=document.createElement('div');recordingSettings.className='letter-audio-settings';
const recordingLabel=document.createElement('label');recordingLabel.htmlFor='letter-recording-set';recordingLabel.textContent='Озвучка';
const recordingSelect=document.createElement('select');recordingSelect.id=recordingLabel.htmlFor;
recordingSelect.append(new Option('Готовые записи — Екатерина','ready'));
recordingSelect.append(new Option('Голос устройства','system'));recordingSelect.value=recordingSet;
const recordingNote=document.createElement('p');recordingNote.className='caption';recordingNote.textContent='Готовые записи букв, слов, чисел и слогов звучат одинаково на разных устройствах. Для загрузки файлов нужен интернет. ';
const recordingCredits=document.createElement('a');recordingCredits.href='/assets/ekaterina/license-note.txt';recordingCredits.textContent='О записях';recordingNote.append(recordingCredits);
recordingSettings.append(recordingLabel,recordingSelect,recordingNote);sample.before(recordingSettings);
function recordingStatus(){return text('tap');}
recordingSelect.addEventListener('change',()=>{stopSpeech();recordingSet=recordingSelect.value;updateAudioControls();save();status.textContent=recordingStatus();});
const voiceCopy=({ru:['Голос устройства','Автоматически','Название буквы','Сравните голоса на одной букве. Некоторые используют интернет. Скорость «Обычно» меньше растягивает звук.'],en:['Device voice','Automatic','Letter name','Compare voices on the same letter. Some use the internet. Normal speed stretches sounds less.'],pl:['Głos urządzenia','Automatycznie','Nazwa litery','Porównaj głosy na tej samej literze. Niektóre korzystają z internetu. Zwykła prędkość mniej rozciąga dźwięk.'],fr:['Voix de l’appareil','Automatique','Nom de la lettre','Comparez les voix sur la même lettre. Certaines utilisent internet. La vitesse normale étire moins le son.'],de:['Gerätestimme','Automatisch','Buchstabenname','Vergleiche die Stimmen mit demselben Buchstaben. Manche benötigen Internet. Normales Tempo dehnt den Klang weniger.'],it:['Voce del dispositivo','Automatico','Nome della lettera','Confronta le voci sulla stessa lettera. Alcune usano internet. La velocità normale allunga meno il suono.'],es:['Voz del dispositivo','Automática','Nombre de la letra','Compara las voces con la misma letra. Algunas usan internet. La velocidad normal alarga menos el sonido.'],pt:['Voz do dispositivo','Automática','Nome da letra','Compare as vozes com a mesma letra. Algumas usam internet. A velocidade normal alonga menos o som.']})[language.split('-')[0]];
const voiceSelect=document.createElement('select');voiceSelect.id='speech-voice';
const voiceLabel=document.createElement('label');voiceLabel.htmlFor=voiceSelect.id;voiceLabel.textContent=voiceCopy[0];
const voiceHint=document.createElement('p');voiceHint.className='caption';voiceHint.textContent=voiceCopy[3];
$('#speech-rate').after(voiceLabel,voiceSelect,voiceHint);
function updateAudioControls(){const hidden=language==='ru'&&recordingSet==='ready';voiceLabel.hidden=hidden;voiceSelect.hidden=hidden;voiceHint.hidden=hidden;}
updateAudioControls();
const letterButton=document.createElement('button');letterButton.id='listen-letter';letterButton.className='listen parts';letterButton.textContent=voiceCopy[2];$('#listen').after(letterButton);
function updateVoices(){
 const voices=window.MoyMirSpeech.matchingVoices(window.speechSynthesis?.getVoices()??[],speechLang,locale?.voicePolicy??'language');
 voiceSelect.replaceChildren(new Option(voiceCopy[1],''),...voices.map(v=>new Option(v.name+' · '+v.lang,v.voiceURI||v.name)));
 voiceSelect.value=voices.some(v=>(v.voiceURI||v.name)===preferredVoice)?preferredVoice:'';
 voiceSelect.disabled=!voices.length;
}
voiceSelect.addEventListener('change',()=>{preferredVoice=voiceSelect.value;stopSpeech();save();status.textContent=text('tap');});
if('speechSynthesis'in window){window.speechSynthesis.addEventListener('voiceschanged',updateVoices);updateVoices();}
function render(){
 stopSpeech();const item=lessons[type][index];sample.className='sample '+colors[type];sample.setAttribute('aria-labelledby','tab-'+type);
 sample.querySelector('.sample-label').textContent=labels[type];$('#sample-main').textContent=item.main;
 $('#sample-main').classList.toggle('word-main',type==='words');$('#sample-word').textContent=item.word;
 const pictures=window.MoyMirPictures, illustration=$('#sample-icon');
 illustration.replaceChildren();
 const custom=pictures?.words[item.word];
 const emoji=pictures?.replaceEmoji[item.word]??item.icon;
 const images=custom?[custom]:Array.from(emoji??'').filter(c=>c!=='\ufe0f').length>1&&pictures?.replaceEmoji[item.word]
  ?Array.from(emoji).filter(c=>c!=='\ufe0f').map(c=>pictures?.emojis[c]).filter(Boolean)
  :[pictures?.emojis[emoji]].filter(Boolean);
 for(const path of images){const image=document.createElement('img');image.src=path;image.alt='';image.width=112;image.height=112;image.decoding='async';illustration.append(image);}
 if(!images.length)illustration.textContent=item.icon;
 illustration.hidden=!images.length&&!item.icon;$('#counter').textContent=`${index+1} / ${lessons[type].length}`;
 $('#listen-parts').hidden=!item.parts;$('#card-select').replaceChildren(...lessons[type].map((x,i)=>new Option(`${x.main} — ${x.word}`,String(i),false,i===index)));
 letterButton.hidden=type!=='letters';
 recordingSettings.hidden=language!=='ru';
 $('#previous').disabled=index===0;$('#next').disabled=index===lessons[type].length-1;
 $('#lesson-position').textContent=text(index===lessons[type].length-1?'last':'pace');
 tabs.forEach(t=>{const active=t.dataset.type===type;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
 status.textContent=recordingStatus();save();
}
function selectType(next){progress[type]=index;type=next;index=progress[type]??0;render();}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>selectType(tab.dataset.type));
 tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].focus();tabs[next].click();}});
});
$('#next').addEventListener('click',()=>{if(index<lessons[type].length-1){index++;render();}});
$('#previous').addEventListener('click',()=>{if(index>0){index--;render();}});
$('#card-select').addEventListener('change',event=>{index=Number(event.target.value);render();});
$('#speech-rate').value=String(rate);$('#speech-rate').addEventListener('change',event=>{rate=Number(event.target.value);stopSpeech();status.textContent=text('rateChanged');save();});
function speakRecorded(parts,segmented=false){
 stopSpeech();const generation=speechGeneration,player=new Audio();recordingAudio=player;
 $('#listen').disabled=true;$('#listen-parts').disabled=true;letterButton.disabled=true;
 const failed=()=>{if(generation!==speechGeneration)return;stopSpeech();status.textContent='Не удалось загрузить запись. Проверьте интернет и попробуйте ещё раз.';};
 function next(i){
  if(generation!==speechGeneration)return;
  if(i>=parts.length){stopSpeech();status.textContent=text('finished');return;}
  const url=window.MoyMirRussianAudio?.[parts[i].toLowerCase()];
  if(!url){failed();return;}
  player.src=url;player.playbackRate=rate===.5?.85:rate===.85?1.15:1;player.preservesPitch=true;
  status.textContent=segmented?text('parts')+parts[i]:'Слушаем запись: '+parts[i];
  player.onended=()=>{if(generation!==speechGeneration)return;clearTimeout(playbackWatchdog);speechTimer=setTimeout(()=>next(i+1),450);};
  player.onerror=failed;playbackWatchdog=setTimeout(failed,20000);
  try{player.play().catch(failed);}catch{failed();}
 }next(0);
}
function speak(parts,segmented=false){
 if(language==='ru'&&recordingSet==='ready'){speakRecorded(parts,segmented);return;}
 stopSpeech();if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){status.textContent=text('unsupported');return;}
 const voice=window.MoyMirSpeech?.selectVoice(window.speechSynthesis.getVoices(),speechLang,locale?.voicePolicy??'language',preferredVoice);
 if(!voice){status.textContent=text('noVoice');return;}
 const generation=speechGeneration;$('#listen').disabled=true;$('#listen-parts').disabled=true;letterButton.disabled=true;
 function next(i){if(generation!==speechGeneration)return;if(i>=parts.length){status.textContent=text('finished');$('#listen').disabled=false;$('#listen-parts').disabled=false;letterButton.disabled=false;return;}
  const spoken=speechLang.startsWith('ru')&&(segmented||type==='syllables')?parts[i].toLowerCase():parts[i];
  const u=new SpeechSynthesisUtterance(spoken);activeUtterance=u;u.lang=voice.lang;u.voice=voice;u.rate=rate;u.volume=1;u.pitch=1;
  status.textContent=segmented?text('parts')+parts[i]:text('listening');
  const failed=()=>{if(generation!==speechGeneration)return;stopSpeech();status.textContent=text('speechError');};
  u.onend=()=>{if(generation!==speechGeneration)return;clearTimeout(playbackWatchdog);activeUtterance=null;speechTimer=setTimeout(()=>next(i+1),450);};u.onerror=failed;
  playbackWatchdog=setTimeout(failed,Math.max(20000,parts[i].length*1200/rate));
  try{window.speechSynthesis.resume();window.speechSynthesis.speak(u);}catch{failed();}
 }next(0);
}
function playCard(letterOnly=false){
 const card=lessons[type][index],parts=window.MoyMirSpeech.cardParts(card,type,speechLang);
 if(language!=='ru'||type!=='letters'||recordingSet==='system'||recordingSet==='ready'){speak(letterOnly?parts.slice(0,1):parts);return;}
 stopSpeech();const generation=speechGeneration;
 const recording=window.MoyMirRecordings?.[recordingSet]?.[card.main];
 if(!recording){speak(letterOnly?parts.slice(0,1):parts);return;}
 recordingAudio=new Audio(recording.url);recordingAudio.playbackRate=1;
 $('#listen').disabled=true;letterButton.disabled=true;status.textContent='Слушаем запись: '+recordingSet;
 recordingAudio.onended=()=>{
  if(generation!==speechGeneration)return;clearTimeout(playbackWatchdog);
  if(!letterOnly&&parts.length>1){speechTimer=setTimeout(()=>{if(generation===speechGeneration)speak(parts.slice(1));},450);}
  else{status.textContent=text('finished');$('#listen').disabled=false;letterButton.disabled=false;}
 };
 const failed=()=>{if(generation!==speechGeneration)return;stopSpeech();status.textContent='Не удалось загрузить запись. Проверьте интернет или выберите голос устройства.';};
 playbackWatchdog=setTimeout(failed,20000);
 recordingAudio.onerror=failed;recordingAudio.play().catch(failed);
}
$('#listen').addEventListener('click',()=>playCard(false));
letterButton.addEventListener('click',()=>playCard(true));
$('#listen-parts').addEventListener('click',()=>speak(lessons[type][index].parts??[],true));
$('#stop-speech').addEventListener('click',()=>{stopSpeech();status.textContent=text('stopped');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
window.addEventListener('pagehide',stopSpeech);
document.querySelectorAll('[data-lesson]').forEach(a=>a.addEventListener('click',()=>selectType(a.dataset.lesson)));
document.querySelectorAll('.language-nav a').forEach(a=>{if(a.hreflang===language)a.setAttribute('aria-current','page');});
render();
