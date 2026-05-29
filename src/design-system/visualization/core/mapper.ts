// ═══════════════════════════════════════════════════════════════
// Universal Visual Mapper
//
// Single entry point for mapping ANY domain value to VisualIntensity.
//
// RULES:
// - NO domain-specific color logic
// - ONLY scale normalization
// - domain parameter is metadata only (used for tracing/debugging)
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity, VizDomain } from "./types";
import { normalizePercentile } from "./scale";

/**
 * Maps any numeric domain value to VisualIntensity.
 *
 * @param value — raw domain value (typically 0–100)
 * @param domain — domain name (metadata only, no logic branching)
 * @returns unified VisualIntensity (0–4)
 */
export function mapToVisualState(
  value: number,
  domain?: string,
): VisualIntensity {
  // In future, domain-specific custom thresholds could be registered
  // but the output must ALWAYS be VisualIntensity 0–4.
  // eslint-disable-next-line no-console
  if (domain && process.env.NODE_ENV === "development") {
    // trace only — no logic branching on domain name
    // eslint-disable-next-line no-console
    console.debug(`[VizMapper] ${domain}: ${value} → scale`);
  }

  return normalizePercentile(value);
}

/**
 * Executes a registered domain's mapper and returns VisualIntensity.
 *
 * @param domain — a VizDomain instance
 * @param input — domain-specific raw input
 */
export function executeDomainMap<TInput>(
  domain: VizDomain<TInput>,
  input: TInput,
): VisualIntensity {
  const result = domain.mapToScale(input);

  // Runtime safety: ensure output is always 0–4
  if (result < 0 || result > 4) {
    throw new Error(
      `Visualization Fragmentation: Domain "${domain.name}" returned invalid intensity ${result}. ` +
        `All domains MUST output VisualIntensity 0–4.`,
    );
  }

  return result;
}
