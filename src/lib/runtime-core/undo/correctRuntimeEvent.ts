// ── Correct Runtime Event ─────────────────────────────────────────────────────
// Correction = append a SET_CORRECTED event.
// The reducer applies corrections when rebuilding snapshot.
// ─────────────────────────────────────────────────────────────────────────────

import type { SetCorrectedPayload } from '../event-log/createRuntimeEvent'

export interface CorrectionSpec {
  targetEventId: string
  exerciseName: string
  newWeight?: number
  newReps?: number
  newRir?: number | null
  reason?: 'undo' | 'typo' | 'user_edit'
}

/** Build a SET_CORRECTED payload from a correction spec. */
export function buildCorrectionPayload(spec: CorrectionSpec): Record<string, unknown> {
  return {
    targetEventId:   spec.targetEventId,
    exerciseName:    spec.exerciseName,
    correctedWeight: spec.newWeight,
    correctedReps:   spec.newReps,
    correctedRir:    spec.newRir,
    reason:          spec.reason ?? 'user_edit',
    correctedAt:     Date.now(),
  }
}

/** Validate that a correction is permitted (not correcting an already-corrected event). */
export function isCorrectionPermitted(
  targetEventId: string,
  existingCorrectionIds: string[]
): { permitted: boolean; reason?: string } {
  if (existingCorrectionIds.includes(targetEventId)) {
    return { permitted: false, reason: '已修正的记录不能再次修正' }
  }
  return { permitted: true }
}

/** Build a readable diff string for a correction. */
export function describeCorrectionDiff(
  originalWeight: number,
  originalReps: number,
  newWeight: number | undefined,
  newReps: number | undefined,
  isBodyweight: boolean
): string {
  const parts: string[] = []
  if (newWeight !== undefined && newWeight !== originalWeight && !isBodyweight) {
    parts.push(`重量 ${originalWeight}→${newWeight}kg`)
  }
  if (newReps !== undefined && newReps !== originalReps) {
    parts.push(`次数 ${originalReps}→${newReps}`)
  }
  return parts.length > 0 ? parts.join('，') : '无变化'
}
