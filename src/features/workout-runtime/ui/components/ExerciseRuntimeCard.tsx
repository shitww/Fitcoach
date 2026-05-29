"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, Minus, Plus, Check } from "lucide-react";
import { useWorkoutSession, type SessionSet } from "@/stores/workoutSession";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import { useExerciseProjection } from "../../hooks/useExerciseProjection";

// ── Sub-layers ──

interface ExerciseIdentityLayerProps {
  name: string;
  muscleGroup?: string;
  lastRecord?: string;
  isActive: boolean;
}

const ExerciseIdentityLayer = memo(function ExerciseIdentityLayer({
  name,
  muscleGroup,
  lastRecord,
  isActive,
}: ExerciseIdentityLayerProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3
          className="text-base font-black leading-tight"
          style={{ color: isActive ? "var(--rvl-text-hero)" : "var(--rvl-text-high)" }}
        >
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {muscleGroup && (
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rvl-text-faint)" }}>
              {muscleGroup}
            </span>
          )}
          {lastRecord && (
            <span className="text-[10px] font-semibold" style={{ color: "var(--rvl-text-faint)" }}>
              Last: {lastRecord}
            </span>
          )}
        </div>
      </div>
      {isActive && (
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--rvl-active)", boxShadow: "0 0 8px var(--rvl-active-glow)" }}
        />
      )}
    </div>
  );
});

interface HistoricalPerformanceStripProps {
  history: { weight: number; reps: number; date?: string }[];
  currentWeight?: number;
}

