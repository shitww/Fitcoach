// ═══════════════════════════════════════════════════════════════
// Visualization System — INTERNAL ONLY
//
// ❌ NO component should import from here.
//
// ✔ Components MUST use the public API:
//   import { useDesignViz } from "@/design-system/viz"
//
// This file exists only for:
// - src/design-system/viz/index.ts (the public API)
// - internal test utilities
// - design-system internal modules
//
// Any component importing from here will fail the cognitive-load scanner.
// ═══════════════════════════════════════════════════════════════

// ── Internal core exports (consumed by viz/index.ts) ──
export { renderVisualState, renderFromValue, assertRendererOrigin } from "./core/renderer";
export type { RenderedVisualState } from "./core/renderer";
export { mapToVisualState, executeDomainMap } from "./core/mapper";
export { normalizePercentile, clampIntensity, intensityToOpacity, intensityToPercent } from "./core/scale";
export type { VisualIntensity, VizDomain, DomainInput } from "./core/types";
export { VISUAL_INTENSITIES, INTENSITY_LABELS } from "./core/types";

// ── Internal domain exports (consumed by registry) ──
export {
  mapFatigueToScale,
  mapSorenessToScale,
  fatigueDomain,
  FATIGUE_DOMAIN_NAME,
} from "./domains/fatigue";
export {
  mapRPEToScale,
  mapPercentIntensityToScale,
  map1RMPercentToScale,
  intensityDomain,
  INTENSITY_DOMAIN_NAME,
} from "./domains/intensity";
export {
  mapHRZoneToScale,
  mapBPMToScale,
  heartRateDomain,
  HEART_RATE_DOMAIN_NAME,
} from "./domains/heart-rate";
export {
  mapRecoveryToScale,
  mapRestTimerToScale,
  recoveryDomain,
  RECOVERY_DOMAIN_NAME,
} from "./domains/recovery";

// ── Registry exports (consumed by viz/index.ts) ──
export { vizRegistry, VIZ_DOMAIN_NAMES, getDomain, useViz } from "./registry";
export type { VizDomainName } from "./registry";

// ── Contract exports (runtime guard helpers) ──
export { guardVizLeak } from "./contract";
