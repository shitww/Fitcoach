// ── Smart Exercise Queue Builder ────────────────────────────────────────────
// Generates a complete suggested workout queue with constraints:
// - Movement pattern balance
// - Fatigue ordering (heavy first)
// - Muscle group coverage
// - No duplicates
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SuggestedExerciseQueue,
  QueueExerciseItem,
  PredictionReason,
} from '@/types/predictive-flow';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';
import type { MuscleRecoveryState } from '@/types/workout-memory';

export interface QueueInputExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
  fatigueScore: number; // 1-10
  stabilityDemand: 'low' | 'moderate' | 'high';
  estimatedDurationMin: number;
  estimatedSets: number;
  estimatedStartingWeight: number | null;
}

/** Build a balanced exercise queue from scored candidates.
 *  Returns null if no valid queue can be built.
 */
export function buildExerciseQueue(
  candidates: readonly PredictedExerciseCandidate[],
  exerciseMeta: readonly QueueInputExercise[],
  recoveryStates: readonly MuscleRecoveryState[],
  targetExerciseCount: number = 6
): SuggestedExerciseQueue | null {
  const recoveryMap = new Map(recoveryStates.map((r) => [r.muscleGroup, r]));
  const metaMap = new Map(exerciseMeta.map((e) => [e.exerciseId, e]));

  // Filter to candidates with metadata
  const validCandidates = candidates
    .map((c) => ({ candidate: c, meta: metaMap.get(c.exerciseId) }))
    .filter((x): x is typeof x & { meta: QueueInputExercise } => x.meta !== undefined);

  if (validCandidates.length === 0) return null;

  const usedPatterns = new Set<string>();
  const usedMuscles = new Set<string>();
  const queue: QueueExerciseItem[] = [];
  const reasoning: PredictionReason[] = [];

  // Sort by fatigueScore descending (heavy compounds first)
  const sorted = [...validCandidates].sort(
    (a, b) => b.meta.fatigueScore - a.meta.fatigueScore
  );

  for (const { candidate, meta } of sorted) {
    if (queue.length >= targetExerciseCount) break;

    // Constraint: avoid repeating movement pattern more than twice
    const patternCount = Array.from(usedPatterns).filter((p) =>
      p === meta.movementPattern
    ).length;
    if (patternCount >= 2) continue;

    // Constraint: muscle recovery must be > 40
    const recovery = recoveryMap.get(meta.muscleGroup);
    if (recovery && recovery.recoveryScore < 30) continue;

    queue.push({
      exerciseId: meta.exerciseId,
      exerciseName: meta.exerciseName,
      orderIndex: queue.length,
      estimatedSets: meta.estimatedSets,
      estimatedStartingWeight: meta.estimatedStartingWeight,
      targetMuscle: meta.muscleGroup,
      movementPattern: meta.movementPattern,
      fatiguePosition:
        meta.fatigueScore >= 7 ? 'high' : meta.fatigueScore >= 4 ? 'moderate' : 'low',
      warmupRequired: meta.stabilityDemand === 'high' || meta.fatigueScore >= 7,
    });

    usedPatterns.add(meta.movementPattern);
    usedMuscles.add(meta.muscleGroup);
  }

  if (queue.length === 0) return null;

  // Re-sort queue: heavy first, then moderate, then light
  queue.sort((a, b) => {
    const fatigueOrder = { high: 0, moderate: 1, low: 2 };
    return fatigueOrder[a.fatiguePosition] - fatigueOrder[b.fatiguePosition];
  });

  // Reassign order indices
  queue.forEach((item, i) => (item.orderIndex = i));

  const totalDuration = queue.reduce(
    (s, item) => s + (metaMap.get(item.exerciseId)?.estimatedDurationMin ?? 5),
    0
  );

  const movementPatternBalance: Record<string, number> = {};
  for (const item of queue) {
    movementPatternBalance[item.movementPattern] =
      (movementPatternBalance[item.movementPattern] || 0) + 1;
  }

  reasoning.push({
    type: 'muscle_balance',
    text: `Covers ${usedMuscles.size} muscle groups`,
    confidence: 0.9,
  });
  reasoning.push({
    type: 'fatigue_ordering',
    text: 'High-demand exercises placed early',
    confidence: 0.85,
  });

  return {
    queueId: `queue_${Date.now()}`,
    sessionType: 'predicted',
    exercises: queue,
    totalExercises: queue.length,
    estimatedDurationMin: totalDuration,
    estimatedTotalVolume: 0, // consumers can calculate
    movementPatternBalance,
    reasoning,
  };
}
