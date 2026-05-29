"use client";

import { Suspense, lazy, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkoutTimer, selectWorkoutPhase } from "@/stores/workoutTimer";
import { useWorkoutSession } from "@/stores/workoutSession";
import { useShallow } from "zustand/shallow";
import WorkoutInstantShell from "./WorkoutInstantShell";
import WorkoutTopBar from "../components/WorkoutTopBar";
import RuntimeBottomDock from "../components/RuntimeBottomDock";
import FloatingRestTimer from "../components/FloatingRestTimer";

// Heavy runtime clusters loaded lazily to keep initial shell instant
const ActiveExerciseRail = lazy(() => import("../components/ActiveExerciseRail"));
const ExerciseRuntimeCard = lazy(() => import("../components/ExerciseRuntimeCard"));

function RuntimeSkeleton() {
  return (
    <div className="px-5 py-4 space-y-4 animate-pulse">
      <div className="h-10 w-full rounded-xl" style={{ background: "var(--rvl-surface-2)" }} />
      <div className="h-40 w-full rounded-2xl" style={{ background: "var(--rvl-surface-1)" }} />
      <div className="h-40 w-full rounded-2xl" style={{ background: "var(--rvl-surface-1)" }} />
    </div>
  );
}

/**
 * WorkoutRuntimeShell — Page Runtime Container
 *
 * Responsibilities:
 * - Runtime hydration boundary
 * - Organize runtime clusters (header, rail, cards, dock)
 * - Surface phase switching (active / rest)
 * - NO complex business logic (delegated to hooks & stores)
 *
 * Constraints:
 * - Under 300 lines
 * - No data requests scattered
 * - No direct DB calls
 * - No giant useEffect
 */
export default function WorkoutRuntimeShell() {
  const phase = useWorkoutTimer(selectWorkoutPhase);
  const { activeExerciseName, exercises } = useWorkoutSession(
    useShallow((s) => ({
      activeExerciseName: s.activeExerciseName,
      exercises: s.exercises,
    }))
  );

  const [showRestTimer, setShowRestTimer] = useState(true);
  const searchParams = useSearchParams();

  const handleToggleRestTimer = useCallback(() => {
    setShowRestTimer((p) => !p);
  }, []);

  const isResting = phase === "rest";
  const hasExercises = exercises.length > 0;
  const sessionPhase = useWorkoutTimer((s) => s.sessionPhase);
  const isSessionActive = sessionPhase === "active" || sessionPhase === "paused";
  const startTraining = useWorkoutTimer((s) => s.startTraining);

  // Auto-start session when arriving with URL intent but session is idle
  useEffect(() => {
    const hasIntent =
      searchParams.has("mg") ||
      searchParams.has("mode") ||
      searchParams.has("cardioType");

    if (hasIntent && sessionPhase === "idle") {
      startTraining();
    }
  }, [searchParams, sessionPhase, startTraining]);

  return (
    <WorkoutInstantShell>
      <div className="flex flex-col min-h-full">
        {/* Phase 2: Runtime Header — always mounted, isolated re-render */}
        <WorkoutTopBar />

        {/* Phase 3: Active Exercise Rail — lazy + Suspense */}
        <div className="shrink-0">
          <Suspense fallback={<div className="h-12 px-5" />}>
            <ActiveExerciseRail />
          </Suspense>
        </div>

        {/* Phase 4-5: Exercise Runtime Cards — lazy + Suspense */}
        <div className="flex-1 px-5 py-3 space-y-3">
          <Suspense fallback={<RuntimeSkeleton />}>
            {hasExercises ? (
              exercises.map((ex) => (
                <ExerciseRuntimeCard
                  key={ex.id}
                  exerciseName={ex.name}
                  isActive={ex.name === activeExerciseName}
                />
              ))
            ) : activeExerciseName ? (
              <ExerciseRuntimeCard exerciseName={activeExerciseName} isActive />
            ) : isSessionActive ? (
              <EmptyRuntimeState />
            ) : (
              <StartTrainingPrompt onStart={startTraining} />
            )}
          </Suspense>
        </div>

        {/* Phase 6: Floating Rest Timer (bottom, non-blocking) */}
        {isResting && showRestTimer && (
          <FloatingRestTimer onMinimize={handleToggleRestTimer} />
        )}

        {/* Phase 7: Runtime Bottom Dock */}
        <RuntimeBottomDock />
      </div>
    </WorkoutInstantShell>
  );
}

function EmptyRuntimeState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "var(--rvl-surface-2)",
          border: "1px solid var(--rvl-border-subtle)",
        }}
      >
        <span className="text-2xl">💪</span>
      </div>
      <p className="text-sm font-bold" style={{ color: "var(--rvl-text-high)" }}>
        准备开始训练
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--rvl-text-faint)" }}>
        从上方选择一个动作，或点击底部添加
      </p>
    </div>
  );
}

function StartTrainingPrompt({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{
          background: "var(--rvl-active-dim)",
          border: "1px solid var(--rvl-active-glow)",
          boxShadow: "0 0 24px var(--rvl-active-glow)",
        }}
      >
        <span className="text-3xl">🔥</span>
      </div>
      <p className="text-base font-black mb-2" style={{ color: "var(--rvl-text-high)" }}>
        开始今天的训练
      </p>
      <p className="text-xs mb-6" style={{ color: "var(--rvl-text-faint)" }}>
        点击开始，记录每一组的进步
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-2xl font-black text-base runtime-tap"
        style={{
          background: "linear-gradient(135deg, var(--rvl-active), #7CDD00)",
          color: "#000",
          boxShadow: "0 0 32px var(--rvl-active-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        开始训练
      </button>
    </div>
  );
}
