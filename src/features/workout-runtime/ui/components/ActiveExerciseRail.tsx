"use client";

import { memo, useCallback } from "react";
import { Plus } from "lucide-react";
import { useWorkoutSession } from "@/stores/workoutSession";
import { useWorkoutTimer } from "@/stores/workoutTimer";

interface ExerciseChipProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const ExerciseChip = memo(function ExerciseChip({ name, isActive, onClick }: ExerciseChipProps) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold runtime-tap whitespace-nowrap"
      style={{
        background: isActive ? "var(--rvl-active-dim)" : "var(--rvl-surface-2)",
        color: isActive ? "var(--rvl-active)" : "var(--rvl-text-med)",
        border: isActive
          ? "1px solid var(--rvl-active-glow)"
          : "1px solid var(--rvl-border-subtle)",
        boxShadow: isActive ? "0 0 12px var(--rvl-active-glow)" : "none",
        minWidth: 80,
      }}
    >
      {name}
    </button>
  );
});

/**
 * ActiveExerciseRail
 *
 * Horizontal scrollable exercise chips at top of training page.
 * Sources:
 * - Current session exercises
 * - Recently used (localStorage)
 * - AI recommendations (placeholder)
 *
 * Must:
 * - Horizontal scroll
 * - Single-hand friendly
 * - Large tap area
 * - Quick insert
 */
const ActiveExerciseRail = memo(function ActiveExerciseRail() {
  const { exercises, activeExerciseName, setActiveExercise, addCustomExercise } =
    useWorkoutSession();

  const currentExercise = useWorkoutTimer((s) => s.currentExercise);
  const setTimerExercise = useWorkoutTimer((s) => s.setCurrentExercise);

  const handleSelect = useCallback(
    (name: string) => {
      setActiveExercise(name);
      setTimerExercise(name);
    },
    [setActiveExercise, setTimerExercise]
  );

  const handleAdd = useCallback(() => {
    // In a full implementation, this would open a quick-add modal
    // or inline input. For now, we add a placeholder that can be renamed.
    const name = prompt("动作名称:");
    if (name?.trim()) {
      addCustomExercise(name.trim());
      setActiveExercise(name.trim());
      setTimerExercise(name.trim());
    }
  }, [addCustomExercise, setActiveExercise, setTimerExercise]);

  // Build unique chip list: session exercises first, then recents
  const sessionNames = exercises.map((e) => e.name);
  const chipNames = Array.from(new Set(
    [...sessionNames, activeExerciseName, currentExercise].filter((n): n is string => Boolean(n))
  ));

  return (
    <div className="px-5 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {chipNames.map((name) => (
          <ExerciseChip
            key={name}
            name={name}
            isActive={name === activeExerciseName || name === currentExercise}
            onClick={() => handleSelect(name)}
          />
        ))}

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center runtime-tap"
          style={{
            background: "var(--rvl-surface-1)",
            color: "var(--rvl-text-faint)",
            border: "1px dashed var(--rvl-border-subtle)",
          }}
          aria-label="添加动作"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

export default ActiveExerciseRail;
