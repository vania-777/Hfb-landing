
(function(){
  const v='524';
  function addCSSOnce(href){
    if([...(document.querySelectorAll('link[rel="stylesheet"]'))].some(l=>String(l.href).includes('styles.patch.css'))) return;
    const l=document.createElement('link'); l.rel='stylesheet'; l.href=href+(href.includes('?')?'&':'?')+'v='+v; document.head.appendChild(l);
  }
  addCSSOnce('assets/styles.patch.css');
  const desired1x='assets/logo-hfb-original@1x.png';
  const desired2x='assets/logo-hfb-original@2x.png';
  const logo=document.querySelector('.header .brand img')||document.querySelector('img[alt*=HFB]')||document.querySelector('img.logo');
  if(logo){
    if(!/logo-hfb-original@1x\.png/.test(logo.src)){ logo.src=desired1x+'?v='+v; }
    logo.srcset=desired1x+' 1x, '+desired2x+' 2x';
    logo.alt='HFB logo';
  }
})();