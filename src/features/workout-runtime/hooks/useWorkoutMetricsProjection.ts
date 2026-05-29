"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useWorkoutTimer, selectTrainingSeconds } from "@/stores/workoutTimer";
import {
  useWorkoutSession,
  selectTotalVolume,
  selectCompletedSetCount,
} from "@/stores/workoutSession";

export type SyncState = "saved" | "syncing" | "offline" | "retrying";

export interface WorkoutMetricsProjection {
  durationSeconds: number;
  formattedDuration: string;
  totalVolume: number;
  completedSets: number;
  syncState: SyncState;
  isPaused: boolean;
  isActive: boolean;
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function useWorkoutMetricsProjection(): WorkoutMetricsProjection {
  const durationSeconds = useWorkoutTimer(selectTrainingSeconds);
  const { isTrainingActive, isPaused } = useWorkoutTimer(
    useShallow((s) => ({
      isTrainingActive: s.isTrainingActive,
      isPaused: s.isPaused,
    }))
  );

  const totalVolume = useWorkoutSession(selectTotalVolume);
  const completedSets = useWorkoutSession(selectCompletedSetCount);
  const pendingWorkout = useWorkoutSession((s) => s.pendingWorkout);

  const syncState: SyncState = useMemo(() => {
    if (pendingWorkout) return "retrying";
    if (!navigator.onLine) return "offline";
    // In a real implementation, this would come from a sync layer
    return "saved";
  }, [pendingWorkout]);

  return {
    durationSeconds,
    formattedDuration: fmtDuration(durationSeconds),
    totalVolume,
    completedSets,
    syncState,
    isPaused,
    isActive: isTrainingActive,
  };
}
