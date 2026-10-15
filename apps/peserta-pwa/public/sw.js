/*
 * Service worker sengaja minimal: hanya agar aplikasi dapat dipasang dan cangkangnya (HTML/JS/CSS/ikon)
 * tetap terbuka saat offline. Data kegiatan, jadwal, pengumuman, dan lokasi TIDAK pernah di-cache di sini
 * (permintaan ke Supabase dan tile peta selalu langsung ke jaringan), sehingga informasi lama tidak
 * tampak seperti terbaru. Naikkan VERSION untuk membersihkan cache lama.
 */
const VERSION = 'fg-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.png', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, tile peta: langsung jaringan

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/')));
    return;
  }
  // Aset statis berhash dari Vite: cache-first, aman karena nama file berubah tiap build.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/buses/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
