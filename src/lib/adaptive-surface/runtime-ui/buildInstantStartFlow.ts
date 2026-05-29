// ── Build Instant Start Flow ─────────────────────────────────────────────────
// Bypasses all setup: user taps once, workout begins immediately.
// ─────────────────────────────────────────────────────────────────────────────

import type { OneTapWorkout, PredictionReason } from '@/types/predictive-flow';
import type { PredictedWorkoutSession, PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface InstantStartInput {
  sessionType: string;
  candidates: readonly PredictedExerciseCandidate[];
  estimatedDurationMin: number;
  warmupRequired: boolean;
}

/** Build an instant-start workout that requires zero configuration.
 *  Uses Phase 3 predictions to pre-fill everything.
 */
export function buildInstantStartFlow(
  input: InstantStartInput
): OneTapWorkout {
  const { sessionType, candidates, estimatedDurationMin, warmupRequired } = input;

  const exercises = candidates.slice(0, 6).map((c) => ({
    exerciseId: c.exerciseId,
    name: c.exerciseName,
    sets: c.estimatedSets ?? 3,
    weightHint: c.estimatedStartingWeight !== null ? `${c.estimatedStartingWeight}kg` : null,
  }));

  const reasoning: PredictionReason[] = [
    {
      type: 'pattern_match',
      text: `Instant ${sessionType} session`,
      confidence: 0.85,
    },
  ];

  if (warmupRequired) {
    reasoning.push({
      type: 'training_style',
      text: 'Warmup recommended for stability',
      confidence: 0.7,
    });
  }

  return {
    title: `${capitalize(sessionType)} — Instant Start`,
    subtitle: `${exercises.length} exercises · ${estimatedDurationMin} min`,
    exercises,
    estimatedDurationMin,
    warmupFlows: [],
    reasoning,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
