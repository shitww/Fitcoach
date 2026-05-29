// ── Build Behavior Summaries ──────────────────────────────────────────────────
// Creates lightweight exercise and food summaries from full session history.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ExerciseBehaviorSummary,
  FoodBehaviorSummary,
} from '@/types/runtime-reliability';
import type { BehaviorMemorySnapshot, ExercisePerformanceSnapshot } from '@/types/workout-memory';

/** Build exercise summaries from Phase 2 behavior memory. */
export function buildExerciseSummaries(
  memory: BehaviorMemorySnapshot
): ExerciseBehaviorSummary[] {
  const summaries: ExerciseBehaviorSummary[] = [];

  for (const [exerciseId, snapshot] of Object.entries(memory.workoutMemory.exerciseSnapshots)) {
    const progressionRate = computeProgressionRate(snapshot);
    const trend = deriveTrend(snapshot);

    summaries.push({
      exerciseId,
      exerciseName: snapshot.exerciseName,
      muscleGroup: '',
      totalSessions: snapshot.totalSessions,
      avgWeight: snapshot.averageWeight,
      peakWeight: snapshot.bestWeight,
      avgReps: snapshot.averageReps,
      avgVolume: snapshot.averageVolume,
      lastPerformedAt: snapshot.lastPerformedAt,
      frequency30d: snapshot.recentFrequency,
      progressionRate,
      trendLabel: trend,
    });
  }

  return summaries.sort((a, b) => b.frequency30d - a.frequency30d);
}

/** Build food summaries from Phase 2 food memory. */
export function buildFoodSummaries(
  memory: BehaviorMemorySnapshot
): FoodBehaviorSummary[] {
  return Object.values(memory.foodMemory.foodSnapshots).map((snap) => ({
    foodId: snap.foodId,
    foodName: snap.foodName,
    totalLogs: snap.totalLogs,
    avgCalories: 0,
    frequency30d: snap.frequency30d,
    frequentMealTimes: snap.commonMealType ? [snap.commonMealType] : [],
    lastLoggedAt: snap.lastLoggedAt,
  }));
}

function computeProgressionRate(snapshot: ExercisePerformanceSnapshot): number {
  if (snapshot.totalSessions < 2) return 0;
  const weightGain = snapshot.bestWeight - snapshot.averageWeight;
  const rate = weightGain / Math.max(1, snapshot.totalSessions);
  return Math.round(rate * 10) / 10;
}

function deriveTrend(snapshot: ExercisePerformanceSnapshot): ExerciseBehaviorSummary['trendLabel'] {
  if (snapshot.totalSessions < 3) return 'insufficient';
  const trend = snapshot.volumeTrend;
  if (trend === 'up' || trend === 'down' || trend === 'stable') return trend;
  return 'stable';
}
