// ═══════════════════════════════════════════════════════════════
// Intensity Domain — Pure Scale Mapper
//
// RULES:
// - NO colors. Only numeric mapping.
// - Output MUST be VisualIntensity 0–4.
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity, VizDomain } from "../core";
import { clampIntensity } from "../core";

export const INTENSITY_DOMAIN_NAME = "intensity" as const;

/**
 * Maps RPE (Rating of Perceived Exertion, 1–10) to VisualIntensity.
 *
 * Scale:
 *   RPE 1–2  → 0 (rest / recovery)
 *   RPE 3–4  → 1 (warm-up / easy)
 *   RPE 5–6  → 2 (moderate / working)
 *   RPE 7–8  → 3 (hard / near limit)
 *   RPE 9–10 → 4 (max effort / PR)
 */
export function mapRPEToScale(rpe: number): VisualIntensity {
  if (rpe <= 2) return 0;
  if (rpe <= 4) return 1;
  if (rpe <= 6) return 2;
  if (rpe <= 8) return 3;
  return 4;
}

/**
 * Maps percentage-based intensity (0–100%) to VisualIntensity.
 *
 * Scale:
 *   0–20%  → 0
 *   21–40% → 1
 *   41–60% → 2
 *   61–80% → 3
 *   81–100%→ 4
 */
export function mapPercentIntensityToScale(percent: number): VisualIntensity {
  if (percent <= 20) return 0;
  if (percent <= 40) return 1;
  if (percent <= 60) return 2;
  if (percent <= 80) return 3;
  return 4;
}

/**
 * Intensity domain registration.
 */
export const intensityDomain: VizDomain<number> = {
  name: INTENSITY_DOMAIN_NAME,
  mapToScale: mapPercentIntensityToScale,
};

/**
 * Convenience: power output relative to 1RM.
 */
export function map1RMPercentToScale(rmPercent: number): VisualIntensity {
  return clampIntensity(rmPercent / 25);
}
