
// Simplified investor-pro script
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
  document.querySelectorAll('[data-key]').forEach(btn => {
    btn.addEventListener('click', ()=>alert('Coming soon'));
  });
});
