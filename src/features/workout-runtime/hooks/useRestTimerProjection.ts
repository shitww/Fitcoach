"use client";

import { useMemo } from "react";
import { useWorkoutTimer, selectRestSecondsRemaining } from "@/stores/workoutTimer";

export type RestPhase = "idle" | "normal" | "warning" | "overtime";

export interface RestTimerProjection {
  secondsRemaining: number;
  phase: RestPhase;
  formatted: string;
  progress: number; // 0..1
}

function fmt(secs: number): string {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useRestTimerProjection(durationTotal: number = 90): RestTimerProjection {
  const secondsRemaining = useWorkoutTimer(selectRestSecondsRemaining);
  const isRestActive = useWorkoutTimer((s) => s.restTimer.phase === "running");

  return useMemo(() => {
    const secs = Math.max(0, secondsRemaining);
    let phase: RestPhase = "idle";
    if (isRestActive) {
      if (secs <= 0) phase = "overtime";
      else if (secs <= 10) phase = "warning";
      else phase = "normal";
    }

    const total = durationTotal > 0 ? durationTotal : 90;
    const progress = isRestActive ? Math.min(1, secs / total) : 1;

    return {
      secondsRemaining: secs,
      phase,
      formatted: fmt(secs),
      progress,
    };
  }, [secondsRemaining, isRestActive, durationTotal]);
}
