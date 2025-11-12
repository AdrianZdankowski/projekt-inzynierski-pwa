/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
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

// cache dla statycznych plików html/js/css
registerRoute(
  ({ request }) => ['script', 'style', 'document'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dni
      }),
    ],
  })
)

// cache listy plików
registerRoute(
  ({ url }) =>
    url.pathname === '/api/file' ||
    (url.pathname === '/api/file' && url.search.length > 0),
  new NetworkFirst({
    cacheName: 'file-list-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 10 * 60, // 10 minut
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET'
)


// cache pojedynczego pliku
registerRoute(
  ({ url }) => /^\/api\/file\/[^/]+$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'file-metadata-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 dzień
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET'
)

// cache SAS URL z Azure Blob Storage
registerRoute(
  ({ url, request }) => url.origin.includes('blob.core.windows.net') 
  && request.destination === 'image',
  new CacheFirst({
    cacheName: 'azure-blob-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 25, // 25 minut
      }),
    ],
  }),
  'GET'
)

// /** @type {RegExp[] | undefined} */
// let allowlist : undefined | RegExp[]
// // in dev mode, we disable precaching to avoid caching issues
// if (import.meta.env.DEV)
//   allowlist = [/^\/$/]

// // to allow work offline
// registerRoute(new NavigationRoute(
//   createHandlerBoundToURL('index.html'),
//   { allowlist },
// ))
