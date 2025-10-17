/* HFB RF-521a — assets/app.patch.js */ 
(function(){
  try{
    var header=document.querySelector('.header')||document.querySelector('header');
    var logoImg= header? header.querySelector('img[src*="logo"]'): document.querySelector('img.logo');
    if(!logoImg){ logoImg=document.createElement('img'); logoImg.src='assets/logo-hfb-original@1x.png?v=RF-521a'; logoImg.alt='HFB logo'; logoImg.className='logo'; if(header) header.insertBefore(logoImg, header.firstChild);}
    else{ var src='assets/logo-hfb-original@1x.png?v=RF-521a'; if(!/logo-hfb-original@1x\.png/.test(logoImg.src)) logoImg.src=src; logoImg.alt=logoImg.alt||'HFB logo'; }
    if(logoImg && (!logoImg.parentElement || logoImg.parentElement.tagName.toLowerCase()!=='a')){ var a=document.createElement('a'); a.href='index.html'; a.className='logo'; logoImg.parentNode.insertBefore(a, logoImg); a.appendChild(logoImg); }
    var cc=document.querySelector('img[src*="conscious_core"], img#conscious_core'); 
    if(cc && !cc.parentElement.classList.contains('cc-wrap')){ var wrap=document.createElement('div'); wrap.className='cc-wrap'; cc.parentNode.insertBefore(wrap, cc); wrap.appendChild(cc); }
  }catch(e){}
})();