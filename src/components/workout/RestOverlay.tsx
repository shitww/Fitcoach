'use client';
import { memo, useEffect } from 'react';
import { useWorkoutTimer, selectRestSecondsRemaining, selectWorkoutPhase } from '@/stores/workoutTimer';
import { buildRestPulse, computeRingParams } from '@/lib/workout-runtime/motion/buildRestPulse';

interface RestOverlayProps {
  onSkip: () => void;
  nextExercise?: string;
  nextSetPrediction?: { weight: number | null; reps: number | null } | null;
  insight?: string | null;
}

const RestOverlay = memo(function RestOverlay({ onSkip, nextExercise, nextSetPrediction, insight }: RestOverlayProps) {
  const workoutPhase = useWorkoutTimer(selectWorkoutPhase);
  const restTimer    = useWorkoutTimer(s => s.restTimer);
  const completeRest = useWorkoutTimer(s => s.completeRest);
  const restSecs     = useWorkoutTimer(selectRestSecondsRemaining);

  useEffect(() => {
    if (workoutPhase !== 'rest') return;
    if (restSecs > 0) return;
    completeRest();
  }, [restSecs, workoutPhase, completeRest]);

  if (workoutPhase !== 'rest' || restSecs <= 0) return null;

  const pulse      = buildRestPulse(restSecs, restTimer.duration, nextExercise ?? null);
  const R          = 88;
  const { dash, circumference: CIRC } = computeRingParams(restSecs, restTimer.duration, R);
  const ringColor  = pulse.ringColor;
  const glowRgb    = pulse.glowRgb;
  const mins       = Math.floor(restSecs / 60);
  const secs       = restSecs % 60;
  const timeStr    = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${restSecs}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: 'var(--wo-overlay-bg)', backdropFilter: 'blur(10px)' }}
    >
      {/* Top info: next exercise + next set prediction */}
      <div
        className="absolute top-14 left-0 right-0 flex flex-col items-center gap-2 px-6"
        style={{ animation: 'p3-fade-up 0.35s ease-out' }}
      >
        {nextExercise && (
          <div
            className="px-5 py-2 rounded-2xl text-sm font-semibold"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-low)' }}>下一个：</span>
            <span className="font-black ml-1" style={{ color: 'var(--text-high)' }}>
              {nextExercise.split(' (')[0]}
            </span>
          </div>
        )}
        {!nextExercise && nextSetPrediction && (nextSetPrediction.weight || nextSetPrediction.reps) && (
          <div
            className="px-5 py-2 rounded-2xl text-sm font-semibold"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-low)' }}>下一组：</span>
            <span className="font-black ml-1" style={{ color: 'var(--text-high)' }}>
              {nextSetPrediction.weight ? `${nextSetPrediction.weight}kg` : '自重'}
              {nextSetPrediction.reps ? ` × ${nextSetPrediction.reps}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        {/* Breathing glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${glowRgb},0.14) 0%, transparent 68%)`,
            animation: 'p3-breathe 3.5s ease-in-out infinite',
          }}
        />
        {/* SVG ring — depletes counter-clockwise as rest ticks down */}
        <svg
          className="absolute inset-0"
          width="240" height="240" viewBox="0 0 240 240"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle cx="120" cy="120" r={R} fill="none" strokeWidth="5"
            stroke="rgba(255,255,255,0.06)" />
          <circle
            cx="120" cy="120" r={R} fill="none" strokeWidth="5"
            stroke={ringColor} strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        {/* Countdown number */}
        <div className="flex flex-col items-center gap-1 z-10">
          <span
            className="font-black tabular-nums leading-none"
            style={{ fontSize: mins > 0 ? '3.8rem' : '4.5rem', color: ringColor, letterSpacing: '-0.02em' }}
          >
            {timeStr}
          </span>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            休息中
          </span>
        </div>
      </div>

      {/* Insight line */}
      {insight && (
        <p
          className="mt-4 text-xs text-center px-8"
          style={{ color: 'var(--text-faint)', animation: 'p3-fade-up 0.4s ease-out 0.2s both' }}
        >
          {insight}
        </p>
      )}

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="mt-8 px-10 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--text-med)',
          border: '1px solid var(--border)',
          touchAction: 'manipulation',
        }}
      >
        跳过休息
      </button>
    </div>
  );
});

export default RestOverlay;
