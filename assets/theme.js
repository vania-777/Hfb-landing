
/* HFB RF-521 — Theme + Header link + persistence */
(function(){
  const body = document.body;
  const saved = localStorage.getItem('hfb-theme');
  if(saved === 'calm'){ body.classList.add('theme-calm'); document.documentElement.classList.add('theme-calm'); }
  window.hfbToggleTheme = function(){
    const calm = body.classList.toggle('theme-calm');
    document.documentElement.classList.toggle('theme-calm', calm);
    localStorage.setItem('hfb-theme', calm ? 'calm' : 'dark');
  };
  // Make logo/title anchor clickable to index
  const brand = document.querySelector('.brand');
  if(brand){ brand.setAttribute('href', 'index.html'); }
})();
