import type { Workout, WorkoutSet } from '@prisma/client';

export type WorkoutSetSummary = {
  id: string;
  weight: number;
  reps: number;
  rir: number;
  isFailure: boolean;
  isPR: boolean;
  isWarmup: boolean;
  isCardio: boolean;
  setNumber: number;
};

export type ExerciseSummary = {
  id: string;
  name: string;
  muscleGroup: string | null;
  sets: WorkoutSetSummary[];
};

/** `/api/workout` 列表与详情统一返回结构 */
export type WorkoutSummaryDto = {
  id: string;
  exercises: ExerciseSummary[];
  totalVolume: number;
  duration: number;
  date: string;
  notes: string | null;
};

export function workoutDbToSummary(
  workout: Workout & { workoutSets: WorkoutSet[] }
): WorkoutSummaryDto {
  const exerciseMap = new Map<string, ExerciseSummary>();

  for (const set of workout.workoutSets) {
    if (!exerciseMap.has(set.exercise)) {
      exerciseMap.set(set.exercise, {
        id: set.id,
        name: set.exercise,
        muscleGroup: set.muscleGroup ?? null,
        sets: [],
      });
    }
    exerciseMap.get(set.exercise)!.sets.push({
      id: set.id,
      weight: set.weight,
      reps: set.reps,
      rir: set.rir ?? 0,
      isFailure: set.isFailure || (set.rir ?? 0) === 0,
      isPR: set.isPR,
      isWarmup: set.type === 'W',
      isCardio: set.type === 'C',
      setNumber: set.setNumber,
    });
  }

  return {
    id: workout.id,
    exercises: Array.from(exerciseMap.values()),
    totalVolume: workout.totalVolume,
    duration: workout.duration ?? 0,
    date: workout.date.toISOString(),
    notes: workout.notes ?? null,
  };
}
