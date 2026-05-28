// ── Personalized Ranking Engine ─────────────────────────────────────────────
// Blends recency, frequency, affinity, and recovery into explainable rankings.
// No AI. Deterministic, lightweight, local-first.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RankedItem,
  RankingBasis,
  MuscleRecoveryState,
  UserExerciseAffinity,
} from '@/types/workout-memory';
import { calculateRecencyScore } from './calculateRecencyScore';
import { calculateFrequencyScore } from './calculateFrequencyScore';

// Default weights — can be tuned per user preference
const DEFAULT_WEIGHTS = {
  frequency: 0.30,
  recency: 0.25,
  affinity: 0.20,
  recovery: 0.15,
  pattern: 0.10,
};

export interface RankingWeights {
  frequency: number;
  recency: number;
  affinity: number;
  recovery: number;
  pattern: number;
}

export interface RankableExercise {
  id: string;
  name: string;
  muscleGroup: string;
  lastPerformedAt: string;
  performanceDates: string[];
  affinityScore?: number;
}

/** Build a personalized ranking of exercises.
 *  Each score is explainable via RankingBasis.
 */
export function buildPersonalizedExerciseRanking(
  exercises: readonly RankableExercise[],
  recoveryStates: readonly MuscleRecoveryState[],
  affinities: readonly UserExerciseAffinity[],
  weights: RankingWeights = DEFAULT_WEIGHTS
): RankedItem<RankableExercise>[] {
  const recoveryMap = new Map(recoveryStates.map((r) => [r.muscleGroup, r]));
  const affinityMap = new Map(affinities.map((a) => [a.exerciseId, a]));

  const results: RankedItem<RankableExercise>[] = [];

  for (const ex of exercises) {
    const basis: RankingBasis[] = [];

    // Frequency score
    const freqScore = calculateFrequencyScore(ex.performanceDates, {
      lookbackDays: 90,
      halfLifeDays: 30,
      normalizationTarget: 10,
    });
    basis.push({
      factor: 'frequency',
      score: freqScore,
      explanation: `Logged ${ex.performanceDates.length} times`,
    });

    // Recency score
    const recScore = ex.lastPerformedAt
      ? calculateRecencyScore(ex.lastPerformedAt, { halfLifeDays: 14 })
      : 0;
    basis.push({
      factor: 'recency',
      score: recScore,
      explanation: ex.lastPerformedAt
        ? `Last used ${daysAgo(ex.lastPerformedAt)} days ago`
        : 'Never used',
    });

    // Affinity score
    const affinity = affinityMap.get(ex.id);
    const affinityScore = affinity?.overallScore ?? 0;
    basis.push({
      factor: 'affinity',
      score: affinityScore,
      explanation: affinity
        ? `User affinity rank #${affinity.rank}`
        : 'No affinity data',
    });

    // Recovery score
    const recovery = recoveryMap.get(ex.muscleGroup);
    const recoveryScore = recovery ? recovery.recoveryScore / 100 : 1.0;
    basis.push({
      factor: 'recovery',
      score: recoveryScore,
      explanation: recovery
        ? `${ex.muscleGroup} recovery: ${recovery.status} (${recovery.recoveryScore})`
        : 'No recovery data',
    });

    // Pattern score (placeholder: higher if part of a known transition)
    const patternScore = affinity?.consistencyScore ?? 0.2;
    basis.push({
      factor: 'pattern',
      score: patternScore,
      explanation: patternScore > 0.5 ? 'Consistent usage pattern' : 'Variable usage',
    });

    // Weighted total
    const totalScore =
      basis[0].score * weights.frequency +
      basis[1].score * weights.recency +
      basis[2].score * weights.affinity +
      basis[3].score * weights.recovery +
      basis[4].score * weights.pattern;

    results.push({
      item: ex,
      totalScore: Math.round(totalScore * 1000) / 1000,
      basis,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

/** Build a personalized food ranking. Simpler: frequency + recency only. */
export interface RankableFood {
  id: string;
  name: string;
  lastLoggedAt: string;
  logDates: string[];
  mealTypeMatch?: boolean;
}

export function buildPersonalizedFoodRanking(
  foods: readonly RankableFood[]
): RankedItem<RankableFood>[] {
  const results: RankedItem<RankableFood>[] = [];

  for (const food of foods) {
    const basis: RankingBasis[] = [];

    const freqScore = calculateFrequencyScore(food.logDates);
    basis.push({
      factor: 'frequency',
      score: freqScore,
      explanation: `Logged ${food.logDates.length} times`,
    });

    const recScore = food.lastLoggedAt
      ? calculateRecencyScore(food.lastLoggedAt, { halfLifeDays: 7 })
      : 0;
    basis.push({
      factor: 'recency',
      score: recScore,
      explanation: food.lastLoggedAt
        ? `Last logged ${daysAgo(food.lastLoggedAt)} days ago`
        : 'Never logged',
    });

    const patternBonus = food.mealTypeMatch ? 0.2 : 0;
    if (patternBonus > 0) {
      basis.push({
        factor: 'pattern',
        score: patternBonus,
        explanation: 'Matches current meal type',
      });
    }

    const totalScore = freqScore * 0.5 + recScore * 0.4 + patternBonus;

    results.push({
      item: food,
      totalScore: Math.round(totalScore * 1000) / 1000,
      basis,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

function daysAgo(dateStr: string): number {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86_400_000;
  return Math.max(0, Math.round(days));
}
