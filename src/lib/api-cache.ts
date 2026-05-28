/**
 * Standard cache headers for read-heavy API routes.
 * private: user-specific data, never stored in shared CDN cache
 * max-age: serve from browser cache without revalidation for N seconds
 * stale-while-revalidate: serve stale cache instantly while fetching fresh in background
 */
export const CACHE_30S = {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
}

export const CACHE_2MIN = {
  'Cache-Control': 'private, max-age=120, stale-while-revalidate=300',
}

export const CACHE_5MIN = {
  'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
}
