"use client";

import { memo, useCallback } from "react";
import { Plus, Mic, StickyNote, CheckCircle } from "lucide-react";
import { useWorkoutSession } from "@/stores/workoutSession";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import { useWorkoutMetricsProjection } from "../../hooks/useWorkoutMetricsProjection";

interface DockButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}

const DockButton = memo(function DockButton({ icon, label, onClick, accent }: DockButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 runtime-tap min-w-[44px] min-h-[44px]"
      aria-label={label}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{
          background: accent ? "var(--rvl-active)" : "var(--rvl-surface-2)",
          color: accent ? "#000" : "var(--rvl-text-med)",
          border: accent ? "none" : "1px solid var(--rvl-border-subtle)",
          boxShadow: accent ? "0 0 16px var(--rvl-active-glow)" : "none",
        }}
      >
        {icon}
      </div>
      <span
        className="text-[9px] font-bold tracking-wide"
        style={{ color: accent ? "var(--rvl-active)" : "var(--rvl-text-faint)" }}
      >
        {label}
      </span>
    </button>
  );
});

const FinishWorkoutCTA = memo(function FinishWorkoutCTA({ onFinish }: { onFinish: () => void }) {
  const { completedSets, totalVolume } = useWorkoutMetricsProjection();

  return (
    <button
      onClick={onFinish}
      className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-black text-sm runtime-tap"
      style={{
        background: "linear-gradient(135deg, var(--rvl-active), #7CDD00)",
        color: "#000",
        boxShadow: "0 0 24px var(--rvl-active-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      <CheckCircle className="w-4 h-4" />
      完成训练
      {completedSets > 0 && (
        <span className="text-[10px] opacity-70 font-bold tabular-nums">
          {completedSets}组 · {totalVolume.toLocaleString()}kg
        </span>
      )}
    </button>
  );
});

/**
 * RuntimeBottomDock
 *
 * Glass-morphism floating dock at bottom.
 * Safe-area aware, iOS-native feel.
 *
 * [ +Set ] [ Voice ] [ Note ] [ Finish ]
 */
const RuntimeBottomDock = memo(function RuntimeBottomDock() {
  const { logSet } = useWorkoutSession();
  const stopTraining = useWorkoutTimer((s) => s.stopTraining);
  const sessionPhase = useWorkoutTimer((s) => s.sessionPhase);

  const handleAddSet = useCallback(() => {
    // In the new architecture, set logging is handled inside ExerciseRuntimeCard.
    // This is a quick-add fallback.
    const result = logSet();
    if (!result.ok) {
      // Could show a micro-toast here
    }
  }, [logSet]);

  const handleVoice = useCallback(() => {
    // AI extension: Voice Log placeholder
    // eslint-disable-next-line no-console
    console.log("[AI Extension] Voice log triggered");
  }, []);

  const handleNote = useCallback(() => {
    const note = prompt("训练备注:");
    if (note !== null) {
      useWorkoutSession.getState().setTrainingNotes(note);
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (confirm("确定完成本次训练？")) {
      stopTraining();
    }
  }, [stopTraining]);

  const isActive = sessionPhase === "active" || sessionPhase === "paused";

  if (!isActive) return null;

  return (
    <div
      className="shrink-0 px-5 pt-3 pb-5 safe-bottom runtime-dock"
      style={{
        background:
          "linear-gradient(to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, transparent 100%)",
      }}
    >
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-2xl"
        style={{
          background: "var(--surface-glass)",
          border: "1px solid var(--border-subtle)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        }}
      >
        <DockButton icon={<Plus className="w-5 h-5" />} label="加组" onClick={handleAddSet} />
        <DockButton icon={<Mic className="w-5 h-5" />} label="语音" onClick={handleVoice} />
        <DockButton icon={<StickyNote className="w-5 h-5" />} label="备注" onClick={handleNote} />
        <div className="w-px h-8" style={{ background: "var(--rvl-border-subtle)" }} />
        <FinishWorkoutCTA onFinish={handleFinish} />
      </div>
    </div>
  );
});

export default RuntimeBottomDock;
