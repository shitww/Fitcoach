// ═══════════════════════════════════════════════════════════════
// Heart Rate Domain — Pure Scale Mapper
//
// RULES:
// - NO colors. Only numeric mapping.
// - Output MUST be VisualIntensity 0–4.
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity, VizDomain } from "../core";

export const HEART_RATE_DOMAIN_NAME = "heart-rate" as const;

/**
 * Standard heart rate zones as percentages of max HR.
 *
 * Zone 1: Recovery      < 60%
 * Zone 2: Aerobic       60–70%
 * Zone 3: Threshold     70–80%
 * Zone 4: Anaerobic     80–90%
 * Zone 5: VO2 Max       90–100%
 */
export function mapHRZoneToScale(percentOfMaxHR: number): VisualIntensity {
  if (percentOfMaxHR < 60) return 0;
  if (percentOfMaxHR < 70) return 1;
  if (percentOfMaxHR < 80) return 2;
  if (percentOfMaxHR < 90) return 3;
  return 4;
}

/**
 * Maps raw BPM to scale using resting HR and max HR.
 */
export function mapBPMToScale(
  bpm: number,
  restingHR: number,
  maxHR: number,
): VisualIntensity {
  const percent = ((bpm - restingHR) / (maxHR - restingHR)) * 100;
  return mapHRZoneToScale(Math.max(0, percent));
}

/**
 * Heart rate domain registration.
 */
export const heartRateDomain: VizDomain<number> = {
  name: HEART_RATE_DOMAIN_NAME,
  mapToScale: (bpm: number) => {
    // Default 220-age approximation if no maxHR provided
    // In practice, consumers should use mapBPMToScale directly
    return mapHRZoneToScale(bpm);
  },
};
