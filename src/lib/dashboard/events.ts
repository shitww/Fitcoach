import { getDashboardStatus } from "../dashboard"
import { writeDashboardSnapshot } from "../kv/dashboard"

export type DashboardEventType =
  | "WORKOUT_COMPLETED"
  | "WORKOUT_LOGGED"
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "PLAN_DELETED"
  | "NUTRITION_LOGGED"
  | "NUTRITION_UPDATED"

interface DashboardEvent {
  type: DashboardEventType
  userId: string
  ts: number
}

type Handler = (event: DashboardEvent) => void

// Per-user in-memory event bus (single-instance only; production → WebSocket / SSE)
const bus = new Map<string, Set<Handler>>()

export function subscribeDashboardEvents(userId: string, handler: Handler): () => void {
  const key = userId
  if (!bus.has(key)) bus.set(key, new Set())
  bus.get(key)!.add(handler)
  return () => {
    bus.get(key)?.delete(handler)
  }
}

export function emitDashboardEvent(type: DashboardEventType, userId: string): void {
  const event: DashboardEvent = { type, userId, ts: Date.now() }
  const handlers = bus.get(userId)
  if (handlers) {
    handlers.forEach((h) => h(event))
  }
  // Default side-effect: recompute dashboard and write to KV
  void recomputeAndWrite(userId)
}

async function recomputeAndWrite(userId: string): Promise<void> {
  try {
    const status = await getDashboardStatus(userId)
    await writeDashboardSnapshot(userId, status)
  } catch {
    // Silent: next page load will recompute anyway
  }
}
