const CACHE = 'lukiva-v1';
const STATIC_SHELL = ['/manifest.json', '/icons/icon-192x192.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC_SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) return;
  // No interceptar API routes ni Supabase
  if (url.pathname.startsWith('/api/')) return;

  // Assets estáticos de Next.js: cache-first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // Navegación: network-first, fallback a caché
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request) || caches.match('/dashboard'))
    );
  }
});

// Recibir notificación push y mostrarla
self.addEventListener('push', (e) => {
  if (!e.data) return;
  let payload;
  try {
    payload = e.data.json();
  } catch {
    payload = { title: 'Lukiva', body: e.data.text(), url: '/dashboard' };
  }
  const { title = 'Lukiva', body = '', url = '/dashboard', tag } = payload;
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: tag || 'lukiva-default',
      renotify: true,
      data: { url },
      vibrate: [200, 100, 200],
    })
  );
});

// Al tocar la notificación: abrir o enfocar la app en la URL indicada
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.url || '/dashboard';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      const existing = cs.find((c) => c.url.includes(location.origin));
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return clients.openWindow(target);
    })
  );
});
