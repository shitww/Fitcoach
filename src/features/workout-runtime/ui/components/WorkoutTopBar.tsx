"use client";

import { memo } from "react";
import { ArrowLeft, Activity, Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import { useWorkoutMetricsProjection } from "../../hooks/useWorkoutMetricsProjection";

/**
 * SessionClock — isolated timer sub-component.
 * Subscribes only to timer seconds. No re-render of parent.
 */
const SessionClock = memo(function SessionClock() {
  const { formattedDuration, isPaused } = useWorkoutMetricsProjection();

  return (
    <div
      className="flex items-center gap-1.5 text-sm font-bold tabular-nums"
      style={{ color: isPaused ? "var(--rvl-text-faint)" : "var(--rvl-active)" }}
    >
      <Activity className="w-3.5 h-3.5" style={{ opacity: isPaused ? 0.4 : 1 }} />
      <span>{formattedDuration}</span>
      {isPaused && <span className="text-[10px] opacity-50">⏸</span>}
    </div>
  );
});

/**
 * ActiveVolumeBadge — isolated volume sub-component.
 * Subscribes only to volume. Pulses on change (via key trick in parent).
 */
const ActiveVolumeBadge = memo(function ActiveVolumeBadge() {
  const { totalVolume } = useWorkoutMetricsProjection();

  if (totalVolume <= 0) return null;

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black tabular-nums"
      style={{
        background: "var(--rvl-active-dim)",
        color: "var(--rvl-active)",
        border: "1px solid var(--rvl-active-glow)",
      }}
    >
      <span>Vol</span>
      <span>{totalVolume.toLocaleString()}kg</span>
    </div>
  );
});

/**
 * SyncStateIndicator — small runtime dot.
 * Does NOT block training flow. Not a toast.
 */
const SyncStateIndicator = memo(function SyncStateIndicator() {
  const { syncState } = useWorkoutMetricsProjection();

  if (syncState === "saved") {
    return (
      <div className="flex items-center gap-1" title="已保存">
        <Check className="w-3 h-3" style={{ color: "var(--rvl-rest)" }} />
        <span className="text-[10px] font-bold" style={{ color: "var(--rvl-text-faint)" }}>
          Saved
        </span>
      </div>
    );
  }

  if (syncState === "syncing") {
    return (
      <div className="flex items-center gap-1" title="同步中">
        <Cloud className="w-3 h-3 animate-pulse" style={{ color: "var(--rvl-transition)" }} />
        <span className="text-[10px] font-bold" style={{ color: "var(--rvl-text-faint)" }}>
          Syncing
        </span>
      </div>
    );
  }

  if (syncState === "retrying") {
    return (
      <div className="flex items-center gap-1" title="重试中">
        <RefreshCw className="w-3 h-3 animate-spin" style={{ color: "var(--rvl-fatigue)" }} />
        <span className="text-[10px] font-bold" style={{ color: "var(--rvl-fatigue)" }}>
          Retry
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" title="离线模式">
      <CloudOff className="w-3 h-3" style={{ color: "var(--rvl-text-faint)" }} />
      <span className="text-[10px] font-bold" style={{ color: "var(--rvl-text-faint)" }}>
        Offline
      </span>
    </div>
  );
});

/**
 * WorkoutTopBar — Runtime Header
 *
 * Structure:
 * ┌─────────────────────────────┐
 * │ ← Push Day        42m       │
 * │ Volume 8,240kg    Synced    │
 * └─────────────────────────────┘
 */
const WorkoutTopBar = memo(function WorkoutTopBar() {
  const router = useRouter();
  const currentExercise = useWorkoutTimer((s) => s.currentExercise);

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="shrink-0 px-5 pt-5 pb-3 safe-top">
      <div className="flex items-center justify-between">
        {/* Left: back + session name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center runtime-tap"
            style={{
              background: "var(--rvl-surface-2)",
              border: "1px solid var(--rvl-border-subtle)",
            }}
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--rvl-text-med)" }} />
          </button>

          <div className="min-w-0">
            <h1
              className="text-sm font-black truncate leading-tight"
              style={{ color: "var(--rvl-text-high)" }}
            >
              {currentExercise ?? "训练中"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <SessionClock />
            </div>
          </div>
        </div>

        {/* Right: volume + sync */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <ActiveVolumeBadge />
          <SyncStateIndicator />
        </div>
      </div>
    </header>
  );
});

export default WorkoutTopBar;
