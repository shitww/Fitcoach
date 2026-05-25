"use server"

import { getDashboardStatus } from "@/lib/dashboard"
import { writeDashboardSnapshot } from "@/lib/kv/dashboard"

/**
 * Server Action: force recompute dashboard snapshot and write to KV.
 * Call from any client page after mutation to ensure home page sees fresh data.
 */
export async function refreshDashboard(userId: string): Promise<void> {
  const status = await getDashboardStatus(userId)
  await writeDashboardSnapshot(userId, status)
}
