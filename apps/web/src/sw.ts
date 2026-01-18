/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching"
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"
import { BackgroundSyncPlugin } from "workbox-background-sync"
import { registerRoute, NavigationRoute, Route } from "workbox-routing"
import { CacheableResponsePlugin } from "workbox-cacheable-response"

declare const self: ServiceWorkerGlobalScope

const CACHE_VERSION = new Date().toISOString().slice(0, 10).replace(/-/g, "")
const CACHE_NAMES = {
  APP_SHELL: `app-shell-v${CACHE_VERSION}`,
  DYNAMIC_CONTENT: `dynamic-content-v${CACHE_VERSION}`,
  API_RESPONSES: `api-responses-v${CACHE_VERSION}`,
  STATIC_ASSETS: `static-assets-v${CACHE_VERSION}`,
}

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  const cacheNames = Object.values(CACHE_NAMES)
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!cacheNames.includes(key)) {
            return caches.delete(key)
          }
          return Promise.resolve()
        })
      )
    )
  )
})

precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

const bgSyncPlugin = new BackgroundSyncPlugin("catalog-sync-queue", {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry: Awaited<ReturnType<typeof queue.shiftRequest>> | undefined
    while (true) {
      entry = await queue.shiftRequest()
      if (!entry) break
      try {
        await fetch(entry.request)
      } catch {
        await queue.unshiftRequest(entry)
        throw new Error("Sync failed, request re-queued")
      }
    }
  },
})

const cacheStrategyOptions = {
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
}

registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.mode === "cors",
  new CacheFirst({
    cacheName: CACHE_NAMES.APP_SHELL,
    ...cacheStrategyOptions,
    plugins: [
      ...cacheStrategyOptions.plugins,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
)

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: CACHE_NAMES.STATIC_ASSETS,
    ...cacheStrategyOptions,
    plugins: [
      ...cacheStrategyOptions.plugins,
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
)

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.API_RESPONSES,
    ...cacheStrategyOptions,
    plugins: [
      ...cacheStrategyOptions.plugins,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 5,
      }),
    ],
  })
)

const navigationHandler = new NetworkFirst({
  cacheName: CACHE_NAMES.DYNAMIC_CONTENT,
  ...cacheStrategyOptions,
  networkTimeoutSeconds: 3,
  plugins: [
    ...cacheStrategyOptions.plugins,
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24,
    }),
  ],
})

const navigationRoute = new NavigationRoute(navigationHandler, {
  allowlist: [/^\/(settings|about)?$/],
  denylist: [/\/api\//],
})

registerRoute(navigationRoute)

const offlineFallbackRoute = new Route(
  ({ request }) => request.mode === "navigate",
  async ({ request }) => {
    try {
      const response = await fetch(request)
      return response
    } catch {
      const cache = await caches.open(CACHE_NAMES.DYNAMIC_CONTENT)
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      const offlineResponse = await caches.match("/offline.html")
      return offlineResponse || new Response("Offline", { status: 503 })
    }
  }
)

registerRoute(offlineFallbackRoute)

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

export {}
