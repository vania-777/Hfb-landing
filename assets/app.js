(function(){
  const KEY='hfb:theme'; const root=document.documentElement;
  root.setAttribute('data-theme', localStorage.getItem(KEY)||'dark');
  function setLabel(){ const el=document.getElementById('theme-label'); if(!el) return; const t=root.getAttribute('data-theme'); el.textContent=t[0].toUpperCase()+t.slice(1); }
  window.hfbToggleTheme=function(){ const t=root.getAttribute('data-theme'); const next=t==='dark'?'dim':(t==='dim'?'light':'dark'); root.setAttribute('data-theme',next); localStorage.setItem(KEY,next); setLabel(); };
  document.addEventListener('DOMContentLoaded',()=>{ setLabel(); const goHome=()=>location.href='index.html?v=RF-521'; document.querySelectorAll('.logo-wrap,.title').forEach(n=>n.addEventListener('click',goHome)); });
})();