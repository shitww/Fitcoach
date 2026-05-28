// XFITX Service Worker — Phase 4 (Silent Auto-Update)
// Strategy: Cache-First (static), Stale-While-Revalidate (assets), Network-First (pages)
// Strictly NO caching of API routes, auth, or user data.
// New: install → skipWaiting immediately → clientsClaim on activate.

const CACHE_NAME = 'xfitx-sw-v3'

// Dev safety:
// Service Workers are scoped per-origin. If you ever ran a production build on
// http://localhost:3000, the SW can keep controlling pages when you later run
// `next dev` on the same origin and serve stale cached /_next/static assets.
//
// That commonly manifests as cryptic webpack runtime errors like:
// "Cannot read properties of undefined (reading 'call')".
//
// To prevent dev breakage, we completely bypass SW caching on localhost/127.
const DEV_HOSTS = new Set(['localhost', '127.0.0.1'])

// Resources that must be available offline from the very first SW activation.
// Keep this list minimal — only truly static files with stable URLs.
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.webmanifest',
]

// Maximum number of unique HTML page responses to keep cached.
// Oldest entries are evicted once this limit is exceeded.
const HTML_CACHE_MAX = 20

// ─── Install ───────────────────────────────────────────────────────────────
// Auto-activate: new SW takes over immediately. No user action required.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ─── Message ───────────────────────────────────────────────────────────────
// Legacy: still accept SKIP_WAITING from any old client code.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all open clients without requiring a reload
      self.clients.claim(),
      // Delete any outdated cache versions
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  )
})

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never interfere with local development.
  if (DEV_HOSTS.has(url.hostname)) return

  // PASSTHROUGH — never cache these:
  //  · Non-GET requests (POST, PUT, DELETE, etc.)
  //  · All API routes (/api/*)
  //  · Next.js image optimizer (/_next/image)
  //  · Any cross-origin request that is not a font CDN
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/image') ||
    (url.origin !== self.location.origin &&
      url.hostname !== 'fonts.googleapis.com' &&
      url.hostname !== 'fonts.gstatic.com')
  ) {
    return
  }

  // CACHE FIRST — Next.js immutable static chunks (content-hashed filenames)
  // These never change at the same URL, so serving from cache is always correct.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // STALE-WHILE-REVALIDATE — app icon, manifest, and Google Fonts
  // Serve from cache immediately; refresh in the background.
  if (
    url.pathname === '/icon' ||
    url.pathname === '/apple-icon' ||
    url.pathname.startsWith('/icons/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // NETWORK FIRST — HTML pages
  // Always try the network so users see fresh server-rendered content.
  // Fall back to the cached version only when offline.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Everything else: let the browser handle it normally.
})

// ─── Strategy helpers ──────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  })

  return cached ?? fetchPromise
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
      // Evict old HTML entries to prevent unbounded cache growth (fire-and-forget)
      trimHTMLCache(cache)
    }
    return response
  } catch {
    // 1. Try the previously cached version of this exact page
    const cached = await cache.match(request)
    if (cached) return cached
    // 2. Last resort: serve the pre-cached offline fallback page
    const offline = await cache.match('/offline.html')
    return offline ?? Response.error()
  }
}

// Evict the oldest HTML page cache entries once count exceeds HTML_CACHE_MAX.
// Skips /_next/static/ assets, offline.html, and manifest (those are managed separately).
async function trimHTMLCache(cache) {
  const keys = await cache.keys()
  const htmlKeys = keys.filter((req) => {
    const { pathname } = new URL(req.url)
    return (
      !pathname.startsWith('/_next/') &&
      pathname !== '/offline.html' &&
      !pathname.endsWith('.webmanifest')
    )
  })
  if (htmlKeys.length > HTML_CACHE_MAX) {
    // cache.keys() returns entries in insertion order — delete from the front
    const toDelete = htmlKeys.slice(0, htmlKeys.length - HTML_CACHE_MAX)
    await Promise.all(toDelete.map((k) => cache.delete(k)))
  }
}
