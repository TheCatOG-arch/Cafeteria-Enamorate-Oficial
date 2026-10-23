// Service Worker mínimo
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // Un manejador de fetch vacío es requerido por Chrome Android
});
