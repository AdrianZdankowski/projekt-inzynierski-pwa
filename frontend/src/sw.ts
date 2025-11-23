/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

// cache tras React Router
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /\/assets\//],
})

registerRoute(navigationRoute)

// cache listy plików
registerRoute(
  ({ url }) => url.pathname === '/api/file',
  new NetworkFirst({
    cacheName: 'file-list-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20, 
        maxAgeSeconds: 60 * 5, // 5 minut
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET'
)


// cache pojedynczego pliku - metadata z SAS URL 
registerRoute(
  ({ url }) => /^\/api\/file\/[^\/]+$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'file-metadata-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 30, // czas życia SAS URL
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET'
)

// cache plików z Azure Blob Storage (obrazy, dokumenty, PDF)
// Używa pathname jako klucza cache (bez SAS query params) żeby unikać duplikatów
registerRoute(
  ({ url }) => url.origin.includes('blob.core.windows.net'),
  new CacheFirst({
    cacheName: 'azure-blob-files',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24h
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // 0 = opaque (bez CORS)
      }),
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          const url = new URL(request.url);
          return new Request(url.origin + url.pathname, request);
        },
      },
    ],
  }),
  'GET'
)
