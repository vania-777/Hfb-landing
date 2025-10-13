
(function(){
 const root=document.documentElement;
 const saved=localStorage.getItem('hfb-theme');
 if(saved==='bright') root.classList.add('bright');
 function label(){ return root.classList.contains('bright') ? 'Bright' : 'Dark';}
 function setLabel(){ var el=document.getElementById('theme-label'); if(el) el.textContent=label(); }
 window.hfbToggleTheme=function(){
   var b=root.classList.contains('bright'); root.classList.toggle('bright', !b);
   localStorage.setItem('hfb-theme', !b ? 'bright':'dark'); setLabel();
 };
 window.addEventListener('DOMContentLoaded', function(){
   setLabel(); if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js'); }
 });
})();
