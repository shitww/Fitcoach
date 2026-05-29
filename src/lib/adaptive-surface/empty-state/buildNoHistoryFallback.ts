// ── Build No History Fallback ─────────────────────────────────────────────────
// Fallback content when behavior memory has no useful signals.
// ─────────────────────────────────────────────────────────────────────────────

import type { ExerciseRecommendationCard, SurfaceAction } from '@/types/adaptive-surface';

export interface NoHistoryFallbackExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
  category: string;
}

/** Generate default recommendation cards when no user history exists.
 *  Uses popularity + taxonomy to create sensible defaults.
 */
export function buildNoHistoryFallback(
  exercises: readonly NoHistoryFallbackExercise[],
  focusArea: 'upper' | 'lower' | 'fullbody' | null
): ExerciseRecommendationCard[] {
  const scored = exercises.map((ex) => ({
    ex,
    score: calculateDefaultScore(ex, focusArea),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((item, index) => ({
    cardId: `fallback_${item.ex.exerciseId}`,
    exerciseId: item.ex.exerciseId,
    exerciseName: item.ex.exerciseName,
    muscleGroup: item.ex.muscleGroup,
    score: item.score,
    confidence: 0.5,
    prominence: index === 0 ? 'primary' : 'secondary',
    scoreLabel: index === 0 ? 'Popular Pick' : 'Great Start',
    reasoning: [
      {
        type: 'pattern_match',
        text: 'Commonly chosen by new users',
        confidence: 0.5,
      },
    ],
    metadata: {
      lastWeight: null,
      lastDate: null,
      frequency30d: 0,
      recoveryScore: 100,
      transitionProbability: null,
    },
    primaryAction: {
      id: `fallback_start_${item.ex.exerciseId}`,
      label: 'Start',
      icon: 'play',
      variant: 'filled',
      priority: index === 0 ? 'primary' : 'secondary',
      enabled: true,
    },
    secondaryActions: [],
  }));
}

function calculateDefaultScore(
  ex: NoHistoryFallbackExercise,
  focusArea: 'upper' | 'lower' | 'fullbody' | null
): number {
  let score = 0.5;

  // Compound movements score higher
  if (ex.movementPattern === 'squat' || ex.movementPattern === 'horizontal_push' || ex.movementPattern === 'vertical_pull') {
    score += 0.2;
  }

  // Focus area match
  if (focusArea) {
    const focusMuscles: Record<string, string[]> = {
      upper: ['chest', 'back', 'shoulders', 'arms'],
      lower: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'legs'],
      fullbody: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    };
    if (focusMuscles[focusArea]?.includes(ex.muscleGroup)) {
      score += 0.15;
    }
  }

  // Strength category bias for defaults
  if (ex.category === 'strength') score += 0.1;

  return Math.min(1, Math.round(score * 100) / 100);
}
