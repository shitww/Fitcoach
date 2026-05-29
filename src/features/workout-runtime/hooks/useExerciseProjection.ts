"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/shallow";
import {
  useWorkoutSession,
  type SessionExercise,
  type SessionSet,
  selectActiveExerciseSets,
  selectActiveExerciseVolume,
} from "@/stores/workoutSession";
import { useWorkoutTimer } from "@/stores/workoutTimer";

export interface ExerciseProjection {
  name: string;
  sets: SessionSet[];
  totalVolume: number;
  completedSets: number;
  currentSetNumber: number;
  isActive: boolean;
}

export function useExerciseProjection(exerciseName: string): ExerciseProjection {
  const { exercises, activeExerciseName } = useWorkoutSession(
    useShallow((s) => ({
      exercises: s.exercises,
      activeExerciseName: s.activeExerciseName,
    }))
  );

  const exercise = exercises.find((e) => e.name === exerciseName);
  const completedSets = exercise?.sets.filter((s) => s.completed && !s.isWarmup).length ?? 0;

  return {
    name: exerciseName,
    sets: exercise?.sets ?? [],
    totalVolume: exercise?.totalVolume ?? 0,
    completedSets,
    currentSetNumber: completedSets + 1,
    isActive: activeExerciseName === exerciseName,
  };
}

export function useActiveExerciseProjection(): ExerciseProjection {
  const activeExerciseName = useWorkoutSession((s) => s.activeExerciseName);
  return useExerciseProjection(activeExerciseName);
}

export function useAllExercisesProjection(): SessionExercise[] {
  return useWorkoutSession((s) => s.exercises);
}

export function useSetProjection(exerciseName: string, setIndex: number): SessionSet | undefined {
  return useWorkoutSession(
    useCallback(
      (s) => {
        const ex = s.exercises.find((e) => e.name === exerciseName);
        return ex?.sets[setIndex];
      },
      [exerciseName, setIndex]
    )
  );
}
