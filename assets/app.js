
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('hfb-theme');
  if(saved==='dim') root.classList.add('dim');
  window.hfbToggleTheme=function(){
    const isDim=root.classList.contains('dim');
    root.classList.toggle('dim', !isDim);
    localStorage.setItem('hfb-theme', !isDim ? 'dim' : 'dark');
    document.getElementById('theme-label')?.replaceChildren(!isDim ? 'Dim' : 'Dark');
  };
  window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('theme-label')?.replaceChildren(root.classList.contains('dim') ? 'Dim' : 'Dark');
  });
})();
