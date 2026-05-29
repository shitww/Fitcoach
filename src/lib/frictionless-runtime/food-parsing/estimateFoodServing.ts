// ── Estimate Food Serving ─────────────────────────────────────────────────────
// Extracts and interprets serving size indicators from natural language.
// ─────────────────────────────────────────────────────────────────────────────

export interface ServingEstimate {
  multiplier: number;    // how many servings
  unit: string;          // bowl, cup, piece, g, ml, etc.
  raw: string | null;    // original text that triggered the estimate
  confidence: number;
}

/** Chinese and English serving size patterns. */
const SERVING_PATTERNS: readonly { pattern: RegExp; unit: string; multiplier: number }[] = [
  // Quantities with units
  { pattern: /(\d+(?:\.\d+)?)\s*碗/,      unit: 'bowl',    multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*杯/,      unit: 'cup',     multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*份/,      unit: 'serving', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*片/,      unit: 'slice',   multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*个/,      unit: 'piece',   multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*块/,      unit: 'piece',   multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*g/i,      unit: 'g',       multiplier: 0.01 }, // per 100g
  { pattern: /(\d+(?:\.\d+)?)\s*gram/i,   unit: 'g',       multiplier: 0.01 },
  { pattern: /(\d+(?:\.\d+)?)\s*ml/i,     unit: 'ml',      multiplier: 0.01 },
  { pattern: /(\d+(?:\.\d+)?)\s*oz/i,     unit: 'oz',      multiplier: 0.28 },
  // English
  { pattern: /(\d+(?:\.\d+)?)\s*bowl/i,   unit: 'bowl',    multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*cup/i,    unit: 'cup',     multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*piece/i,  unit: 'piece',   multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*slice/i,  unit: 'slice',   multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*serving/i,unit: 'serving', multiplier: 1 },
  // Size qualifiers
  { pattern: /大\s*份|large/i,            unit: 'large',   multiplier: 1.4 },
  { pattern: /小\s*份|small/i,            unit: 'small',   multiplier: 0.7 },
  { pattern: /中\s*份|medium|regular/i,   unit: 'medium',  multiplier: 1.0 },
] as const;

/** Extract serving size estimate from a text snippet.
 *  Falls back to 1 serving if no indicator found.
 */
export function estimateFoodServing(
  text: string,
  defaultCalories: number
): {
  servingEstimate: ServingEstimate;
  adjustedCalories: number;
} {
  for (const { pattern, unit, multiplier } of SERVING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const qty = parseFloat(match[1] ?? '1');
      const effectiveMultiplier = unit === 'g' || unit === 'ml'
        ? (qty * multiplier) // grams: qty × 0.01 × per100g
        : qty * multiplier;

      return {
        servingEstimate: {
          multiplier: effectiveMultiplier,
          unit,
          raw: match[0],
          confidence: 0.85,
        },
        adjustedCalories: Math.round(defaultCalories * effectiveMultiplier),
      };
    }
  }

  return {
    servingEstimate: { multiplier: 1, unit: 'serving', raw: null, confidence: 0.7 },
    adjustedCalories: defaultCalories,
  };
}

/** Estimate total calories for a list of foods + servings. */
export function estimateTotalCalories(
  items: { baseCalories: number; servingMultiplier: number }[]
): number {
  return Math.round(
    items.reduce((sum, item) => sum + item.baseCalories * item.servingMultiplier, 0)
  );
}
