// ═══════════════════════════════════════════════════════════════
// Intensity Visualization System
// Domain: Workout intensity, effort level, RPE, power output
// ═══════════════════════════════════════════════════════════════

import type { VizPalette, StatePalette } from "./contract";

/** Primary intensity color — electric lime (high energy) */
export const INTENSITY_BASE = "#B8FF2B";

/** Full intensity palette for ambient surfaces and glows */
export const intensityPalette: VizPalette = {
  base: INTENSITY_BASE,
  dim: "rgba(184, 255, 43, 0.08)",
  glow: "rgba(184, 255, 43, 0.18)",
  background: "rgba(184, 255, 43, 0.06)",
  foreground: "#B8FF2B",
};

/** Intensity/RPE levels */
export const intensityStates: StatePalette = {
  low: "rgba(184, 255, 43, 0.25)",      // warm-up / easy
  medium: "rgba(184, 255, 43, 0.50)",   // moderate / working
  high: "rgba(184, 255, 43, 0.75)",     // hard / near limit
  critical: "rgba(184, 255, 43, 0.95)", // max effort / PR
};

/** CSS classes for runtime surfaces */
export const intensityClasses = {
  surface: "rvl-ambient-active",
  glow: "rvl-glow-active",
  ring: "rvl-ring-fill-active",
  pulse: "rvl-animate-pulse-active",
} as const;
