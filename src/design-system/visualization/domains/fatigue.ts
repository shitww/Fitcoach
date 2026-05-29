// ═══════════════════════════════════════════════════════════════
// Fatigue Domain — Pure Scale Mapper
//
// RULES:
// - NO colors. Only numeric mapping.
// - Output MUST be VisualIntensity 0–4.
// - Color rendering is handled by core/renderer.ts
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity, VizDomain } from "../core";
import { clampIntensity } from "../core";

export const FATIGUE_DOMAIN_NAME = "fatigue" as const;

/**
 * Maps raw fatigue value to VisualIntensity.
 *
 * Scale:
 *   0–19   → 0 (rested, well-recovered)
 *   20–49  → 1 (low fatigue)
 *   50–74  → 2 (moderate fatigue)
 *   75–89  → 3 (high fatigue)
 *   90–100 → 4 (critical / overreaching)
 */
export function mapFatigueToScale(fatigueValue: number): VisualIntensity {
  if (fatigueValue < 0) return 0;
  if (fatigueValue <= 19) return 0;
  if (fatigueValue <= 49) return 1;
  if (fatigueValue <= 74) return 2;
  if (fatigueValue <= 89) return 3;
  return 4;
}

/**
 * Fatigue domain registration contract.
 * Used by the registry to enforce unified scale usage.
 */
export const fatigueDomain: VizDomain<number> = {
  name: FATIGUE_DOMAIN_NAME,
  mapToScale: mapFatigueToScale,
};

/**
 * Convenience: muscle soreness scale (0–10) → VisualIntensity
 */
export function mapSorenessToScale(soreness: number): VisualIntensity {
  return clampIntensity(soreness / 2.5);
}
