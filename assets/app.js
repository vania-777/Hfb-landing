
(function(){
  const root=document.documentElement;
  // load saved preference
  const saved=localStorage.getItem('hfb-theme');
  if(saved==='bright') root.classList.add('bright'); else root.classList.remove('bright');
  const label=()=> root.classList.contains('bright') ? 'Bright' : 'Dark';

  function setLabel(){
    const el=document.getElementById('theme-label');
    if(el) el.textContent=label();
  }
  window.hfbToggleTheme=function(){
    const isBright=root.classList.contains('bright');
    root.classList.toggle('bright', !isBright);
    localStorage.setItem('hfb-theme', !isBright ? 'bright' : 'dark');
    setLabel();
  };
  window.addEventListener('DOMContentLoaded', setLabel);
})();