const HistoricalPerformanceStrip = memo(function HistoricalPerformanceStrip({
  history,
  currentWeight,
}: HistoricalPerformanceStripProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-3 -mx-1">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 pb-1">
        {history.map((h, i) => {
          const isTarget = currentWeight && h.weight === currentWeight;
          return (
            <div
              key={i}
              className="shrink-0 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums"
              style={{
                background: isTarget ? "var(--rvl-active-dim)" : "var(--rvl-surface-1)",
                color: isTarget ? "var(--rvl-active)" : "var(--rvl-text-faint)",
                border: isTarget ? "1px solid var(--rvl-active-glow)" : "1px solid transparent",
              }}
            >
              {h.weight}×{h.reps}
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface WarmupSuggestionInlineProps {
  warmups: { weight: number; reps: number }[];
}

const WarmupSuggestionInline = memo(function WarmupSuggestionInline({ warmups }: WarmupSuggestionInlineProps) {
  if (warmups.length === 0) return null;

  return (
    <div
      className="mt-2 px-3 py-2 rounded-xl flex items-center gap-2"
      style={{ background: "var(--rvl-surface-1)", opacity: 0.7 }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rvl-text-faint)" }}>
        Warm-up
      </span>
      <div className="flex items-center gap-1.5">
        {warmups.map((w, i) => (
          <span key={i} className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--rvl-text-med)" }}>
            {w.weight}×{w.reps}
          </span>
        ))}
      </div>
    </div>
  );
});

interface QuickWeightAdjustProps {
  weight: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const QuickWeightAdjust = memo(function QuickWeightAdjust({ weight, onChange, disabled }: QuickWeightAdjustProps) {
  const handleMinus = useCallback(() => {
    const val = Math.max(0, (Number(weight) || 0) - 2.5);
    onChange(String(val));
  }, [weight, onChange]);

  const handlePlus = useCallback(() => {
    const val = (Number(weight) || 0) + 2.5;
    onChange(String(val));
  }, [weight, onChange]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleMinus}
        disabled={disabled}
        className="w-10 h-10 rounded-xl flex items-center justify-center runtime-tap"
        style={{ background: "var(--rvl-surface-2)", border: "1px solid var(--rvl-border-subtle)", color: "var(--rvl-text-med)" }}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-20 text-center text-2xl font-black bg-transparent outline-none tabular-nums runtime-input-stable"
          style={{ color: "var(--rvl-text-hero)" }}
          placeholder="0"
        />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: "var(--rvl-text-faint)" }}>
          kg
        </span>
      </div>
      <button
        onClick={handlePlus}
        disabled={disabled}
        className="w-10 h-10 rounded-xl flex items-center justify-center runtime-tap"
        style={{ background: "var(--rvl-surface-2)", border: "1px solid var(--rvl-border-subtle)", color: "var(--rvl-text-med)" }}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
});

interface RepQuickTapProps {
  reps: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const QUICK_REPS = [6, 8, 10, 12];

const RepQuickTap = memo(function RepQuickTap({ reps, onChange, disabled }: RepQuickTapProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-16 text-center text-2xl font-black bg-transparent outline-none tabular-nums runtime-input-stable"
          style={{ color: "var(--rvl-text-hero)" }}
          placeholder="0"
        />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold" style={{ color: "var(--rvl-text-faint)" }}>
          次
        </span>
      </div>
      <div className="flex items-center gap-1">
        {QUICK_REPS.map((r) => (
          <button
            key={r}
            onClick={() => onChange(String(r))}
            disabled={disabled}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold runtime-tap"
            style={{
              background: Number(reps) === r ? "var(--rvl-active-dim)" : "var(--rvl-surface-1)",
              color: Number(reps) === r ? "var(--rvl-active)" : "var(--rvl-text-faint)",
              border: Number(reps) === r ? "1px solid var(--rvl-active-glow)" : "1px solid var(--rvl-border-subtle)",
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
});

interface SetRowProps {
  index: number;
  weight: string;
  reps: string;
  completed: boolean;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onToggleComplete: () => void;
}

const SetRow = memo(function SetRow({
  index,
  weight,
  reps,
  completed,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
}: SetRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${completed ? "rt-animate-completion" : ""}`}
      style={{
        background: completed ? "var(--state-completed-surface)" : "var(--rvl-surface-1)",
        border: completed ? "1px solid var(--state-completed-border)" : "1px solid var(--rvl-border-subtle)",
        boxShadow: completed ? "0 0 12px var(--state-completed-ambient)" : "none",
        minHeight: 56,
      }}
    >
      <span
        className="text-xs font-black tabular-nums w-6 text-center shrink-0"
        style={{ color: completed ? "var(--rvl-complete)" : "var(--rvl-text-faint)" }}
      >
        #{index + 1}
      </span>

      <div className="flex-1 flex items-center gap-2">
        <QuickWeightAdjust weight={weight} onChange={onWeightChange} disabled={completed} />
        <span className="text-lg font-bold" style={{ color: "var(--rvl-text-faint)" }}>×</span>
        <RepQuickTap reps={reps} onChange={onRepsChange} disabled={completed} />
      </div>

      <button
        onClick={onToggleComplete}
        className="w-10 h-10 rounded-xl flex items-center justify-center runtime-tap shrink-0"
        style={{
          background: completed ? "var(--rvl-complete-dim)" : "var(--rvl-surface-2)",
          border: completed ? "1px solid var(--rvl-complete-glow)" : "1px solid var(--rvl-border-subtle)",
        }}
        aria-label={completed ? "取消完成" : "完成组"}
      >
        <Check
          className="w-5 h-5 transition-colors duration-200"
          style={{ color: completed ? "var(--rvl-complete)" : "var(--rvl-text-faint)" }}
        />
      </button>
    </div>
  );
});

interface SetExecutionClusterProps {
  exerciseName: string;
  sets: SessionSet[];
  isActive: boolean;
}

const SetExecutionCluster = memo(function SetExecutionCluster({
  exerciseName,
  sets,
  isActive,
}: SetExecutionClusterProps) {
  const [localSets, setLocalSets] = useState<{ weight: string; reps: string; completed: boolean }[]>(
    sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps), completed: s.completed }))
  );

  // Sync local state with store sets when they change externally
  useEffect(() => {
    setLocalSets(sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps), completed: s.completed })));
  }, [sets]);

  const logSet = useWorkoutSession((s) => s.logSet);
  const startRest = useWorkoutTimer((s) => s.startRest);
  const incrementSets = useWorkoutTimer((s) => s.incrementSets);
  const setActiveExercise = useWorkoutSession((s) => s.setActiveExercise);

  const handleToggleComplete = useCallback(
    (idx: number) => {
      setLocalSets((prev) => {
        const next = [...prev];
        const row = next[idx];
        if (!row) return prev;

        const wasCompleted = row.completed;
        const nowCompleted = !wasCompleted;
        next[idx] = { ...row, completed: nowCompleted };

        if (!wasCompleted && row.weight && row.reps) {
          // Ensure this exercise is active before logging
          setActiveExercise(exerciseName);

          // Push local values to store inputs so logSet reads them
          const ws = useWorkoutSession.getState();
          ws.updateInput("weight", row.weight);
          ws.updateInput("reps", row.reps);
          const result = logSet();

          if (result.ok) {
            startRest(90);
            incrementSets();
          }
        }

        return next;
      });
    },
    [exerciseName, startRest, incrementSets, logSet, setActiveExercise]
  );

  const handleWeightChange = useCallback((idx: number, v: string) => {
    setLocalSets((prev) => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], weight: v };
      return next;
    });
  }, []);

  const handleRepsChange = useCallback((idx: number, v: string) => {
    setLocalSets((prev) => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], reps: v };
      return next;
    });
  }, []);

  // Ensure at least one editable row if active
  const displaySets = localSets.length > 0 ? localSets : isActive ? [{ weight: "", reps: "", completed: false }] : [];

  return (
    <div className="mt-3 space-y-2">
      {displaySets.map((set, i) => (
        <SetRow
          key={`${exerciseName}-set-${i}`}
          index={i}
          weight={set.weight}
          reps={set.reps}
          completed={set.completed}
          onWeightChange={(v) => handleWeightChange(i, v)}
          onRepsChange={(v) => handleRepsChange(i, v)}
          onToggleComplete={() => handleToggleComplete(i)}
        />
      ))}
      {/* Append row button for active exercise */}
      {isActive && (
        <button
          onClick={() => setLocalSets((prev) => [...prev, { weight: "", reps: "", completed: false }])}
          className="w-full py-2.5 rounded-xl text-xs font-bold runtime-tap"
          style={{
            background: "var(--rvl-surface-1)",
            color: "var(--rvl-text-faint)",
            border: "1px dashed var(--rvl-border-subtle)",
          }}
        >
          + 添加组
        </button>
      )}
    </div>
  );
});

// ── Main Card ──

interface ExerciseRuntimeCardProps {
  exerciseName: string;
  isActive?: boolean;
}

/**
 * ExerciseRuntimeCard
 *
 * Structure:
 * ExerciseRuntimeCard
 * ├─ ExerciseIdentityLayer
 * ├─ HistoricalPerformanceStrip
 * ├─ WarmupSuggestionInline
 * ├─ SetExecutionCluster
 * ├─ RestTimerInline
 * ├─ VolumeContribution
 * └─ RuntimeFeedbackLayer
 */
const ExerciseRuntimeCard = memo(function ExerciseRuntimeCard({
  exerciseName,
  isActive = false,
}: ExerciseRuntimeCardProps) {
  const projection = useExerciseProjection(exerciseName);
  const [expanded, setExpanded] = useState(isActive);

  const completedVol = projection.sets
    .filter((s) => s.completed && !s.isWarmup)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);

  // Derive fake warmup suggestion from first completed set or default
  const firstSet = projection.sets.find((s) => s.completed && !s.isWarmup);
  const warmups = firstSet
    ? [
        { weight: Math.round(firstSet.weight * 0.25), reps: 12 },
        { weight: Math.round(firstSet.weight * 0.5), reps: 8 },
        { weight: Math.round(firstSet.weight * 0.75), reps: 5 },
      ]
    : [];

  // Fake history strip from completed sets
  const history = projection.sets
    .filter((s) => s.completed && !s.isWarmup)
    .map((s) => ({ weight: s.weight, reps: s.reps }));

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: isActive ? "var(--rvl-surface-2)" : "var(--rvl-surface-1)",
        border: isActive ? "1px solid var(--rvl-border-med)" : "1px solid var(--rvl-border-subtle)",
        boxShadow: isActive ? "0 0 20px rgba(184,255,43,0.04)" : "none",
      }}
    >
      {/* Header: identity + expand */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-start justify-between gap-2 text-left"
      >
        <ExerciseIdentityLayer
          name={exerciseName}
          muscleGroup="Compound"
          lastRecord={history.length > 0 ? `${history[history.length - 1].weight}kg × ${history[history.length - 1].reps}` : undefined}
          isActive={isActive}
        />
        <div className="shrink-0 mt-1" style={{ color: "var(--rvl-text-faint)" }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Historical strip */}
      {expanded && <HistoricalPerformanceStrip history={history} currentWeight={firstSet?.weight} />}

      {/* Warmup inline */}
      {expanded && warmups.length > 0 && !firstSet && <WarmupSuggestionInline warmups={warmups} />}

      {/* Volume contribution */}
      {completedVol > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rvl-text-faint)" }}>
            Volume
          </span>
          <span
            className="text-xs font-black tabular-nums"
            style={{ color: "var(--rvl-active)" }}
          >
            {completedVol.toLocaleString()}kg
          </span>
        </div>
      )}

      {/* Set execution cluster */}
      {expanded && (
        <SetExecutionCluster
          exerciseName={exerciseName}
          sets={projection.sets}
          isActive={isActive}
        />
      )}
    </div>
  );
});

export default ExerciseRuntimeCard;
