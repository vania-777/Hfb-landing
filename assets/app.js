
(function(){
  // Theme persistence
  const root = document.documentElement;
  const key = 'hfb-theme';
  function applyTheme(t){ root.classList.toggle('light', t==='light'); localStorage.setItem(key,t); }
  const saved = localStorage.getItem(key) || 'dark';
  applyTheme(saved);
  const sw = document.querySelector('.switch'); if(sw){ sw.addEventListener('click', ()=>applyTheme(root.classList.contains('light')?'dark':'light')); }

  // Soft back links
  document.querySelectorAll('a[data-soft="1"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')) return;
      a.style.opacity = .6;
    });
  });
})();
