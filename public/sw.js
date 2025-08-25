/* eslint-disable no-restricted-globals */
// Minimal service worker with stale-while-revalidate strategy and offline fallback

const PRECACHE = 'precache-v1'
const RUNTIME = 'runtime'
const PRECACHE_URLS = [
  '/',
  '/favicon.ico',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE, RUNTIME]
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // App-shell style navigation fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(async () => {
          const cache = await caches.open(PRECACHE)
          const offlineResponse = await cache.match('/offline')
          return offlineResponse || Response.error()
        })
    )
    return
  }

  // Stale-while-revalidate for other GET requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(RUNTIME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => cachedResponse)

      return cachedResponse || networkFetch
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

