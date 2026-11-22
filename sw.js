// Service worker: shows phone notifications sent by the server and opens the right screen on tap.
// Nothing is cached — the app always loads fresh.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'HR', {
    body: data.body || '', tag: data.tag, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: data.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin);
  if (url.origin !== self.location.origin) return;                 // only ever open the app itself
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const tab of tabs) if (new URL(tab.url).origin === url.origin) { await tab.navigate(url.href).catch(() => {}); return tab.focus(); }
    return self.clients.openWindow(url.href);
  })());
});
