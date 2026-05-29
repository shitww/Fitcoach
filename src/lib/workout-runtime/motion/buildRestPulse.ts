// ── Build Rest Pulse ──────────────────────────────────────────────────────────
// Generates the rest timer visual pulse configuration.
// Communicates readiness without demanding attention.
// ─────────────────────────────────────────────────────────────────────────────

export interface RestPulseConfig {
  /** Ring color at current time */
  ringColor: string
  glowRgb: string
  /** Urgency state */
  urgency: 'calm' | 'approaching' | 'ready' | 'overdue'
  /** Background overlay opacity */
  bgOpacity: number
  /** Pulse animation duration */
  pulseDuration: string
  /** Whether to show the "ready" state (time expired, waiting for user) */
  isReady: boolean
  /** Readiness indicator text */
  readinessText: string
}

/** Build rest pulse config from current rest state. */
export function buildRestPulse(
  secondsRemaining: number,
  totalDuration: number,
  nextExercise: string | null
): RestPulseConfig {
  const pct = totalDuration > 0 ? secondsRemaining / totalDuration : 0
  const isReady = secondsRemaining <= 0

  if (isReady) {
    return {
      ringColor: '#22c55e',
      glowRgb: '34,197,94',
      urgency: 'ready',
      bgOpacity: 0.6,
      pulseDuration: '2s',
      isReady: true,
      readinessText: nextExercise ? `准备好了，开始 ${nextExercise}` : '准备好了',
    }
  }

  if (secondsRemaining <= 5) {
    return {
      ringColor: '#ef4444',
      glowRgb: '239,68,68',
      urgency: 'approaching',
      bgOpacity: 0.7,
      pulseDuration: '1.5s',
      isReady: false,
      readinessText: '即将开始',
    }
  }

  if (pct <= 0.25) {
    // < 25% remaining = almost done
    return {
      ringColor: '#f59e0b',
      glowRgb: '245,158,11',
      urgency: 'approaching',
      bgOpacity: 0.65,
      pulseDuration: '2.5s',
      isReady: false,
      readinessText: '快准备好',
    }
  }

  // Calm rest — plenty of time
  return {
    ringColor: 'rgba(255,255,255,0.5)',
    glowRgb: '255,255,255',
    urgency: 'calm',
    bgOpacity: 0.55,
    pulseDuration: '3.5s',
    isReady: false,
    readinessText: '恢复中',
  }
}

/** Compute ring SVG parameters for the rest timer. */
export function computeRingParams(
  secondsRemaining: number,
  totalDuration: number,
  radius: number
): { dash: number; circumference: number; strokeOpacity: number } {
  const circumference = 2 * Math.PI * radius
  const pct = totalDuration > 0
    ? Math.max(0, Math.min(1, secondsRemaining / totalDuration))
    : 0
  const dash = pct * circumference
  const strokeOpacity = 0.6 + pct * 0.4  // fades slightly as rest progresses
  return { dash, circumference, strokeOpacity }
}
