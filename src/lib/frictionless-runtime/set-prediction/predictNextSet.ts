// ── Predict Next Set ─────────────────────────────────────────────────────────
// Top-level entry point: given session context, predict the next set.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictedSetSuggestion,
  SetPredictionInput,
} from '@/types/frictionless-runtime';
import type { ExercisePerformanceSnapshot } from '@/types/workout-memory';
import { buildSetSuggestion } from './buildSetSuggestion';

export interface PredictNextSetInput {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  /** Completed sets in the current session for this exercise. */
  currentSessionSets: {
    weight: number;
    reps: number;
    rir: number | null;
    isFailure: boolean;
  }[];
  /** Historical performance snapshot (from Phase 2 memory). */
  snapshot: ExercisePerformanceSnapshot | undefined;
  fatigueEstimate: number; // 0-100
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
}

/** Main prediction entry point for a single upcoming set.
 *  Bridges Phase 2 memory + Phase 5 set prediction.
 */
export function predictNextSet(
  input: PredictNextSetInput
): PredictedSetSuggestion {
  const {
    exerciseId,
    exerciseName,
    setNumber,
    currentSessionSets,
    snapshot,
    fatigueEstimate,
    workoutStyle,
  } = input;

  // Build last session sets from snapshot
  const lastSessionSets = buildLastSessionSetsFromSnapshot(snapshot);

  // Build current session sets in correct format
  const previousSetsThisSession = currentSessionSets.map((s, i) => ({
    setNumber: i + 1,
    weight: s.weight,
    reps: s.reps,
    rir: s.rir,
    isFailure: s.isFailure,
    isPR: false,
    type: 'working' as const,
    performedAt: new Date().toISOString(),
  }));

  // Determine volume trend
  const volumeTrend = deriveVolumeTrend(snapshot);

  const predInput: SetPredictionInput = {
    exerciseId,
    exerciseName,
    setNumber,
    previousSetsThisSession,
    lastSessionSets,
    fatigueEstimate,
    workoutStyle,
    volumeTrend,
  };

  return buildSetSuggestion(predInput);
}

/** Shorthand: predict for repeat of the exact last set. */
export function predictRepeatSet(
  currentSessionSets: PredictNextSetInput['currentSessionSets']
): PredictedSetSuggestion | null {
  if (currentSessionSets.length === 0) return null;

  const last = currentSessionSets[currentSessionSets.length - 1];

  return {
    exerciseId: '',
    exerciseName: '',
    setNumber: currentSessionSets.length + 1,
    suggestedWeight: last.weight,
    suggestedReps: last.reps,
    suggestedRir: last.rir,
    confidence: 0.98,
    progressionType: 'same_as_last',
    reasoning: [
      {
        type: 'recent_history',
        text: `Repeat ${last.weight}kg × ${last.reps}`,
        confidence: 0.98,
      },
    ],
    delta: { weightDelta: 0, repsDelta: 0, label: 'Same as previous set' },
  };
}

function buildLastSessionSetsFromSnapshot(
  snapshot: ExercisePerformanceSnapshot | undefined
) {
  if (!snapshot || snapshot.lastWeight === 0) return [];

  return [
    {
      setNumber: 1,
      weight: snapshot.lastWeight,
      reps: snapshot.lastReps,
      rir: null,
      isFailure: false,
      isPR: false,
      type: 'working' as const,
      performedAt: snapshot.lastPerformedAt,
    },
  ];
}

function deriveVolumeTrend(
  snapshot: ExercisePerformanceSnapshot | undefined
): SetPredictionInput['volumeTrend'] {
  if (!snapshot) return 'insufficient_data';
  const trend = snapshot.volumeTrend;
  if (trend === 'up' || trend === 'down' || trend === 'stable') return trend;
  return 'insufficient_data';
}
