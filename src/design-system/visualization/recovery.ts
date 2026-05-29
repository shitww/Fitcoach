// ═══════════════════════════════════════════════════════════════
// Recovery Visualization System
// Domain: Rest periods, recovery status, readiness score
// ═══════════════════════════════════════════════════════════════

import type { VizPalette, StatePalette } from "./contract";

/** Primary recovery color — calming teal/cyan */
export const RECOVERY_BASE = "#00E5CC";

/** Full recovery palette */
export const recoveryPalette: VizPalette = {
  base: RECOVERY_BASE,
  dim: "rgba(0, 229, 204, 0.08)",
  glow: "rgba(0, 229, 204, 0.18)",
  background: "rgba(0, 229, 204, 0.05)",
  foreground: "#00E5CC",
};

/** Recovery / readiness levels */
export const recoveryStates: StatePalette = {
  low: "rgba(0, 229, 204, 0.25)",     // poor recovery
  medium: "rgba(0, 229, 204, 0.50)",  // adequate
  high: "rgba(0, 229, 204, 0.75)",    // good recovery
  optimal: "rgba(0, 229, 204, 0.95)",  // fully recovered
};

/** Rest timer specific palette */
export const restTimerPalette = {
  normal: "#00E5CC",
  urgent: "#FF9940",
  critical: "#FF3B5C",
  glowNormal: "rgba(0, 229, 204, 0.18)",
  glowUrgent: "rgba(255, 153, 64, 0.18)",
  glowCritical: "rgba(255, 59, 92, 0.18)",
} as const;

/** CSS classes for runtime surfaces */
export const recoveryClasses = {
  surface: "rvl-ambient-rest",
  glow: "rvl-glow-rest",
  ring: "rvl-ring-fill-rest",
  pulse: "rvl-animate-pulse-rest",
} as const;
