// ── Prioritize Recommendations ────────────────────────────────────────────────
// Filters and ranks recommendation cards to avoid UI overload.
// ─────────────────────────────────────────────────────────────────────────────

import type { ExerciseRecommendationCard } from '@/types/adaptive-surface';

export interface PrioritizationConfig {
  maxCards: number;
  minConfidence: number;
  maxPerMuscleGroup: number;
  preferVariety: boolean;
}

const DEFAULT_CONFIG: PrioritizationConfig = {
  maxCards: 5,
  minConfidence: 0.35,
  maxPerMuscleGroup: 2,
  preferVariety: true,
};

/** Prioritize and filter recommendation cards for display.
 *  Ensures the user never sees an overwhelming number of suggestions.
 */
export function prioritizeRecommendations(
  cards: readonly ExerciseRecommendationCard[],
  config: Partial<PrioritizationConfig> = {}
): ExerciseRecommendationCard[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // 1. Filter by minimum confidence
  let filtered = cards.filter((c) => c.confidence >= cfg.minConfidence);

  // 2. Deduplicate by exerciseId
  const seen = new Set<string>();
  filtered = filtered.filter((c) => {
    if (seen.has(c.exerciseId)) return false;
    seen.add(c.exerciseId);
    return true;
  });

  // 3. Sort by composite score (score * confidence weight)
  filtered = [...filtered].sort(
    (a, b) => b.score * b.confidence - a.score * a.confidence
  );

  // 4. Cap per muscle group if variety is preferred
  if (cfg.preferVariety) {
    const muscleCounts = new Map<string, number>();
    const varied: ExerciseRecommendationCard[] = [];

    for (const card of filtered) {
      const mg = card.muscleGroup || 'unknown';
      const count = muscleCounts.get(mg) || 0;
      if (count < cfg.maxPerMuscleGroup) {
        varied.push(card);
        muscleCounts.set(mg, count + 1);
      }
    }
    filtered = varied;
  }

  // 5. Cap total cards
  return filtered.slice(0, cfg.maxCards);
}
