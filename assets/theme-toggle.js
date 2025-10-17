
/*! HFB Tri-Theme Toggle — cycles: dark -> dim -> light */
(function(){
  const KEY = 'hfb_theme_v3';
  const order = ['dark','dim','light'];
  function apply(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const label = document.querySelector('.hfb-theme-toggle .label');
    if (label) label.textContent = theme.toUpperCase();
  }
  function next(theme){ const i = order.indexOf(theme); return order[(i+1) % order.length]; }
  const initial = localStorage.getItem(KEY) || 'dark'; apply(initial);
  document.addEventListener('click', function(e){
    const pill = e.target.closest('.hfb-theme-toggle'); if (!pill) return;
    const cur = localStorage.getItem(KEY) || 'dark'; apply(next(cur));
  }, {passive:true});
  window.hfbSetTheme = apply;
})();
