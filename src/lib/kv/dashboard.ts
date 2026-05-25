import type { DashboardStatus } from "@/app/api/dashboard/status/route"

export interface DashboardSnapshot {
  data: DashboardStatus
  updatedAt: number
  stale: boolean
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

// ── Dev / single-instance fallback: in-memory Map ──
const memoryCache = new Map<string, DashboardSnapshot>()

// ── Production hook: replace with Redis / Upstash / Cloudflare KV ──
// async function kvGet(key: string): Promise<string | null> { ... }
// async function kvSet(key: string, value: string, ttlSec?: number): Promise<void> { ... }

function getCacheKey(userId: string) {
  return `dashboard:${userId}`
}

/**
 * Read cached dashboard snapshot.
 * Production: swap memoryCache for actual KV read.
 */
export async function getDashboardSnapshot(
  userId: string
): Promise<DashboardSnapshot | null> {
  // TODO: production — await kvGet(getCacheKey(userId)) and JSON.parse
  const snap = memoryCache.get(getCacheKey(userId))
  if (!snap) return null

  const ageMs = Date.now() - snap.updatedAt
  return {
    data: snap.data,
    updatedAt: snap.updatedAt,
    stale: ageMs > STALE_THRESHOLD_MS,
  }
}

/**
 * Write-through to KV + memory fallback.
 * Production: swap memoryCache for actual KV write.
 */
export async function writeDashboardSnapshot(
  userId: string,
  data: DashboardStatus
): Promise<void> {
  const snapshot: DashboardSnapshot = {
    data,
    updatedAt: Date.now(),
    stale: false,
  }
  // TODO: production — await kvSet(getCacheKey(userId), JSON.stringify(snapshot), 60)
  memoryCache.set(getCacheKey(userId), snapshot)
}

/** Synchronous memory read for SSR paths that cannot await. */
export function getDashboardSnapshotSync(userId: string): DashboardSnapshot | null {
  const snap = memoryCache.get(getCacheKey(userId))
  if (!snap) return null
  const ageMs = Date.now() - snap.updatedAt
  return { ...snap, stale: ageMs > STALE_THRESHOLD_MS }
}

/** Synchronous memory write for hot-paths that cannot await. */
export function writeDashboardSnapshotSync(userId: string, data: DashboardStatus): void {
  memoryCache.set(getCacheKey(userId), {
    data,
    updatedAt: Date.now(),
    stale: false,
  })
}
