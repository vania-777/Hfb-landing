
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('hfb-theme');
  if(saved==='light') root.classList.add('light');
  if(saved==='dark')  root.classList.add('dark');
  function setTheme(mode){
    root.classList.remove('light','dark');
    if(mode) root.classList.add(mode);
    localStorage.setItem('hfb-theme', mode||'');
    document.getElementById('theme-label')?.replaceChildren(document.documentElement.classList.contains('light')?'🌞':'🌙');
  }
  window.hfbToggleTheme = function(){
    const isLight = root.classList.contains('light');
    setTheme(isLight? 'dark':'light');
  };
  // init label
  window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('theme-label')?.replaceChildren(root.classList.contains('light')?'🌞':'🌙');
  });
})();
