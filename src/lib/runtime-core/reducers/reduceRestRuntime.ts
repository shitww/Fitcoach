// ── Reduce Rest Runtime ───────────────────────────────────────────────────────
// Derives rest state from snapshot for UI consumption.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeSnapshot } from './reduceWorkoutRuntime'

export interface RestRuntimeState {
  isActive: boolean
  secondsRemaining: number
  totalDuration: number
  endAt: number | null
  progressPct: number          // 0–1 (1 = just started, 0 = expired)
  isExpired: boolean
}

/** Derive live rest state from snapshot + current time. */
export function deriveRestState(
  snapshot: WorkoutRuntimeSnapshot,
  now: number = Date.now()
): RestRuntimeState {
  if (!snapshot.isRestActive || !snapshot.restEndAt) {
    return { isActive: false, secondsRemaining: 0, totalDuration: 0, endAt: null, progressPct: 0, isExpired: false }
  }

  const remaining    = Math.max(0, Math.ceil((snapshot.restEndAt - now) / 1000))
  const progressPct  = snapshot.restDuration > 0 ? remaining / snapshot.restDuration : 0
  const isExpired    = remaining === 0

  return {
    isActive: true,
    secondsRemaining: remaining,
    totalDuration: snapshot.restDuration,
    endAt: snapshot.restEndAt,
    progressPct,
    isExpired,
  }
}

/** Format seconds as mm:ss or just s for display. */
export function formatRestTime(seconds: number): string {
  if (seconds <= 0) return '0'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`
  return `${s}`
}
