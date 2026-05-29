'use client';
import { memo } from 'react';
import type { V2SessionLog } from '@/lib/workout-runtime/v2';
import RuntimeBackground from './RuntimeBackground';
import RuntimeHeader from './RuntimeHeader';
import ActiveSetSurface from './ActiveSetSurface';
import RestSurface from './RestSurface';
import TransitionSurface from './TransitionSurface';
import CompletionSurface from './CompletionSurface';

interface Exercise {
  id: string;
  name: string;
  sets: { weight: number; reps: number; isBodyweight: boolean }[];
  totalVolume: number;
}

export type SurfacePhase = 'active' | 'transition' | 'rest' | 'completion';

interface WorkoutRuntimeSurfaceProps {
  phase: SurfacePhase;
  currentExercise: string;
  weight: string;
  reps: string;
  rir: string;
  isBodyweight: boolean;
  restTime: string;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onRirChange: (v: string) => void;
  onRestTimeChange: (v: string) => void;
  onBodyweightToggle: () => void;
  onLogSet: () => void;
  onSkipRest: () => void;
  onFinishWorkout: () => void;
  onCloseCompletion: () => void;
  onBack: () => void;
  recommendedWeight?: number;
  decisionMessage?: string;
  fatigueScore?: number;
  intelligenceLogs: V2SessionLog[];
  exercises: Exercise[];
  completedSetsCount: number;
  showFinish?: boolean;
}

const WorkoutRuntimeSurface = memo(function WorkoutRuntimeSurface(props: WorkoutRuntimeSurfaceProps) {
  const {
    phase, currentExercise, weight, reps, rir, isBodyweight, restTime,
    onWeightChange, onRepsChange, onRirChange, onRestTimeChange, onBodyweightToggle,
    onLogSet, onSkipRest, onFinishWorkout, onCloseCompletion, onBack,
    recommendedWeight, decisionMessage, fatigueScore,
    intelligenceLogs, exercises, completedSetsCount, showFinish,
  } = props;

  const bgVariant = phase === 'rest' ? 'rest' : phase === 'completion' ? 'completion' : 'active';
  const ambientClass =
    phase === 'rest' ? 'rvl-ambient-rest' :
    phase === 'completion' ? 'rvl-ambient-complete' :
    'rvl-ambient-active';
  const lastLog = intelligenceLogs[intelligenceLogs.length - 1];

  // Completion stats
  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0);
  const totalVolume = exercises.reduce((s, e) => s + e.totalVolume, 0);
  let strongestWeight = 0;
  let strongestReps = 0;
  for (const ex of exercises) {
    for (const st of ex.sets) {
      if (st.weight > strongestWeight || (st.weight === strongestWeight && st.reps > strongestReps)) {
        strongestWeight = st.weight;
        strongestReps = st.reps;
      }
    }
  }

  return (
    <div className={`fixed inset-0 flex flex-col text-foreground ${ambientClass}`} style={{ zIndex: 1 }}>
      <RuntimeBackground variant={bgVariant} />
      <RuntimeHeader onBack={onBack} onFinish={onFinishWorkout} showFinish={showFinish} />

      <div className="flex-1 overflow-hidden relative">
        {phase === 'active' && (
          <ActiveSetSurface
            exercise={currentExercise}
            setNumber={completedSetsCount + 1}
            weight={weight}
            reps={reps}
            rir={rir}
            isBodyweight={isBodyweight}
            restTime={restTime}
            onWeightChange={onWeightChange}
            onRepsChange={onRepsChange}
            onRirChange={onRirChange}
            onRestTimeChange={onRestTimeChange}
            onBodyweightToggle={onBodyweightToggle}
            onLogSet={onLogSet}
            decisionMessage={decisionMessage}
            recommendedWeight={recommendedWeight}
            fatigueScore={fatigueScore}
          />
        )}

        {phase === 'transition' && lastLog && (
          <TransitionSurface
            weight={lastLog.set.weight}
            reps={lastLog.set.reps}
            score={lastLog.score.score}
            action={lastLog.decision.action}
            message={lastLog.decision.message}
            onDone={() => {}}
          />
        )}

        {phase === 'rest' && lastLog && (
          <RestSurface
            nextWeight={lastLog.decision.nextWeight}
            nextReps={lastLog.decision.nextReps}
            nextExercise={currentExercise}
            onSkipRest={onSkipRest}
          />
        )}

        {phase === 'completion' && (
          <CompletionSurface
            strongestWeight={strongestWeight}
            strongestReps={strongestReps}
            totalSets={totalSets}
            totalVolume={totalVolume}
            onFinish={onFinishWorkout}
            onClose={onCloseCompletion}
          />
        )}
      </div>
    </div>
  );
});

export default WorkoutRuntimeSurface;
