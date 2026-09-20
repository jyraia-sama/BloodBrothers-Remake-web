// ============================================================
//  SERVICE WORKER — Brothers of Legacy: Tears and Blood
//  Stratégie "cache d'abord, réseau en secours" : chaque fichier
//  chargé (HTML, JS, images) est mis en cache automatiquement au
//  premier chargement, puis servi depuis le cache ensuite (rapide,
//  fonctionne hors-ligne). Un nouveau CACHE_VERSION force la mise
//  à jour du cache au prochain déploiement.
// ============================================================

const CACHE_VERSION = 'bol-cache-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ne met en cache que les requêtes GET du même site (pas les CDN externes,
  // ni les appels API) — évite de mettre en cache des réponses inattendues.
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Ne met en cache que les réponses valides et de même origine
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Hors-ligne et pas en cache : sur une navigation, retombe sur la page d'accueil
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});