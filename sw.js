// ============================================================
// Service Worker — Gemini Chat PWA
// ============================================================
const CACHE_NAME = 'gemini-chat-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// نصب و کش کردن
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching assets...');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// استراتژی: Network First, Cache Fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // رد کردن درخواست‌های API
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // رد کردن درخواست‌های analytics
  if (url.hostname.includes('analytics')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // فقط پاسخ‌های موفق رو کش کن
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // آفلاین: از کش بخون
        return caches.match(event.request)
          .then(cached => {
            if (cached) {
              return cached;
            }
            // اگر هیچی نبود، صفحه اصلی رو برگردون
            return caches.match('/index.html');
          });
      })
  );
});

// مدیریت نوتیفیکیشن‌ها (برای آینده)
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || 'New message from Gemini Chat',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Gemini Chat', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
