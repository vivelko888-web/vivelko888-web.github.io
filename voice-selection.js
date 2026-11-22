(function(root){
 function normalise(tag){return String(tag??'').replaceAll('_','-').toLowerCase();}
 function matchingVoices(voices,language,policy='language'){
  const target=normalise(language);
  const exact=voices.filter(voice=>normalise(voice.lang)===target);
  if(exact.length||policy==='exact')return exact;
  const base=target.split('-')[0];
  return voices.filter(voice=>normalise(voice.lang).split('-')[0]===base);
 }
 function selectVoice(voices,language,policy='language',preferred=''){
  const matching=matchingVoices(voices,language,policy);
  const chosen=matching.find(v=>(v.voiceURI||v.name)===preferred);
  if(chosen)return chosen;
  // Prefer explicitly labelled natural/neural voices, within the correct locale.
  return matching.find(v=>/natural|neural/i.test(v.name??''))??matching[0];
 }
 const russianNames=['а','бэ','вэ','гэ','дэ','е','ё','жэ','зэ','и','и краткое','ка','эль','эм','эн','о','пэ','эр','эс','тэ','у','эф','ха','цэ','че','ша','ща','твёрдый знак','ы','мягкий знак','э','ю','я'];
 const russianAlphabet=[...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'];
 const letterNames={
  de:['a','be','ce','de','e','ef','ge','ha','i','jot','ka','el','em','en','o','pe','ku','er','es','te','u','vau','we','iks','ypsilon','zett'],
  it:['a','bi','ci','di','e','effe','gi','acca','i','i lunga','cappa','elle','emme','enne','o','pi','cu','erre','esse','ti','u','vu','doppia vu','ics','ipsilon','zeta'],
  fr:['a','bé','cé','dé','e','effe','gé','ache','i','ji','ka','elle','emme','enne','o','pé','cu','erre','esse','té','u','vé','double vé','ixe','i grec','zède'],
  es:['a','be','ce','de','e','efe','ge','hache','i','jota','ka','ele','eme','ene','o','pe','cu','erre','ese','te','u','uve','uve doble','equis','ye','zeta'],
  pt:['á','bê','cê','dê','é','efe','gê','agá','i','jota','capa','ele','eme','ene','ó','pê','quê','erre','esse','tê','u','vê','dáblio','xis','ípsilon','zê'],
  pl:['a','be','ce','de','e','ef','gie','ha','i','jot','ka','el','em','en','o','pe','ku','er','es','te','u','fał','wu','iks','igrek','zet'],
 };
 const extraNames={de:{'Ä':'ä','Ö':'ö','Ü':'ü','ß':'Eszett'},es:{'Ñ':'eñe'},pl:{'Ą':'ą','Ć':'ć','Ę':'ę','Ł':'eł','Ń':'ń','Ó':'u kreskowane','Ś':'ś','Ź':'ź','Ż':'ż'}};
 const prefixes={ru:'Буква',en:'Letter',de:'Buchstabe',it:'Lettera',fr:'Lettre',es:'Letra',pt:'Letra',pl:'Litera'};
 function cardParts(card,type,language){
  if(type!=='letters')return [card.say];
  const position=russianAlphabet.indexOf(card.main);
  const base=normalise(language).split('-')[0];
  const latinPosition='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(card.main);
  const letter=base==='ru'&&position>=0?russianNames[position]
   :extraNames[base]?.[card.main]??(latinPosition>=0?letterNames[base]?.[latinPosition]:undefined)??card.main;
  const spokenLetter=letter;
  return card.word&&normalise(card.word)!==normalise(letter)?[spokenLetter,card.word]:[spokenLetter];
 }
 if(root)root.MoyMirSpeech={selectVoice,matchingVoices,cardParts};
 if(typeof module!=='undefined'&&module.exports)module.exports={selectVoice,matchingVoices,cardParts};
})(typeof window==='undefined'?undefined:window);
