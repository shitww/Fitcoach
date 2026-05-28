'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Two-layer cache:
 *  L1 – module-level Map (lives for the JS session, survives React re-renders)
 *  L2 – localStorage (survives page reloads / cold navigations)
 *
 * This gives instant render on first mount even after a full page reload.
 */

interface CacheEntry {
  data: unknown
  exp: number
}

const _mem = new Map<string, CacheEntry>()
const DEFAULT_TTL = 60_000          // 60 s in-memory
const LS_TTL      = 10 * 60_000     // 10 min localStorage
const LS_PREFIX   = 'fc_cache:'

// ── L2 helpers ────────────────────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (entry.exp > Date.now()) return entry.data as T
    localStorage.removeItem(LS_PREFIX + key)
  } catch { /* ignore */ }
  return null
}

function lsSet(key: string, data: unknown, ttlMs = LS_TTL): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, exp: Date.now() + ttlMs }))
  } catch { /* quota exceeded etc. */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Return cached data (L1 → L2), or null if not found / expired */
export function getCached<T>(key: string): T | null {
  const mem = _mem.get(key)
  if (mem && mem.exp > Date.now()) return mem.data as T
  return lsGet<T>(key)
}

/** Store data in both cache layers */
export function setCached(key: string, data: unknown, ttlMs = DEFAULT_TTL): void {
  _mem.set(key, { data, exp: Date.now() + ttlMs })
  lsSet(key, data, Math.max(ttlMs, LS_TTL))
}

/** Remove entries from both layers that match a URL pattern */
export function invalidateCache(urlPattern: string): void {
  for (const k of _mem.keys()) {
    if (k.includes(urlPattern)) _mem.delete(k)
  }
  if (typeof window !== 'undefined') {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(LS_PREFIX) && k.includes(urlPattern)) localStorage.removeItem(k)
    }
  }
}

/**
 * Async fetch with stale-while-revalidate.
 * Returns stale data INSTANTLY from cache, then refreshes in background.
 */
export async function cachedFetch(
  url: string,
  options?: RequestInit,
  ttlMs = DEFAULT_TTL
): Promise<{ data: unknown; fromCache: boolean }> {
  const cached = getCached<unknown>(url)

  if (cached !== null) {
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

// ── useCachedFetch hook ───────────────────────────────────────────────────────

export interface UseCachedFetchResult<T> {
  data: T | null
  isLoading: boolean   // true only on first fetch with no cache at all
  isStale: boolean     // true when showing cached data while revalidating
  error: Error | null
  refresh: () => void
}

/**
 * React hook: stale-while-revalidate data fetching.
 *
 * - Instantly returns whatever is in the cache (L1 or L2).
 * - Fires a background fetch to revalidate regardless of cache freshness.
 * - `isLoading` is only true when there is NO cached data at all (blank state).
 * - `isStale` is true while stale data is shown and a refresh is in-flight.
 *
 * Usage:
 *   const { data, isLoading } = useCachedFetch<MyType>('/api/foo')
 */
export function useCachedFetch<T>(
  url: string | null,
  options?: RequestInit,
  ttlMs = DEFAULT_TTL
): UseCachedFetchResult<T> {
  const seed = url ? getCached<T>(url) : null
  const [data, setData]         = useState<T | null>(seed)
  const [isLoading, setLoading] = useState<boolean>(!seed && url !== null)
  const [isStale, setStale]     = useState<boolean>(!!seed)
  const [error, setError]       = useState<Error | null>(null)
  const inFlight                = useRef(false)
  const optRef                  = useRef(options)
  optRef.current                = options

  const fetchNow = useCallback(async () => {
    if (!url || inFlight.current) return
    inFlight.current = true
    setError(null)
    try {
      const res = await fetch(url, optRef.current)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const fresh = await res.json() as T
      setCached(url, fresh, ttlMs)
      setData(fresh)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
      setStale(false)
      inFlight.current = false
    }
  }, [url, ttlMs])

  useEffect(() => {
    if (!url) return
    const cached = getCached<T>(url)
    if (cached !== null) {
      setData(cached)
      setLoading(false)
      setStale(true)
    } else {
      setLoading(true)
      setStale(false)
    }
    fetchNow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { data, isLoading, isStale, error, refresh: fetchNow }
}
