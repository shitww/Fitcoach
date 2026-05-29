// ── Optimize Thumb Flow ───────────────────────────────────────────────────────
// Defines thumb-zone layout rules for mobile gym usage.
// Single-hand, sweaty, interrupted use — must always work.
// ─────────────────────────────────────────────────────────────────────────────

/** Device thumb zone classification. */
export type ThumbZone = 'easy' | 'hard' | 'natural'

export interface ThumbZoneLayout {
  /** Primary CTA position: bottom-center = easiest */
  primaryCTA: { bottom: number; minHeight: number }
  /** Secondary actions position */
  secondaryCTAs: { bottom: number; minHeight: number }
  /** Stepper controls (weight/reps) position */
  steppers: { position: 'bottom' | 'center' }
  /** Minimum touch target size in px */
  minTouchTarget: number
  /** Whether to show floating confirm button */
  useFloatingConfirm: boolean
}

/** Standard mobile thumb-flow optimized layout for workout. */
export const WORKOUT_THUMB_LAYOUT: ThumbZoneLayout = {
  primaryCTA: { bottom: 32, minHeight: 64 },      // 64px min, 32px from bottom nav
  secondaryCTAs: { bottom: 112, minHeight: 52 },   // above primary
  steppers: { position: 'bottom' },                 // steppers near thumb
  minTouchTarget: 48,                               // iOS HIG minimum
  useFloatingConfirm: true,
}

/** Check if a touch target size meets minimum ergonomic requirements. */
export function meetsThumbTarget(sizePx: number): boolean {
  return sizePx >= WORKOUT_THUMB_LAYOUT.minTouchTarget
}

/** Compute the safe interaction area height from bottom of screen. */
export function getSafeInteractionZone(): { maxY: number; description: string } {
  // Bottom ~40% of screen is the natural thumb zone on a 6" phone
  if (typeof window === 'undefined') {
    return { maxY: 300, description: 'default' }
  }
  const h = window.innerHeight
  return {
    maxY: Math.floor(h * 0.45),
    description: `${Math.floor(h * 0.45)}px from bottom`,
  }
}

/** Standard haptic feedback timing for set confirmation. */
export const HAPTIC_PATTERNS = {
  setConfirm:  [10],          // light tap on confirm
  prAchieved:  [10, 60, 20],  // subtle double-tap for PR
  restStart:   [5],            // very light on rest start
  restEnd:     [15, 40],       // gentle nudge when rest ends
} as const
