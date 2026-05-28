// ── Next Likely Exercises ─────────────────────────────────────────────────────
// Given a current exercise, predict what the user typically does next.
// Based purely on the transition graph — no ML.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ExerciseTransitionGraph,
  ExerciseTransition,
} from '@/types/workout-memory';

export interface LikelyNextExercise {
  exerciseId: string;
  probability: number;
  count: number;
  lastObservedAt: string;
}

/** Get the most likely next exercises after the given one. */
export function getNextLikelyExercises(
  graph: ExerciseTransitionGraph,
  currentExerciseId: string,
  limit: number = 5
): LikelyNextExercise[] {
  const transitions = graph.edges[currentExerciseId] || [];
  return transitions.slice(0, limit).map((t) => ({
    exerciseId: t.toExerciseId,
    probability: t.probability,
    count: t.count,
    lastObservedAt: t.lastObservedAt,
  }));
}

/** Get likely exercises at a specific position in a workout
 *  by looking at what the user typically does N exercises after a starter.
 */
export function getLikelyExercisesAtPosition(
  graph: ExerciseTransitionGraph,
  starterExerciseId: string,
  depth: number, // how many transitions away
  limit: number = 5
): LikelyNextExercise[] {
  // BFS-like walk through the graph up to depth transitions
  let current: Map<string, { probability: number; count: number; lastAt: string }> =
    new Map();
  current.set(starterExerciseId, { probability: 1, count: 0, lastAt: '' });

  for (let i = 0; i < depth; i++) {
    const next = new Map<string, { probability: number; count: number; lastAt: string }>();
    for (const [fromId, data] of current) {
      const transitions = graph.edges[fromId] || [];
      for (const t of transitions) {
        const existing = next.get(t.toExerciseId);
        const newProb = data.probability * t.probability;
        if (!existing || newProb > existing.probability) {
          next.set(t.toExerciseId, {
            probability: newProb,
            count: t.count,
            lastAt: t.lastObservedAt,
          });
        }
      }
    }
    current = next;
  }

  const results = Array.from(current.entries())
    .filter(([id]) => id !== starterExerciseId)
    .map(([exerciseId, data]) => ({
      exerciseId,
      probability: Math.round(data.probability * 1000) / 1000,
      count: data.count,
      lastObservedAt: data.lastAt,
    }))
    .sort((a, b) => b.probability - a.probability);

  return results.slice(0, limit);
}

/** Find the most common "starter" exercises (first in a session). */
export function getCommonStarters(
  graph: ExerciseTransitionGraph,
  limit: number = 5
): { exerciseId: string; frequency: number }[] {
  const starters = new Map<string, number>();

  for (const transitions of Object.values(graph.edges)) {
    for (const t of transitions) {
      starters.set(t.fromExerciseId, (starters.get(t.fromExerciseId) || 0) + t.count);
    }
  }

  // Also consider exercises that have no incoming edges as potential starters
  const allTargets = new Set<string>();
  for (const transitions of Object.values(graph.edges)) {
    for (const t of transitions) allTargets.add(t.toExerciseId);
  }

  return Array.from(starters.entries())
    .map(([exerciseId, frequency]) => ({ exerciseId, frequency: Math.round(frequency) }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}
