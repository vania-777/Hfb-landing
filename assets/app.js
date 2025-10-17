
(function(){
  const root=document.documentElement;
  function setTheme(t){ root.setAttribute('data-theme',t); localStorage.setItem('hfb_theme',t);
    const l=document.getElementById('theme-label'); if(l) l.textContent=(t==='dark'?'Dark':'Light'); }
  window.hfbToggleTheme=function(){ const cur=localStorage.getItem('hfb_theme')||'dark'; setTheme(cur==='dark'?'light':'dark'); };
  setTheme(localStorage.getItem('hfb_theme')||'dark');
})();