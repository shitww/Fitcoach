// ═══════════════════════════════════════════════════════════════
// Unified Scale System
//
// This is the single source of truth for ALL visual intensity
// across every domain in FitCoach.
//
// RULES:
// - All domain values normalize into VisualIntensity 0–4
// - Scale boundaries are domain-agnostic
// - NO colors here. Only numbers and thresholds.
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity } from "./types";

/**
 * Thresholds for normalizing a 0–100 value into VisualIntensity.
 *
 * 0–15   → 0 (resting)
 * 16–40  → 1 (low)
 * 41–60  → 2 (moderate)
 * 61–85  → 3 (high)
 * 86–100 → 4 (critical)
 */
export const DEFAULT_PERCENTILE_THRESHOLDS = {
  resting: 15,
  low: 40,
  moderate: 60,
  high: 85,
} as const;

/**
 * Normalizes any numeric value (assumed 0–100) into VisualIntensity.
 * This is the DEFAULT mapper. Domains may provide custom logic.
 */
export function normalizePercentile(value: number): VisualIntensity {
  if (value < 0) return 0;
  if (value <= DEFAULT_PERCENTILE_THRESHOLDS.resting) return 0;
  if (value <= DEFAULT_PERCENTILE_THRESHOLDS.low) return 1;
  if (value <= DEFAULT_PERCENTILE_THRESHOLDS.moderate) return 2;
  if (value <= DEFAULT_PERCENTILE_THRESHOLDS.high) return 3;
  return 4;
}

/**
 * Clamp any VisualIntensity to valid range.
 */
export function clampIntensity(value: number): VisualIntensity {
  if (value <= 0) return 0;
  if (value >= 4) return 4;
  return Math.round(value) as VisualIntensity;
}

/**
 * Convert intensity to a 0.0–1.0 opacity multiplier.
 * Useful for progressive disclosure (e.g., low intensity = more transparent).
 */
export function intensityToOpacity(intensity: VisualIntensity): number {
  return 0.2 + intensity * 0.2; // 0→0.2, 1→0.4, 2→0.6, 3→0.8, 4→1.0
}

/**
 * Convert intensity to a percentage string (0%–100%).
 */
export function intensityToPercent(intensity: VisualIntensity): string {
  return `${intensity * 25}%`;
}
