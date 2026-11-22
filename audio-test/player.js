const players=[...document.querySelectorAll('audio')];
const status=document.querySelector('#review-status');
function stop(player){player.pause();if(player.readyState>0)player.currentTime=0;}
function stopAll(){players.forEach(stop);status.textContent='Воспроизведение остановлено.';}
players.forEach(player=>{
 player.addEventListener('play',()=>{players.filter(other=>other!==player).forEach(stop);status.textContent='Слушаем: '+player.dataset.name;});
 player.addEventListener('ended',()=>{status.textContent='Можно послушать ещё раз или сравнить с другим набором.';});
 player.addEventListener('error',()=>{status.textContent='Не удалось воспроизвести '+player.dataset.name+'. Попробуйте другой набор или откройте оригинал записи.';});
});
document.querySelector('#stop-all').addEventListener('click',stopAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
window.addEventListener('pagehide',stopAll);
