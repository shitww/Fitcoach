// ── Behavior Memory Update Coordinator ────────────────────────────────────────
// Central dispatcher for all behavior memory mutations.
// Ensures consistent state updates across workout and food events.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutSessionMemory,
  MemoryFoodLog,
  BehaviorMemorySnapshot,
} from '@/types/workout-memory';
import { onWorkoutCompleted } from './onWorkoutCompleted';
import { onFoodLogged } from './onFoodLogged';
import { saveBehaviorMemory } from '../storage/memoryStorage';

/** Update memory after a workout completes and optionally persist. */
export function updateAfterWorkout(
  snapshot: BehaviorMemorySnapshot,
  session: WorkoutSessionMemory,
  persist: boolean = true
): BehaviorMemorySnapshot {
  const updated = onWorkoutCompleted(snapshot, session);
  if (persist) saveBehaviorMemory(updated);
  return updated;
}

/** Update memory after a food log and optionally persist. */
export function updateAfterFoodLog(
  snapshot: BehaviorMemorySnapshot,
  log: MemoryFoodLog,
  persist: boolean = true
): BehaviorMemorySnapshot {
  const updated = onFoodLogged(snapshot, log);
  if (persist) saveBehaviorMemory(updated);
  return updated;
}

/** Batch update: apply multiple food logs at once.
 *  Useful for initial sync or bulk import.
 */
export function batchUpdateFoodLogs(
  snapshot: BehaviorMemorySnapshot,
  logs: readonly MemoryFoodLog[],
  persist: boolean = true
): BehaviorMemorySnapshot {
  let current = snapshot;
  for (const log of logs) {
    current = onFoodLogged(current, log);
  }
  if (persist) saveBehaviorMemory(current);
  return current;
}

/** Create an empty behavior memory snapshot for a new user. */
export function createEmptyBehaviorMemory(userId: string): BehaviorMemorySnapshot {
  const now = new Date().toISOString();
  return {
    version: 1,
    userId,
    createdAt: now,
    updatedAt: now,
    workoutMemory: {
      userId,
      version: 1,
      lastUpdatedAt: now,
      timeline: {
        sessions: [],
        totalSessions: 0,
        firstWorkoutDate: null,
        lastWorkoutDate: null,
        currentStreak: 0,
        longestStreak: 0,
      },
      exerciseSnapshots: {},
      recoverySnapshot: {
        muscleGroups: [],
        overallRecoveryScore: 100,
        mostFatigued: null,
        fullyRecovered: [],
      },
      weeklySummaries: [],
    },
    foodMemory: {
      userId,
      version: 1,
      lastUpdatedAt: now,
      foodSnapshots: {},
      mealPatterns: [],
      recentLogs: [],
    },
  };
}
