// ═══════════════════════════════════════════════════════════════
// Heart Rate Zone Visualization System
// Domain: Cardio zones, recovery heart rate, max HR percentage
// ═══════════════════════════════════════════════════════════════

import type { VizPalette, StatePalette } from "./contract";

/** Primary heart rate color — deep purple */
export const HEART_RATE_BASE = "#8B5CF6";

/** Full heart rate palette */
export const heartRatePalette: VizPalette = {
  base: HEART_RATE_BASE,
  dim: "rgba(139, 92, 246, 0.08)",
  glow: "rgba(139, 92, 246, 0.18)",
  background: "rgba(139, 92, 246, 0.06)",
  foreground: "#8B5CF6",
};

/** Heart rate zones (standard 5-zone model) */
export const heartRateZones: StatePalette = {
  low: "#A78BFA",      // Zone 1: Recovery (< 60% maxHR)
  medium: "#8B5CF6",   // Zone 2: Aerobic (60–70%)
  high: "#7C3AED",     // Zone 3: Threshold (70–80%)
  critical: "#6D28D9",   // Zone 4: Anaerobic (80–90%)
  optimal: "#5B21B6",    // Zone 5: VO2 Max (90–100%)
};

/** Resting HR color */
export const restingHeartRate = {
  color: "#C4B5FD",
  background: "rgba(139, 92, 246, 0.04)",
} as const;
