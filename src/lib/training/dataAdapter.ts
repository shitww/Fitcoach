// ── FitCoach V2 — Training Intelligence Data Adapter ────────────────────────
// Bridges DB / cache workout formats → Training Intelligence engine inputs.
// Pure functions. No side effects.

import type { WorkoutSummaryDto, ExerciseSummary, WorkoutSetSummary } from '@/lib/workout-summary';
import type {
  ExerciseHistory,
  ExerciseSession,
  HistoricalSet,
  UserTrainingContext,
  RecentWorkout,
  BodyWeightTrend,
} from './trainingTypes';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Transform a list of DB workout summaries into per-exercise histories.
 * Results are ordered by exercise name for stable output.
 */
export function workoutsToExerciseHistories(
  workouts: WorkoutSummaryDto[]
): ExerciseHistory[] {
  const byExercise = new Map<string, ExerciseHistory>();

  // Sort oldest → newest so session order is natural
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const wo of sorted) {
    const dateStr = new Date(wo.date).toISOString().split('T')[0];
    for (const ex of wo.exercises) {
      if (!byExercise.has(ex.name)) {
        byExercise.set(ex.name, {
          exerciseName: ex.name,
          muscleGroup: ex.muscleGroup ?? undefined,
          sessions: [],
        });
      }
      const history = byExercise.get(ex.name)!;
      const sets = ex.sets
        .filter((s) => !s.isWarmup && !s.isCardio)
        .map((s) => setSummaryToHistoricalSet(s, dateStr));

      if (sets.length === 0) continue;

      const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      history.sessions.push({
        date: dateStr,
        sets,
        totalVolume,
      });
    }
  }

  return Array.from(byExercise.values()).sort((a, b) =>
    a.exerciseName.localeCompare(b.exerciseName)
  );
}

/**
 * Build a muscle-group lookup map from exercise summaries.
 */
export function buildMuscleMap(workouts: WorkoutSummaryDto[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const wo of workouts) {
    for (const ex of wo.exercises) {
      if (ex.muscleGroup && !map.has(ex.name)) {
        map.set(ex.name, ex.muscleGroup);
      }
    }
  }
  return map;
}

/**
 * Build user training context from recent workouts + body metrics.
 */
export function buildUserTrainingContext(
  workouts: WorkoutSummaryDto[],
  opts?: {
    currentStreak?: number;
    daysSinceLastWorkout?: number;
    bodyWeightTrend?: BodyWeightTrend;
  }
): UserTrainingContext {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentWorkouts: RecentWorkout[] = sorted.slice(0, 14).map((wo) => ({
    date: new Date(wo.date).toISOString().split('T')[0],
    exercises: wo.exercises.map((e) => e.name),
    totalVolume: wo.totalVolume,
    durationMin: Math.round(wo.duration / 60),
  }));

  return {
    recentWorkouts,
    currentStreak: opts?.currentStreak ?? 0,
    daysSinceLastWorkout: opts?.daysSinceLastWorkout ?? 0,
    bodyWeightTrend: opts?.bodyWeightTrend,
  };
}

/**
 * Build a single exercise history for the currently active exercise.
 * Lightweight — use when you only need history for one exercise.
 */
export function buildSingleExerciseHistory(
  workouts: WorkoutSummaryDto[],
  exerciseName: string
): ExerciseHistory | null {
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const sessions: ExerciseSession[] = [];
  let muscleGroup: string | undefined;

  for (const wo of sorted) {
    const ex = wo.exercises.find((e) => e.name === exerciseName);
    if (!ex) continue;
    if (!muscleGroup) muscleGroup = ex.muscleGroup ?? undefined;

    const sets = ex.sets
      .filter((s) => !s.isWarmup && !s.isCardio)
      .map((s) => setSummaryToHistoricalSet(s, new Date(wo.date).toISOString().split('T')[0]));

    if (sets.length === 0) continue;
    sessions.push({
      date: new Date(wo.date).toISOString().split('T')[0],
      sets,
      totalVolume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    });
  }

  if (sessions.length === 0) return null;
  return { exerciseName, muscleGroup, sessions };
}

// ── Internal ───────────────────────────────────────────────────────────────

function setSummaryToHistoricalSet(
  set: WorkoutSetSummary,
  date: string
): HistoricalSet {
  return {
    weight: set.weight,
    reps: set.reps,
    rir: set.rir,
    isFailure: set.isFailure,
    isPR: set.isPR,
    date,
  };
}
