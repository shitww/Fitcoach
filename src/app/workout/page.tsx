"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import InstantShell from "./components/InstantShell";

const WorkoutController = dynamic(() => import("./WorkoutController"), { ssr: false });

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-primary animate-spin" />
    </div>
  );
}

/**
 * Workout Entry — URL-driven training start.
 *
 * 1. No params + no active session → InstantShell (big start button + muscle grid + recent exercises).
 * 2. With params OR active/paused session → mount WorkoutController directly.
 * 3. InstantShell buttons navigate via router.replace so the controller reads
 *    the same params on mount.
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
      <div className="relative min-h-screen bg-background overflow-hidden">
        <Suspense fallback={<Spinner />}>
          <WorkoutController />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <InstantShell onStart={handleStart} />
    </div>
  );
}
