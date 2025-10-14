
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('hfb-theme');
  if(saved==='bright') root.classList.add('bright');
  function label(){ return root.classList.contains('bright') ? 'Bright' : 'Dark'; }
  function setLabel(){ const el=document.getElementById('theme-label'); if(el) el.textContent=label(); }
  window.hfbToggleTheme=function(){
    const b=root.classList.contains('bright');
    root.classList.toggle('bright', !b);
    localStorage.setItem('hfb-theme', !b ? 'bright':'dark');
    setLabel();
  };

  function softNav(href){
    document.body.classList.add('fade-out');
    setTimeout(()=>{ window.location.href = href; }, 160);
  }
  window.addEventListener('DOMContentLoaded', ()=>{
    setLabel();
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js'); }
    document.querySelectorAll('a[data-soft="1"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const url = a.getAttribute('href');
        if(url && url.indexOf('http')!==0){
          e.preventDefault(); softNav(url);
        }
      });
    });
  });
})();
