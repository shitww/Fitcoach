// ── Build Runtime Transitions ─────────────────────────────────────────────────
// Defines transition configs for phase changes and UI events.
// Calm + premium motion — no flashy FX.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimePhase } from '../state-machine/buildWorkoutRuntimeState'

export interface TransitionConfig {
  enter: {
    duration: number    // ms
    easing: string
    translateY?: number // px — positive = slide up from below
    opacity: [number, number]
    scale?: [number, number]
  }
  exit: {
    duration: number
    easing: string
    translateY?: number
    opacity: [number, number]
    scale?: [number, number]
  }
}

/** Phase-specific transition configurations. */
export const PHASE_TRANSITIONS: Record<WorkoutRuntimePhase, TransitionConfig> = {
  idle: {
    enter: { duration: 300, easing: 'ease-out', opacity: [0, 1] },
    exit:  { duration: 200, easing: 'ease-in',  opacity: [1, 0] },
  },
  pre_workout: {
    enter: { duration: 350, easing: 'ease-out', translateY: 16, opacity: [0, 1] },
    exit:  { duration: 200, easing: 'ease-in',  translateY: -8,  opacity: [1, 0] },
  },
  warmup: {
    enter: { duration: 400, easing: 'ease-out', translateY: 12, opacity: [0, 1], scale: [0.98, 1] },
    exit:  { duration: 250, easing: 'ease-in',  translateY: -6,  opacity: [1, 0] },
  },
  active_set: {
    enter: { duration: 380, easing: 'cubic-bezier(0.34,1.56,0.64,1)', translateY: 20, opacity: [0, 1], scale: [0.96, 1] },
    exit:  { duration: 220, easing: 'ease-in',  translateY: -10, opacity: [1, 0], scale: [1, 0.98] },
  },
  rest: {
    enter: { duration: 300, easing: 'ease-out', opacity: [0, 1], scale: [0.97, 1] },
    exit:  { duration: 250, easing: 'ease-in',  opacity: [1, 0], scale: [1, 0.97] },
  },
  transition: {
    enter: { duration: 420, easing: 'ease-out', translateY: 24, opacity: [0, 1], scale: [0.97, 1] },
    exit:  { duration: 250, easing: 'ease-in',  translateY: -12, opacity: [1, 0] },
  },
  completion: {
    enter: { duration: 500, easing: 'ease-out', translateY: 32, opacity: [0, 1], scale: [0.95, 1] },
    exit:  { duration: 300, easing: 'ease-in',  opacity: [1, 0] },
  },
  reflection: {
    enter: { duration: 600, easing: 'ease-out', translateY: 24, opacity: [0, 1] },
    exit:  { duration: 350, easing: 'ease-in',  opacity: [1, 0] },
  },
  paused: {
    enter: { duration: 250, easing: 'ease-out', opacity: [0, 1] },
    exit:  { duration: 200, easing: 'ease-in',  opacity: [1, 0] },
  },
}

/** CSS keyframe string for a set completion "pulse". */
export const SET_COMPLETION_KEYFRAMES = `
@keyframes rt-set-complete {
  0%   { transform: scale(1);    opacity: 1; }
  30%  { transform: scale(1.04); opacity: 1; }
  60%  { transform: scale(0.98); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}
`

/** CSS for smooth exercise name transition (crossfade). */
export const EXERCISE_NAME_TRANSITION = `
@keyframes rt-name-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rt-name-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
`

/** Convert a TransitionConfig to a CSS animation string. */
export function toCssTransition(config: TransitionConfig['enter']): string {
  return `opacity ${config.duration}ms ${config.easing}`
}
