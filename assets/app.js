
(function(){
  const yEl = document.getElementById("year");
  if(yEl){ yEl.textContent = new Date().getFullYear(); }

  // make logo/title click go home
  const homeLinks = document.querySelectorAll('.home-link');
  homeLinks.forEach(a => a.addEventListener('click', function(ev){
    if(location.pathname.endsWith('index.html')) return;
    // go to root index.html
    window.location.href = 'index.html';
  }));
})();
