self.addEventListener('install',e=>{
  e.waitUntil(caches.open('hfb-RF-519_ConsciousLaunch').then(c=>c.addAll([
    '/index.html','/investor.html','/product.html','/about.html',
    '/press-kit.html','/docs-eight-leagues.html','/privacy.html','/routines.html',
    '/assets/styles.css','/assets/app.js','/assets/logo.png','/assets/logo@512.png','/assets/logo@1024.png','/assets/conscious_core.png'
  ])));
});
self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); });