
(function(){
  const key = 'hfb-theme';
  const saved = localStorage.getItem(key);
  const root = document.documentElement;
  if(saved){ root.setAttribute('data-theme', saved); }
  else { root.setAttribute('data-theme','dark'); }

  const sw = document.querySelector('.switch');
  if(sw){
    sw.addEventListener('click', () => {
      const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', t);
      localStorage.setItem(key, t);
    });
  }

  // simple soft back-to-home for anchors with data-soft
  document.body.addEventListener('click', (e)=>{
    const a = e.target.closest('a[data-soft="1"]');
    if(a){
      e.preventDefault();
      window.location.href = a.getAttribute('href');
    }
  });
})();
