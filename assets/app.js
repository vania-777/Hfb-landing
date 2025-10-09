
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('hfb-theme');
  if(saved==='dim') root.classList.add('dim'); else root.classList.remove('dim');
  const label=()=> root.classList.contains('dim') ? 'Dim' : 'Dark';
  window.hfbToggleTheme=function(){
    const isDim=root.classList.contains('dim');
    root.classList.toggle('dim', !isDim);
    localStorage.setItem('hfb-theme', !isDim ? 'dim' : 'dark');
    const el=document.getElementById('theme-label'); if(el) el.textContent=label();
  };
  window.addEventListener('DOMContentLoaded',()=>{
    const el=document.getElementById('theme-label'); if(el) el.textContent=label();
  });
})();
