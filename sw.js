const CACHE_NAME = 'tools-v1.1';
const urlsToCache = [
  '/',
  '/tools/index.html',
  '/tools/tools/clock.html',
  '/tools/tools/schedule.html',
  '/tools/tools/schedule.css',
  '/tools/tools/schedule.js',
  '/tools/tools/todo.html',
  '/tools/tools/todo.js',
  '/tools/icon.svg',
  '/tools/manifest.json'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 获取事件 - 拦截网络请求并使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到响应，则返回缓存的资源
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});