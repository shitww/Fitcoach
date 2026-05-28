"use client";

import { useState, useCallback, useRef } from "react";
import InstantShell from "./components/InstantShell";
import TransitionOverlay from "./components/TransitionOverlay";
import type { TransitionPhase } from "./components/TransitionOverlay";

type Phase = "idle" | TransitionPhase;

/**
 * Phase 5 — Continuous Experience Transition Layer
 *
 * State Machine:
 *   idle      → InstantShell only (first paint)
 *   entering  → TransitionOverlay fades in (user clicked Start)
 *   preparing → Overlay shows "准备训练系统", chunk loads in background
 *   restoring → Overlay shows "恢复训练数据", RuntimeIsland mounts
 *   ready     → Overlay fades out, RuntimeIsland fully visible
 *
 * InstantShell stays mounted throughout for visual continuity.
 */

export default function WorkoutPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showOverlay, setShowOverlay] = useState(false);
  const [Controller, setController] = useState<React.ComponentType | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, delay: number) => {
    timersRef.current.push(setTimeout(fn, delay));
  };

  const handleStart = useCallback(() => {
    if (phase !== "idle") return;

    // ── Phase: entering ──
    setShowOverlay(true);
    setPhase("entering");

    // ── Phase: preparing (after 400ms) ──
    schedule(() => {
      setPhase("preparing");

      // Begin lazy chunk load while overlay shows
      import("./WorkoutController").then((mod) => {
        setController(() => mod.default);

        // ── Phase: restoring (chunk loaded) ──
        setPhase("restoring");

        // ── Phase: ready (after 500ms restoring) ──
        schedule(() => {
          setPhase("ready");

          // Unmount overlay after fade-out completes
          schedule(() => {
            setShowOverlay(false);
          }, 500);
        }, 500);
      });
    }, 400);
  }, [phase]);

  const isReady = phase === "ready";
  const overlayVisible = showOverlay && !isReady;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Layer 1: InstantShell — stays mounted for visual continuity */}
      <div
        className={`transition-opacity duration-500 ${isReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <InstantShell onStart={handleStart} />
      </div>

      {/* Layer 2: Transition Overlay — bridges InstantShell → RuntimeIsland */}
      {showOverlay && (
        <TransitionOverlay
          phase={phase === "idle" ? "entering" : (phase as TransitionPhase)}
          visible={overlayVisible}
        />
      )}

      {/* Layer 3: RuntimeIsland — mounted during restoring, visible at ready */}
      {Controller && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"}`}
        >
          <Controller />
        </div>
      )}
    </div>
  );
}
