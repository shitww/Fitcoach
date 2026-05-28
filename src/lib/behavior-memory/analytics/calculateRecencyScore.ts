// ── Recency Score Calculator ────────────────────────────────────────────────
// Deterministic recency scoring for ranking algorithms.
// Exponential decay: newer = higher score.
// ─────────────────────────────────────────────────────────────────────────────

/** Options for recency scoring. */
export interface RecencyOptions {
  /** Lookback window in days. Default: 90. */
  lookbackDays?: number;
  /** Half-life in days — after this period, score is 0.5. Default: 14. */
  halfLifeDays?: number;
  /** Floor value (minimum score). Default: 0.01. */
  floor?: number;
}

/** Calculate recency score for a single date.
 *  Returns 1.0 for today, decaying exponentially.
 */
export function calculateRecencyScore(
  lastDate: string,
  options: RecencyOptions = {}
): number {
  const { lookbackDays = 90, halfLifeDays = 14, floor = 0.01 } = options;

  const now = Date.now();
  const lastTime = new Date(lastDate).getTime();
  const daysAgo = (now - lastTime) / 86_400_000;

  if (daysAgo > lookbackDays) return 0;
  if (daysAgo <= 0) return 1;

  // Exponential decay: score = 0.5^(daysAgo / halfLife)
  const score = Math.pow(0.5, daysAgo / halfLifeDays);
  return Math.max(floor, Math.round(score * 1000) / 1000);
}

/** Batch recency scoring for multiple items. */
export function calculateRecencyScores<T extends { id: string; lastDate: string }>(
  items: readonly T[],
  options?: RecencyOptions
): { id: string; score: number; daysAgo: number }[] {
  const now = Date.now();
  return items.map((item) => {
    const daysAgo = (now - new Date(item.lastDate).getTime()) / 86_400_000;
    return {
      id: item.id,
      score: calculateRecencyScore(item.lastDate, options),
      daysAgo: Math.round(daysAgo),
    };
  });
}
