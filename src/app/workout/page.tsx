"use client";

import { Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import InstantShell from "./components/InstantShell";

const WorkoutRuntimeShell = lazy(() => import("@/features/workout-runtime/ui/shells/WorkoutRuntimeShell"));

function RuntimeSkeleton() {
  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 1 }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(184,255,43,0.04) 0%, transparent 70%), linear-gradient(180deg, #0C0C0E 0%, #08080A 100%)",
        }}
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--rvl-active)" }} />
      </div>
    </div>
  );
}

/**
 * Workout Entry — Streaming Shell Architecture
 *
 * 1. No params + no active session → InstantShell (entry page with big start button + muscle grid).
 * 2. With params OR active/paused session → WorkoutInstantShell > Suspense > WorkoutRuntimeShell.
 *
 * InstantShell principles:
 * - SSR renderable skeleton
 * - No business hooks / no store / no fetch
 * - Stable骨架 + page space structure
 * - Prevents blank flash on hydration
 */

export default function WorkoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionPhase = useWorkoutTimer((s) => s.sessionPhase);

  const hasIntent =
    searchParams.has("mg") ||
    searchParams.has("mode") ||
    searchParams.has("cardioType");

  const isSessionActive = sessionPhase === "active" || sessionPhase === "paused";

  const handleStart = (query?: string) => {
    router.replace(query ? `/workout?${query}` : "/workout?mode=strength");
  };

  if (hasIntent || isSessionActive) {
    return (
      <Suspense fallback={<RuntimeSkeleton />}>
        <WorkoutRuntimeShell />
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <InstantShell onStart={handleStart} />
    </div>
  );
}
