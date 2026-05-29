// ── Build One-Hand Interactions ───────────────────────────────────────────────
// Interaction model designed for one-handed gym use.
// No precision taps. No keyboard. Gestural + large targets.
// ─────────────────────────────────────────────────────────────────────────────

export type GestureAction =
  | 'confirm_set'       // swipe up OR tap confirm
  | 'adjust_weight_up'  // swipe right on weight
  | 'adjust_weight_down'// swipe left on weight
  | 'adjust_reps_up'    // swipe up on reps
  | 'adjust_reps_down'  // swipe down on reps
  | 'skip_rest'         // tap anywhere during rest
  | 'next_exercise'     // swipe right during transition

export interface GestureConfig {
  action: GestureAction
  triggerType: 'swipe' | 'tap' | 'long_press'
  threshold?: number     // px for swipe threshold
  description: string
}

/** Gesture map for one-hand workout interactions. */
export const WORKOUT_GESTURES: GestureConfig[] = [
  { action: 'confirm_set',        triggerType: 'tap',   description: 'Tap confirm button to log set' },
  { action: 'adjust_weight_up',   triggerType: 'swipe', threshold: 30, description: 'Swipe right to increase weight' },
  { action: 'adjust_weight_down', triggerType: 'swipe', threshold: 30, description: 'Swipe left to decrease weight' },
  { action: 'skip_rest',          triggerType: 'tap',   description: 'Tap to skip rest' },
  { action: 'next_exercise',      triggerType: 'swipe', threshold: 60, description: 'Swipe right to advance queue' },
]

/** Minimum weight step increments for quick adjustment. */
export const WEIGHT_STEPS = {
  micro:   0.5,   // precision adjustment
  normal:  2.5,   // standard plate
  large:   5.0,   // quick jump
} as const

/** Detect swipe direction from touch delta. */
export function detectSwipeDirection(
  deltaX: number,
  deltaY: number,
  threshold = 30
): 'up' | 'down' | 'left' | 'right' | null {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  if (absX < threshold && absY < threshold) return null
  if (absX > absY) return deltaX > 0 ? 'right' : 'left'
  return deltaY > 0 ? 'down' : 'up'
}

/** Trigger haptic feedback if available. */
export function triggerHaptic(
  pattern: readonly number[]
): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([...pattern])
    }
  } catch { /* non-critical */ }
}
