
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('hfb-theme');
  if(saved==='light') root.classList.add('light');
  if(saved==='dark')  root.classList.add('dark');
  window.hfbToggleTheme=function(){
    const isLight=root.classList.contains('light');
    root.classList.remove('light','dark');
    root.classList.add(isLight?'dark':'light');
    localStorage.setItem('hfb-theme', isLight?'dark':'light');
    document.getElementById('theme-label')?.replaceChildren(root.classList.contains('light') ? '🌞' : '🌙');
  };
  window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('theme-label')?.replaceChildren(root.classList.contains('light') ? '🌞' : '🌙');
  });
  window.hfbLoadMarkdown = async function(id, url){
    try{
      const res = await fetch(url); const txt = await res.text();
      const html = txt
        .replace(/^### (.*$)/gim,'<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim,  '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim,'<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim,  '<em>$1</em>')
        .replace(/^\- (.*$)/gim,'<li>$1</li>')
        .replace(/\n\n/g,'</p><p>');
      const body = '<p>'+html.replace(/(<li>.*<\/li>)/gms,'<ul>$1</ul>')+'</p>';
      document.getElementById(id).innerHTML = body;
    }catch(e){
      document.getElementById(id).innerHTML = '<p style="opacity:.7">Content unavailable.</p>';
    }
  }
})();
