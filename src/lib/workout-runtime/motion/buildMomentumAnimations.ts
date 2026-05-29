// ── Build Momentum Animations ─────────────────────────────────────────────────
// Derives animation intensity from session momentum state.
// Higher momentum = slightly more responsive motion.
// Still calm — never flashy.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeState } from '../state-machine/buildWorkoutRuntimeState'

export interface MomentumAnimationConfig {
  /** Button press scale factor (e.g. 0.94 for high momentum, 0.97 for low) */
  pressScale: number
  /** Confirm button glow intensity (0–1) */
  glowIntensity: number
  /** Queue rail transition duration (ms) */
  queueTransitionMs: number
  /** Set completion animation duration (ms) */
  setCompletionMs: number
  /** Pulse animation for rest ring */
  restPulseSpeed: 'slow' | 'normal' | 'fast'
  /** Whether to show subtle progress wave */
  showProgressWave: boolean
}

/** Derive animation config from session momentum. */
export function buildMomentumAnimations(
  state: Pick<WorkoutRuntimeState, 'momentum' | 'sessionEnergy' | 'totalSetsLogged'>
): MomentumAnimationConfig {
  const { momentum, sessionEnergy } = state

  if (momentum === 'rising' && sessionEnergy === 'high') {
    return {
      pressScale: 0.93,
      glowIntensity: 0.8,
      queueTransitionMs: 300,
      setCompletionMs: 280,
      restPulseSpeed: 'normal',
      showProgressWave: true,
    }
  }

  if (momentum === 'fading' || sessionEnergy === 'low') {
    return {
      pressScale: 0.96,
      glowIntensity: 0.4,
      queueTransitionMs: 450,
      setCompletionMs: 380,
      restPulseSpeed: 'slow',
      showProgressWave: false,
    }
  }

  // consistent / normal
  return {
    pressScale: 0.95,
    glowIntensity: 0.6,
    queueTransitionMs: 350,
    setCompletionMs: 320,
    restPulseSpeed: 'normal',
    showProgressWave: false,
  }
}

/** CSS animation speed for the rest ring pulse based on config. */
export function getRestPulseAnimation(speed: 'slow' | 'normal' | 'fast'): string {
  const dur = speed === 'fast' ? '2.5s' : speed === 'slow' ? '4.5s' : '3.5s'
  return `rt-breathe ${dur} ease-in-out infinite`
}
