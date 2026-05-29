// ═══════════════════════════════════════════════════════════════
// Fatigue Visualization System
// Domain: Muscle fatigue, training strain, overreaching detection
// ═══════════════════════════════════════════════════════════════

import type { VizPalette, StatePalette } from "./contract";

/** Single color for the fatigue domain — warm amber/orange */
export const FATIGUE_BASE = "#FF9940";

/** Full fatigue palette for ambient surfaces and glows */
export const fatiguePalette: VizPalette = {
  base: FATIGUE_BASE,
  dim: "rgba(255, 153, 64, 0.08)",
  glow: "rgba(255, 153, 64, 0.18)",
  background: "rgba(255, 153, 64, 0.05)",
  foreground: "#FF9940",
};

/** Fatigue levels mapped to tailwind-compatible opacity classes */
export const fatigueStates: StatePalette = {
  low: "rgba(255, 153, 64, 0.20)",     // well-recovered
  medium: "rgba(255, 153, 64, 0.45)",   // moderate fatigue
  high: "rgba(255, 153, 64, 0.70)",     // high fatigue
  critical: "rgba(255, 153, 64, 0.90)",  // overreaching
};

/** CSS classes for runtime surfaces */
export const fatigueClasses = {
  surface: "rvl-ambient-fatigue",
  glow: "rvl-glow-fatigue",
  ring: "rvl-ring-fill-fatigue",
  pulse: "rvl-animate-pulse-fatigue",
} as const;
