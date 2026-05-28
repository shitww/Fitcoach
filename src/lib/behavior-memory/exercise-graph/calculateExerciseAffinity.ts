// ── Exercise Transition Affinity ──────────────────────────────────────────────
// Calculates how often exercises appear in the same session or in sequence.
// This is the "graph" affinity (co-occurrence), NOT the user preference affinity.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory } from '@/types/workout-memory';

export interface ExercisePairAffinity {
  exerciseA: string;
  exerciseB: string;
  coOccurrenceCount: number; // sessions containing both
  sequentialCount: number;   // times A immediately followed by B
  sequentialProbability: number; // sequentialCount / total sessions with A
  affinityScore: number;     // blended 0-1
}

/** Calculate pairwise affinity between exercises.
 *  Based on both co-occurrence (same session) and sequential transitions.
 */
export function calculateExerciseTransitionAffinities(
  sessions: readonly WorkoutSessionMemory[],
  minOccurrences: number = 2
): ExercisePairAffinity[] {
  const coOccurrence = new Map<string, number>();
  const sequential = new Map<string, number>();
  const sessionCountByExercise = new Map<string, number>();

  for (const session of sessions) {
    const exerciseIds = session.exercises.map(
      (e) => e.exerciseId || e.exerciseName
    );

    // Count sessions per exercise
    for (const id of exerciseIds) {
      sessionCountByExercise.set(id, (sessionCountByExercise.get(id) || 0) + 1);
    }

    // Co-occurrence: every pair in the same session
    for (let i = 0; i < exerciseIds.length; i++) {
      for (let j = i + 1; j < exerciseIds.length; j++) {
        const a = exerciseIds[i];
        const b = exerciseIds[j];
        const key = a < b ? `${a}::${b}` : `${b}::${a}`;
        coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1);
      }
    }

    // Sequential: consecutive pairs
    const sorted = [...session.exercises].sort((a, b) => a.orderIndex - b.orderIndex);
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i].exerciseId || sorted[i].exerciseName;
      const b = sorted[i + 1].exerciseId || sorted[i + 1].exerciseName;
      const key = `${a}::${b}`;
      sequential.set(key, (sequential.get(key) || 0) + 1);
    }
  }

  const results: ExercisePairAffinity[] = [];

  for (const [key, coCount] of coOccurrence) {
    if (coCount < minOccurrences) continue;

    const [a, b] = key.split('::');
    const seqKey = `${a}::${b}`;
    const seqCount = sequential.get(seqKey) || 0;
    const totalSessionsA = sessionCountByExercise.get(a) || 1;

    const seqProb = seqCount / totalSessionsA;
    // Co-occurrence Jaccard-like: coCount / (sessionsA + sessionsB - coCount)
    const sessionsB = sessionCountByExercise.get(b) || 1;
    const jaccard = coCount / (totalSessionsA + sessionsB - coCount);

    // Affinity = 60% sequential probability + 40% co-occurrence Jaccard
    const affinityScore = Math.round((seqProb * 0.6 + jaccard * 0.4) * 1000) / 1000;

    results.push({
      exerciseA: a,
      exerciseB: b,
      coOccurrenceCount: coCount,
      sequentialCount: seqCount,
      sequentialProbability: Math.round(seqProb * 1000) / 1000,
      affinityScore,
    });
  }

  return results.sort((a, b) => b.affinityScore - a.affinityScore);
}
