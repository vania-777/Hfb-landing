(function(){
  const root=document.documentElement;
  const KEY='hfb-theme';
  const btn=document.querySelector('[data-toggle-theme]');
  const titleLink=document.querySelector('[data-home-link]');
  const stored=localStorage.getItem(KEY);
  if(stored){root.setAttribute('data-theme',stored);}
  else if(window.matchMedia('(prefers-color-scheme: light)').matches){root.setAttribute('data-theme','light');}
  else{root.setAttribute('data-theme','dark');}
  if(btn){btn.addEventListener('click',function(){const next=(root.getAttribute('data-theme')==='light')?'dark':'light';root.setAttribute('data-theme',next);localStorage.setItem(KEY,next);});}
  if(titleLink){titleLink.addEventListener('click',function(e){window.location.href='index.html';});}
})();