import { Workout, WorkoutSet } from '@prisma/client';
import { calculate1RM } from './calc';

interface PRRecord {
  exercise: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
}

interface WorkoutWithSets extends Workout {
  workoutSets: WorkoutSet[];
}

export function analyzeTrends(workouts: WorkoutWithSets[]): { data: Array<{ date: string; volume: number; maxWeight: number; estimated1RM: number }> } {
  const trendData = workouts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(workout => {
      const allSets = workout.workoutSets.filter(s => s.type === 'S');
      const maxWeight = Math.max(...allSets.map(set => set.weight), 0);
      const max1RM = Math.max(...allSets.map(set => calculate1RM(set.weight, set.reps)), 0);

      return {
        date: workout.date.toISOString().split('T')[0],
        volume: workout.totalVolume,
        maxWeight,
        estimated1RM: max1RM
      };
    });

  return { data: trendData };
}

export function getPersonalRecords(workouts: WorkoutWithSets[]): PRRecord[] {
  const exercisePRs = new Map<string, PRRecord>();

  workouts.forEach(workout => {
    workout.workoutSets.filter(s => s.type === 'S').forEach(set => {
      const exerciseName = set.exercise;
      const estimated1RM = calculate1RM(set.weight, set.reps);

      const existingPR = exercisePRs.get(exerciseName);
      if (!existingPR || estimated1RM > existingPR.estimated1RM) {
        exercisePRs.set(exerciseName, {
          exercise: exerciseName,
          weight: set.weight,
          reps: set.reps,
          estimated1RM,
          date: workout.date.toISOString().split('T')[0]
        });
      }
    });
  });

  return Array.from(exercisePRs.values());
}