// ── Build Recovery Pulse ──────────────────────────────────────────────────────
// Visual pulse rhythm for the rest phase.
// Communicates body state, not just timer countdown.
// ─────────────────────────────────────────────────────────────────────────────

export interface RecoveryPulseConfig {
  /** CSS animation string */
  pulseAnimation: string
  /** Glow radius in px */
  glowRadius: number
  /** Glow opacity */
  glowOpacity: number
  /** Whether to show the inner breathing circle */
  showBreathingCircle: boolean
  /** Breathing circle scale range [min, max] */
  breathingScale: [number, number]
}

/** Build recovery pulse config based on time remaining and intensity. */
export function buildRecoveryPulse(
  secondsRemaining: number,
  totalDuration: number,
  setsCompleted: number
): RecoveryPulseConfig {
  const pct = totalDuration > 0
    ? Math.min(1, secondsRemaining / totalDuration)
    : 0

  // Higher pct = earlier in rest = slower pulse (true recovery)
  // Lower pct = near end = faster pulse (getting ready)
  const pulseDur = 2 + pct * 2.5   // 2s (end) → 4.5s (start)
  const glowOpacity = 0.06 + (1 - pct) * 0.08  // grows slightly as rest ends

  return {
    pulseAnimation: `rt-breathe ${pulseDur.toFixed(1)}s ease-in-out infinite`,
    glowRadius: 60 + setsCompleted * 4,
    glowOpacity: Math.min(0.18, glowOpacity),
    showBreathingCircle: secondsRemaining > 3,
    breathingScale: [0.92, 1.04],
  }
}
