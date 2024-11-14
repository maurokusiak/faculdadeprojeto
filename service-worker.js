self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open('cupcake-store')
      .then((cache) =>
        cache.addAll([
          '/',
          '/index.html',
          '/styles.css',
          '/script.js',
          '/cupcake-icon.png',
        ])
      )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
