// ── Frequency Score Calculator ──────────────────────────────────────────────
// Deterministic frequency scoring with time-decayed weights.
// ─────────────────────────────────────────────────────────────────────────────

export interface FrequencyOptions {
  /** Lookback window in days. Default: 90. */
  lookbackDays?: number;
  /** Time-decay half-life in days. Default: 30. */
  halfLifeDays?: number;
  /** Normalization target: score = 1.0 at this count. Default: 10. */
  normalizationTarget?: number;
}

/** Calculate a time-decayed frequency score.
 *  More recent occurrences count more.
 *  Score saturates at ~1.0 after normalizationTarget occurrences.
 */
export function calculateFrequencyScore(
  dates: readonly string[],
  options: FrequencyOptions = {}
): number {
  const {
    lookbackDays = 90,
    halfLifeDays = 30,
    normalizationTarget = 10,
  } = options;

  const now = Date.now();
  const cutoff = now - lookbackDays * 86_400_000;

  let weightedCount = 0;
  for (const dateStr of dates) {
    const time = new Date(dateStr).getTime();
    if (time < cutoff) continue;

    const daysAgo = (now - time) / 86_400_000;
    const decay = Math.pow(0.5, daysAgo / halfLifeDays);
    weightedCount += decay;
  }

  // Normalize: hyperbolic saturation so it approaches 1.0
  const score = weightedCount / (weightedCount + normalizationTarget / 2);
  return Math.round(score * 1000) / 1000;
}

/** Batch frequency scoring. */
export function calculateFrequencyScores<
  T extends { id: string; dates: string[] }
>(
  items: readonly T[],
  options?: FrequencyOptions
): { id: string; score: number; rawCount: number; weightedCount: number }[] {
  return items.map((item) => {
    const filtered = item.dates.filter((d) => {
      const lookback = (options?.lookbackDays ?? 90) * 86_400_000;
      return Date.now() - new Date(d).getTime() <= lookback;
    });
    return {
      id: item.id,
      score: calculateFrequencyScore(item.dates, options),
      rawCount: filtered.length,
      weightedCount: Math.round(
        filtered.reduce((sum, d) => {
          const daysAgo = (Date.now() - new Date(d).getTime()) / 86_400_000;
          return sum + Math.pow(0.5, daysAgo / (options?.halfLifeDays ?? 30));
        }, 0) * 100
      ) / 100,
    };
  });
}
