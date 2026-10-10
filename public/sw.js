/* B3Matika Service Worker — v2.0
   Strategi: Network-first untuk API, Cache-first untuk aset statis.
   Tidak meng-cache data sensitif (auth, chat, supabase).
   v2.0: dinaikkan versi agar aset baru dipakai setelah deploy
*/

const CACHE_NAME = 'b3matika-v2';
const OFFLINE_URL = '/';

// Aset yang penting untuk offline shell
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/images/icon-192.png',
];

// ─── Install: pre-cache shell ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate: hapus cache lama ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: strategi per jenis request ───────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan intercept non-GET
  if (request.method !== 'GET') return;

  // Jangan intercept API, Supabase, atau eksternal
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  // Untuk navigasi (HTML) → network-first, fallback ke offline shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Untuk aset statis (JS, CSS, font, gambar) → cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Hanya cache response yang valid
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
