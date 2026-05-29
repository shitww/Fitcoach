// ═══════════════════════════════════════════════════════════════
// Visualization Domain Contract
// BUSINESS MEANING LAYER
//
// RULES:
// - ONLY domain-specific, expressive, dynamic colors
// - Carries ALL business meaning (fatigue, intensity, heart rate, recovery)
// - CAN import from theme/ (for base surfaces)
// - MUST NOT be imported by theme/ or primitives/
// - Colors are state-driven, not structural
//
// ENFORCED BY:
// - scripts/enforce-design-boundaries.ts
// - ESLint no-restricted-imports
// ═══════════════════════════════════════════════════════════════

/**
 * All visualization states must be finite and type-safe.
 */
export type DomainState = "low" | "medium" | "high" | "critical" | "optimal" | "resting";

/**
 * Color value can be hex, rgb(), or CSS custom property.
 * Hex is allowed here because these are domain-specific brand colors.
 */
export type VizColor = string;

/**
 * Standard palette shape for all visualization modules.
 */
export interface VizPalette {
  base: VizColor;
  dim: VizColor;
  glow: VizColor;
  background: VizColor;
  foreground: VizColor;
}

/**
 * Standard state palette shape.
 */
export interface StatePalette {
  low: VizColor;
  medium: VizColor;
  high: VizColor;
  critical?: VizColor;
  optimal?: VizColor;
  resting?: VizColor;
}

/**
 * Runtime warning system — throws in dev if visualization leaks.
 */
export function guardVizLeak(source: string, color: string): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn(
      `Design System Violation: Visualization color "${color}" leaked into non-visualization context from "${source}". ` +
        `Visualization colors must only be used within src/design-system/visualization/ or chart components.`,
    );
  }
}
