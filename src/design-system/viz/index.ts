// ═══════════════════════════════════════════════════════════════
// Visualization — Single Public API
//
// This is the ONLY legal entry point for visualization.
//
// Mental model: ONE function.
//
//   import { useDesignViz } from "@/design-system/viz"
//   const visual = useDesignViz("fatigue", 75)
//
// That's it. No renderer, no registry, no scale, no mapper.
// Those are internal implementation details.
//
// ❌ FORBIDDEN (will fail lint + scanner):
//   import { renderVisualState } from "@/design-system/visualization/core/renderer"
//   import { mapFatigueToScale } from "@/design-system/visualization/domains/fatigue"
//   import { getDomain } from "@/design-system/visualization/registry"
//
// ✔ ALLOWED:
//   import { useDesignViz } from "@/design-system/viz"
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity } from "../visualization/core/types";
import { getDomain } from "../visualization/registry";
import { renderVisualState } from "../visualization/core/renderer";
import type { RenderedVisualState } from "../visualization/core/renderer";
import type { VizDomainName } from "../visualization/registry";

/**
 * The ONE function for all visualization needs.
 *
 * @param domain — "fatigue" | "intensity" | "heart-rate" | "recovery"
 * @param value  — raw domain value (number or domain-specific type)
 * @returns      — complete visual state (colors, classes, glow)
 *
 * @example
 *   const visual = useDesignViz("fatigue", 75)
 *   // visual.intensity  → 3
 *   // visual.tailwind.bg → "bg-warning/40"
 *   // visual.surface     → "rgb(var(--warning) / 0.35)"
 */
export function useDesignViz<TInput = number>(
  domain: VizDomainName,
  value: TInput,
): RenderedVisualState {
  const domainObj = getDomain<TInput>(domain);
  const intensity = domainObj.mapToScale(value);
  return renderVisualState(intensity);
}

// ── Re-export only the types a component might need ──
// Never export implementation internals.

export type { VisualIntensity, VizDomainName, RenderedVisualState };

/**
 * Labels for each intensity level (tooltips, alt text, analytics).
 * Re-exported here so no one needs to import from core/.
 */
export { INTENSITY_LABELS } from "../visualization/core/types";

/**
 * Convenience: map a value directly to VisualIntensity.
 * Rarely needed. Prefer `useDesignViz()` in UI code.
 */
export { mapToVisualState } from "../visualization/core/mapper";
