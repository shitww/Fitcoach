"use client";

/**
 * Hydration Gate — defers zustand persist rehydration until after first paint.
 *
 * By default, zustand persist middleware reads localStorage synchronously
 * during store creation, which blocks hydration and first paint.
 *
 * Our stores now use `skipHydration: true`, so state starts empty.
 * This hook triggers rehydration after the component mounts,
 * using requestIdleCallback (or setTimeout fallback) to ensure
 * it doesn't compete with the critical rendering path.
 */

import { useEffect } from "react";
import { rehydrateWorkoutTimer } from "@/stores/workoutTimer";
import { rehydrateWorkoutSession } from "@/stores/workoutSession";

export function useHydrationGate(): void {
  useEffect(() => {
    const doRehydrate = () => {
      rehydrateWorkoutTimer();
      rehydrateWorkoutSession();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(doRehydrate, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(doRehydrate, 0);
    return () => clearTimeout(id);
  }, []);
}
