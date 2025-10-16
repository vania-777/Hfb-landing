/* HFB RF-530 — Theme + Reveal */
(function(){
  const root=document.documentElement, KEY='hfb-theme';
  const saved=localStorage.getItem(KEY)||'dark';
  if(saved==='dim') root.setAttribute('data-theme','dim');
  const btn=document.getElementById('hfbToggleTheme');
  if(btn){ btn.addEventListener('click',()=>{
    const next=root.getAttribute('data-theme')==='dim'?'dark':'dim';
    if(next==='dim') root.setAttribute('data-theme','dim'); else root.removeAttribute('data-theme');
    localStorage.setItem(KEY,next);
  });}
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show');});},{threshold:.2});
  document.querySelectorAll('.milestone').forEach(el=>io.observe(el));
})();