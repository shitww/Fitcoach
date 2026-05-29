// ═══════════════════════════════════════════════════════════════
// Visualization Registry
// ANTI-FRAGMENTATION SYSTEM
//
// All visualization domains MUST register here.
// This ensures every domain uses the unified scale system.
//
// RULES:
// - All domains implement VizDomain<T>
// - No domain may export its own palette
// - No domain may export its own renderer
// - Color is centralized in core/renderer.ts
// ═══════════════════════════════════════════════════════════════

import type { VizDomain } from "./core";
import {
  fatigueDomain,
  intensityDomain,
  heartRateDomain,
  recoveryDomain,
} from "./domains";

/**
 * Registry of all visualization domains.
 * New domains MUST be added here.
 */
export const vizRegistry = {
  fatigue: fatigueDomain,
  intensity: intensityDomain,
  "heart-rate": heartRateDomain,
  recovery: recoveryDomain,
} as const;

export type VizDomainName = keyof typeof vizRegistry;

/**
 * Ordered list for iteration (e.g., health dashboard).
 */
export const VIZ_DOMAIN_NAMES: VizDomainName[] = [
  "fatigue",
  "intensity",
  "heart-rate",
  "recovery",
];

/**
 * Retrieves a registered domain by name.
 * Throws if domain is not registered — prevents typos and unregistered domains.
 */
export function getDomain<TInput>(
  name: VizDomainName,
): VizDomain<TInput> {
  const domain = vizRegistry[name];
  if (!domain) {
    throw new Error(
      `Visualization Fragmentation: Domain "${name}" is not registered. ` +
        `All domains must be added to vizRegistry in registry.ts.`,
    );
  }
  return domain as VizDomain<TInput>;
}

/**
 * Executes a domain mapper and renders the result.
 * This is the RECOMMENDED way for UI components to consume visualization.
 *
 * @example
 *   const visual = useViz("fatigue", 75); // → RenderedVisualState
 */
export function useViz<TInput>(
  name: VizDomainName,
  input: TInput,
) {
  const { renderVisualState } = require("./core/renderer");
  const domain = getDomain<TInput>(name);
  const intensity = domain.mapToScale(input);
  return renderVisualState(intensity);
}
