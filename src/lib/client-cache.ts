'use client'

/**
 * Module-level in-memory cache for client-side GET fetch calls.
 * Persists across React re-renders and page navigations within the same session.
 * Keys are the full URL string. Cache entries expire after `ttlMs`.
 */

interface CacheEntry {
  data: unknown
  exp: number
}

const _cache = new Map<string, CacheEntry>()

const DEFAULT_TTL = 60_000 // 60 seconds

/** Return cached data if fresh, otherwise null */
export function getCached<T>(url: string): T | null {
  const entry = _cache.get(url)
  if (entry && entry.exp > Date.now()) return entry.data as T
  return null
}

/** Store data in cache */
export function setCached(url: string, data: unknown, ttlMs = DEFAULT_TTL): void {
  _cache.set(url, { data, exp: Date.now() + ttlMs })
}

/** Remove cache entries matching a URL pattern */
export function invalidateCache(urlPattern: string): void {
  for (const key of _cache.keys()) {
    if (key.includes(urlPattern)) _cache.delete(key)
  }
}

/**
 * Fetch wrapper with stale-while-revalidate semantics.
 * - First call: shows nothing while fetching
 * - Subsequent calls: returns stale data INSTANTLY, refetches in background
 */
export async function cachedFetch(
  url: string,
  options?: RequestInit,
  ttlMs = DEFAULT_TTL
): Promise<{ data: unknown; fromCache: boolean }> {
  const cached = getCached<unknown>(url)

  if (cached !== null) {
    // Serve from cache immediately, refresh in background
    fetch(url, options)
      .then((r) => r.ok ? r.json() : null)
      .then((fresh) => { if (fresh !== null) setCached(url, fresh, ttlMs) })
      .catch(() => {})
    return { data: cached, fromCache: true }
  }

  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  setCached(url, data, ttlMs)
  return { data, fromCache: false }
}
