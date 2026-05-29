// ═══════════════════════════════════════════════════════════════
// Recovery Domain — Pure Scale Mapper
//
// RULES:
// - NO colors. Only numeric mapping.
// - Output MUST be VisualIntensity 0–4.
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity, VizDomain } from "../core";

export const RECOVERY_DOMAIN_NAME = "recovery" as const;

/**
 * Maps recovery score (0–100) to VisualIntensity.
 * Inverse mapping: higher recovery = LOWER intensity.
 *
 * Scale:
 *   85–100 → 0 (fully recovered / optimal)
 *   65–84  → 1 (good recovery)
 *   45–64  → 2 (moderate recovery)
 *   25–44  → 3 (poor recovery)
 *   0–24   → 4 (critical / overreaching)
 */
export function mapRecoveryToScale(score: number): VisualIntensity {
  if (score >= 85) return 0;
  if (score >= 65) return 1;
  if (score >= 45) return 2;
  if (score >= 25) return 3;
  return 4;
}

/**
 * Maps rest timer remaining seconds to urgency scale.
 * Inverse: more time remaining = lower intensity.
 *
 * Scale (assuming 120s default rest):
 *   > 90s  → 0 (plenty of time)
 *   60–90s → 1 (comfortable)
 *   30–60s → 2 (halfway)
 *   10–30s → 3 (hurry up)
 *   < 10s  → 4 (critical — time's almost up)
 */
export function mapRestTimerToScale(
  remainingSeconds: number,
  totalSeconds: number = 120,
): VisualIntensity {
  const pct = (remainingSeconds / totalSeconds) * 100;
  if (pct > 75) return 0;
  if (pct > 50) return 1;
  if (pct > 25) return 2;
  if (pct > 8) return 3;
  return 4;
}

/**
 * Recovery domain registration.
 */
export const recoveryDomain: VizDomain<number> = {
  name: RECOVERY_DOMAIN_NAME,
  mapToScale: mapRecoveryToScale,
};
