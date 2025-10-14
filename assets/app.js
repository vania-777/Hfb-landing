
// HFB Theme Controller — RF-520.4 Calm Sky
(() => {
  const KEY = "hfb-theme";
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;

  function apply(theme){
    root.classList.remove('theme-calm','theme-dark');
    root.classList.add(theme);
    try{ localStorage.setItem(KEY, theme); }catch(e){}
    // Update button label if present
    const btn = document.getElementById('themeToggleBtn');
    if(btn){
      btn.textContent = (theme === 'theme-dark') ? 'Light' : 'Dark';
      btn.setAttribute('aria-pressed', theme !== 'theme-dark');
      btn.title = (theme === 'theme-dark') ? 'Switch to lighter theme' : 'Switch to dark theme';
    }
  }

  function current(){
    try{
      const v = localStorage.getItem(KEY);
      if(v) return v;
    }catch(e){}
    return prefersDark ? 'theme-dark' : 'theme-calm';
  }

  // On load
  apply(current());

  // Wire button if exists
  window.hfbToggleTheme = function(){
    apply(root.classList.contains('theme-dark') ? 'theme-calm' : 'theme-dark');
  };
})();
