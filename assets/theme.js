
(function(){
  const root = document.documentElement;
  const key = "hfb-theme";
  const btn = document.getElementById("hfbThemeSwitch");
  const label = document.getElementById("hfbThemeLabel");

  function apply(mode){
    root.setAttribute("data-theme", mode);
    if(btn){ btn.classList.toggle("on", mode==="dim"); }
    if(label){ label.textContent = mode==="dim" ? "Dim" : "Dark"; }
    localStorage.setItem(key, mode);
  }

  const saved = localStorage.getItem(key) || "dark";
  apply(saved);

  if(btn){
    btn.addEventListener("click", ()=> {
      const next = (root.getAttribute("data-theme")==="dark" ? "dim" : "dark");
      apply(next);
    });
  }
})();
