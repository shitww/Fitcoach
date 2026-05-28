// ── Generate One-Tap Workout ───────────────────────────────────────────────
// Creates a complete ready-to-start workout from a quick-start suggestion.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickStartSuggestion, OneTapWorkout, PredictionReason } from '@/types/predictive-flow';
import type { SuggestedExerciseQueue } from '@/types/predictive-flow';

export interface OneTapInput {
  suggestion: QuickStartSuggestion;
  queue: SuggestedExerciseQueue | null;
}

/** Generate a concrete OneTapWorkout from a suggestion + queue. */
export function generateOneTapWorkout(input: OneTapInput): OneTapWorkout {
  const { suggestion, queue } = input;

  const exercises =
    queue?.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.exerciseName,
      sets: ex.estimatedSets,
      weightHint:
        ex.estimatedStartingWeight !== null
          ? `${ex.estimatedStartingWeight}kg`
          : null,
    })) || [];

  const reasoning: PredictionReason[] = [
    {
      type: 'pattern_match',
      text: `Started from ${suggestion.label}`,
      confidence: suggestion.confidence,
    },
  ];

  if (queue) {
    reasoning.push({
      type: 'muscle_balance',
      text: `Queue covers ${queue.totalExercises} exercises`,
      confidence: 0.85,
    });
  }

  return {
    title: suggestion.label,
    subtitle: suggestion.subtitle,
    exercises,
    estimatedDurationMin: suggestion.estimatedDurationMin,
    warmupFlows: [],
    reasoning,
  };
}
