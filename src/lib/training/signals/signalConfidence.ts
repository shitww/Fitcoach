// ── FitCoach Phase 3 — Signal Confidence System ───────────────────────────
// Computes confidence scores for signals based on data quality.
// 0 = unreliable, 1 = highly reliable.

import type { ExerciseHistory, UserTrainingContext } from '../trainingTypes';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Compute overall confidence for a set of exercise histories + user context.
 * Factors:
 *   - total session count
 *   - data continuity (gaps)
 *   - per-exercise session depth
 *   - recency of data
 */
export function computeOverallConfidence(
  histories: ExerciseHistory[],
  context: UserTrainingContext
): number {
  const scores: number[] = [];

  // 1. Data volume score
  const totalSessions = histories.reduce((s, h) => s + h.sessions.length, 0);
  scores.push(clamp01(totalSessions / 20)); // 20+ sessions = full score

  // 2. Continuity score (no big gaps in last 14 days)
  scores.push(computeContinuityScore(context));

  // 3. Per-exercise depth (at least 3 sessions per tracked exercise)
  const depthScore =
    histories.length === 0
      ? 0
      : histories.filter((h) => h.sessions.length >= 3).length / histories.length;
  scores.push(depthScore);

  // 4. Recency score (data within last 7 days)
  scores.push(computeRecencyScore(histories));

  // Weighted average: volume matters most, then depth, then continuity, then recency
  const weights = [0.35, 0.25, 0.25, 0.15];
  const weighted = scores.reduce((s, v, i) => s + v * weights[i], 0);
  return round2(weighted);
}

/**
 * Compute confidence for a single exercise history.
 */
export function computeExerciseConfidence(history: ExerciseHistory): number {
  const scores: number[] = [];

  // Session count
  scores.push(clamp01(history.sessions.length / 6));

  // No big gaps (>14 days between sessions)
  let gapCount = 0;
  for (let i = 1; i < history.sessions.length; i++) {
    const prev = new Date(history.sessions[i - 1].date).getTime();
    const curr = new Date(history.sessions[i].date).getTime();
    const daysGap = (curr - prev) / (1000 * 60 * 60 * 24);
    if (daysGap > 14) gapCount++;
  }
  scores.push(clamp01(1 - gapCount / Math.max(history.sessions.length - 1, 1)));

  // Consistency (low stddev in volume)
  if (history.sessions.length >= 3) {
    const volumes = history.sessions.map((s) => s.totalVolume);
    const avg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance =
      volumes.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / volumes.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
    scores.push(clamp01(1 - cv)); // lower CV = higher confidence
  } else {
    scores.push(0);
  }

  return round2(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * Adjust a base confidence by a factor.
 */
export function adjustConfidence(base: number, factor: number): number {
  return round2(clamp01(base * factor));
}

// ── Internal ───────────────────────────────────────────────────────────────

function computeContinuityScore(context: UserTrainingContext): number {
  const recent = context.recentWorkouts;
  if (recent.length < 2) return 0;

  // Check for gaps in last 14 days
  const dates = recent.map((w) => new Date(w.date).getTime()).sort((a, b) => a - b);
  const now = Date.now();
  const lastWorkout = dates[dates.length - 1];
  const daysSinceLast = (now - lastWorkout) / (1000 * 60 * 60 * 24);

  // Penalize if last workout was >7 days ago
  const recencyPenalty = daysSinceLast > 7 ? 0.3 : 1;

  // Check internal gaps
  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const gap = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    if (gap > maxGap) maxGap = gap;
  }
  const gapPenalty = maxGap > 7 ? 0.5 : maxGap > 3 ? 0.8 : 1;

  return clamp01(recencyPenalty * gapPenalty);
}

function computeRecencyScore(histories: ExerciseHistory[]): number {
  if (histories.length === 0) return 0;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const hasRecent = histories.some((h) =>
    h.sessions.some((s) => new Date(s.date).getTime() >= sevenDaysAgo)
  );

  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const hasSemiRecent = histories.some((h) =>
    h.sessions.some((s) => new Date(s.date).getTime() >= fourteenDaysAgo)
  );

  if (hasRecent) return 1;
  if (hasSemiRecent) return 0.5;
  return 0.2;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
