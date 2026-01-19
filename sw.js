const CACHE_NAME = 'konta-v4';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './add.html',
  './detail.html',
  './calendar.html',
  './style.css',
  './app.js',
  './dashboard.js',
  './add.js',
  './detail.js',
  './calendar.js',
  './icon-192.png',
  './icon-512.png'
];

// Instalación: Guardamos archivos y FORZAMOS la espera
self.addEventListener('install', (e) => {
  // ESTA LÍNEA ES NUEVA: Obliga al SW a activarse ya, sin esperar a que cierres la app
  self.skipWaiting(); 
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Instalación: Guardamos los archivos en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch: Intentamos servir desde caché, si no, vamos a la red
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
