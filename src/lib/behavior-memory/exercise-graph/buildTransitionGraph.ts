// ── Exercise Transition Graph Builder ───────────────────────────────────────
// Builds a directed graph of exercise transitions from session order.
// Deterministic, frequency-weighted, recency-weighted.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutSessionMemory,
  ExerciseTransitionGraph,
  ExerciseTransition,
} from '@/types/workout-memory';

/** Half-life for recency weighting in days.
 *  Older transitions decay exponentially.
 */
const RECENCY_HALFLIFE_DAYS = 30;

/** Build the transition graph from session history.
 *  For each session, we create edges between consecutive exercises.
 *  Weight = count * recencyDecay.
 */
export function buildTransitionGraph(
  userId: string,
  sessions: readonly WorkoutSessionMemory[]
): ExerciseTransitionGraph {
  const rawEdges = new Map<string, Map<string, { count: number; lastAt: string }>>();
  const now = Date.now();

  for (const session of sessions) {
    const exercises = [...session.exercises].sort((a, b) => a.orderIndex - b.orderIndex);
    const sessionTime = new Date(session.date).getTime();
    const daysAgo = Math.max(0, (now - sessionTime) / 86_400_000);
    const recencyWeight = Math.pow(0.5, daysAgo / RECENCY_HALFLIFE_DAYS);

    for (let i = 0; i < exercises.length - 1; i++) {
      const from = exercises[i];
      const to = exercises[i + 1];
      const fromId = from.exerciseId || from.exerciseName;
      const toId = to.exerciseId || to.exerciseName;

      if (!rawEdges.has(fromId)) {
        rawEdges.set(fromId, new Map());
      }
      const toMap = rawEdges.get(fromId)!;

      const existing = toMap.get(toId);
      if (existing) {
        existing.count += recencyWeight;
        if (session.date > existing.lastAt) existing.lastAt = session.date;
      } else {
        toMap.set(toId, { count: recencyWeight, lastAt: session.date });
      }
    }
  }

  // Convert to normalized probabilities
  const edges: Record<string, ExerciseTransition[]> = {};
  let totalTransitions = 0;

  for (const [fromId, toMap] of rawEdges) {
    const totalWeight = Array.from(toMap.values()).reduce((s, v) => s + v.count, 0);
    const transitions: ExerciseTransition[] = [];

    for (const [toId, data] of toMap) {
      transitions.push({
        fromExerciseId: fromId,
        toExerciseId: toId,
        count: Math.round(data.count * 100) / 100,
        probability: Math.round((data.count / totalWeight) * 1000) / 1000,
        lastObservedAt: data.lastAt,
      });
    }

    // Sort by probability descending
    transitions.sort((a, b) => b.probability - a.probability);
    edges[fromId] = transitions;
    totalTransitions += totalWeight;
  }

  return {
    userId,
    edges,
    totalTransitions: Math.round(totalTransitions),
    lastUpdatedAt: new Date().toISOString(),
  };
}
