// ── On Workout Completed ────────────────────────────────────────────────────
// Incrementally updates behavior memory when a workout finishes.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutSessionMemory,
  BehaviorMemorySnapshot,
  UserWorkoutMemory,
  MemoryWorkoutExercise,
} from '@/types/workout-memory';
import { buildWorkoutMemory } from '../workout-memory/buildWorkoutMemory';
import { buildTransitionGraph } from '../exercise-graph/buildTransitionGraph';
import { buildRecoverySnapshot } from '../workout-memory/getMuscleRecoveryState';

/** Incrementally update workout memory with a newly completed session.
 *  Avoids full rebuild by appending and updating derived structures.
 */
export function onWorkoutCompleted(
  snapshot: BehaviorMemorySnapshot,
  session: WorkoutSessionMemory
): BehaviorMemorySnapshot {
  const wm = snapshot.workoutMemory;

  // 1. Append session to timeline
  const updatedSessions = [session, ...wm.timeline.sessions];

  // 2. Rebuild timeline (streak calculation needs full history)
  const newTimeline = buildTimelineFromSessions(updatedSessions);

  // 3. Update exercise snapshots incrementally
  const updatedSnapshots = { ...wm.exerciseSnapshots };
  for (const ex of session.exercises) {
    const key = ex.exerciseId || ex.exerciseName;
    const existing = updatedSnapshots[key];
    if (existing) {
      // Update incrementally
      const volume = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
      const bestWeight = Math.max(...ex.sets.map((s) => s.weight));

      updatedSnapshots[key] = {
        ...existing,
        lastWeight: ex.sets[ex.sets.length - 1]?.weight ?? existing.lastWeight,
        lastReps: ex.sets[ex.sets.length - 1]?.reps ?? existing.lastReps,
        lastVolume: volume,
        lastPerformedAt: session.date,
        bestWeight: Math.max(existing.bestWeight, bestWeight),
        bestVolume: Math.max(existing.bestVolume, volume),
        recentFrequency: existing.recentFrequency + 1,
        totalSessions: existing.totalSessions + 1,
      };
    } else {
      // First time seeing this exercise
      const volume = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
      updatedSnapshots[key] = {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        lastWeight: ex.sets[ex.sets.length - 1]?.weight ?? 0,
        lastReps: ex.sets[ex.sets.length - 1]?.reps ?? 0,
        lastVolume: volume,
        lastPerformedAt: session.date,
        bestWeight: Math.max(...ex.sets.map((s) => s.weight), 0),
        bestVolume: volume,
        best1RMEstimate: 0, // would need Epley calc
        averageVolume: volume,
        averageReps: ex.sets.reduce((s, set) => s + set.reps, 0) / ex.sets.length,
        averageWeight: ex.sets.reduce((s, set) => s + set.weight, 0) / ex.sets.length,
        recentFrequency: 1,
        totalSessions: 1,
        volumeTrend: 'insufficient_data',
      };
    }
  }

  // 4. Rebuild recovery snapshot (fast, deterministic)
  const recoverySnapshot = buildRecoverySnapshot(updatedSessions);

  // 5. Update transition graph incrementally
  const existingGraph = buildTransitionGraph(wm.userId, wm.timeline.sessions);
  const newSessionGraph = buildTransitionGraph(wm.userId, [session]);
  const mergedGraph = mergeTransitionGraphs(existingGraph, newSessionGraph);

  const updatedWorkoutMemory: UserWorkoutMemory = {
    ...wm,
    lastUpdatedAt: new Date().toISOString(),
    timeline: newTimeline,
    exerciseSnapshots: updatedSnapshots,
    recoverySnapshot,
  };

  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
    workoutMemory: updatedWorkoutMemory,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildTimelineFromSessions(
  sessions: WorkoutSessionMemory[]
): import('@/types/workout-memory').WorkoutTimeline {
  // Import lazily to avoid circular dependency issues at file level
  const { buildWorkoutMemory } = require('../workout-memory/buildWorkoutMemory');
  const dummy = buildWorkoutMemory('temp', sessions);
  return dummy.timeline;
}

function mergeTransitionGraphs(
  base: import('@/types/workout-memory').ExerciseTransitionGraph,
  delta: import('@/types/workout-memory').ExerciseTransitionGraph
): import('@/types/workout-memory').ExerciseTransitionGraph {
  const edges: Record<string, import('@/types/workout-memory').ExerciseTransition[]> = {};

  // Copy base
  for (const [key, transitions] of Object.entries(base.edges)) {
    edges[key] = transitions.map((t) => ({ ...t }));
  }

  // Merge delta
  for (const [key, deltaTransitions] of Object.entries(delta.edges)) {
    const existing = edges[key] || [];
    const existingMap = new Map(existing.map((t) => [t.toExerciseId, t]));

    for (const dt of deltaTransitions) {
      const et = existingMap.get(dt.toExerciseId);
      if (et) {
        et.count += dt.count;
        if (dt.lastObservedAt > et.lastObservedAt) {
          et.lastObservedAt = dt.lastObservedAt;
        }
      } else {
        existing.push({ ...dt });
      }
    }

    // Re-normalize probabilities
    const totalWeight = existing.reduce((s, t) => s + t.count, 0);
    for (const t of existing) {
      t.probability = Math.round((t.count / totalWeight) * 1000) / 1000;
    }

    existing.sort((a, b) => b.probability - a.probability);
    edges[key] = existing;
  }

  return {
    userId: base.userId,
    edges,
    totalTransitions: base.totalTransitions + delta.totalTransitions,
    lastUpdatedAt: new Date().toISOString(),
  };
}
