// ═══════════════════════════════════════════════════════════════
// Visualization Core Types
// UNIFIED PERCEPTUAL SCALE SYSTEM
//
// RULES:
// - VisualIntensity is the ONLY valid intensity abstraction
// - All domains MUST map to this scale
// - No color information in types
// - No domain-specific semantics in base types
// ═══════════════════════════════════════════════════════════════

/**
 * Universal visual intensity scale.
 *
 * 0 — inactive / resting / neutral
 * 1 — low / mild / easy
 * 2 — moderate / working / normal
 * 3 — high / intense / elevated
 * 4 — critical / max / extreme
 *
 * Every visualization domain MUST normalize to this scale.
 * No domain may define its own intensity levels.
 */
export type VisualIntensity = 0 | 1 | 2 | 3 | 4;

/**
 * Valid intensity values as an array for runtime iteration.
 */
export const VISUAL_INTENSITIES: VisualIntensity[] = [0, 1, 2, 3, 4];

/**
 * Label for each intensity level (for UI, analytics, tooltips).
 */
export const INTENSITY_LABELS: Record<VisualIntensity, string> = {
  0: "resting",
  1: "low",
  2: "moderate",
  3: "high",
  4: "critical",
};

/**
 * Every visualization domain must implement this interface.
 * The domain only provides a numeric mapping function.
 * Color, rendering, and visual expression are handled by the renderer.
 */
export interface VizDomain<TInput> {
  /** Unique domain name (kebab-case) */
  name: string;

  /** Maps raw domain value to unified VisualIntensity */
  mapToScale: (value: TInput) => VisualIntensity;
}

/**
 * Generic domain input type.
 * Domains may accept numbers, objects, or enums.
 */
export type DomainInput = number | { value: number };
