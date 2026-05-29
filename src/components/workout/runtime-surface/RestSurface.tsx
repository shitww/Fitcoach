'use client';
import { memo, useEffect, useState } from 'react';
import { Timer, HeartPulse, ArrowUp } from 'lucide-react';
import { useWorkoutTimer, selectRestSecondsRemaining } from '@/stores/workoutTimer';

interface RestSurfaceProps {
  nextWeight?: number;
  nextReps?: number;
  nextExercise?: string;
  onSkipRest: () => void;
}

const RestSurface = memo(function RestSurface({ nextWeight, nextReps, nextExercise, onSkipRest }: RestSurfaceProps) {
  const restSecs = useWorkoutTimer(selectRestSecondsRemaining);
  const [breathe, setBreathe] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setBreathe((p) => (p + 1) % 2), 4000);
    return () => clearInterval(id);
  }, []);

  const m = Math.floor(Math.max(0, restSecs) / 60);
  const s = Math.max(0, restSecs) % 60;

  return (
    <div className="flex flex-col h-full px-6 text-center rvl-animate-enter">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Breathing ring */}
        <div className="relative mb-10">
          <div
            className="rounded-full rvl-animate-breathe transition-all duration-[4000ms] ease-in-out"
            style={{
              width: 140 + breathe * 20,
              height: 140 + breathe * 20,
              background: 'radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 70%)',
              border: '1px solid rgba(0,229,204,0.15)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{
              background: 'var(--rvl-surface-2)',
              border: '1px solid var(--rvl-border-subtle)',
              boxShadow: '0 0 40px var(--rvl-rest-glow), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <Timer className="w-8 h-8" style={{ color: 'var(--rvl-rest)' }} />
          </div>
        </div>

        <p className="rvl-hero-text tabular-nums tracking-tight" style={{ color: 'var(--rvl-text-hero)' }}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </p>
        <p className="rvl-label-text mt-3">恢复中…</p>

        {/* Next set preview */}
        {(nextWeight != null || nextReps != null) && (
          <div className="mt-8 px-5 py-4 rounded-2xl rvl-surface-glass" style={{ border: '1px solid var(--rvl-rest-dim)' }}>
            <div className="flex items-center gap-2 mb-1 justify-center">
              <ArrowUp className="w-3.5 h-3.5" style={{ color: 'var(--rvl-rest)' }} />
              <span className="rvl-label-text">下一组建议</span>
            </div>
            <p className="rvl-title-text" style={{ color: 'var(--rvl-text-high)' }}>
              {nextWeight != null && nextWeight > 0 ? nextWeight + 'kg' : '自重'}
              {' × '}
              {nextReps != null ? nextReps + '次' : '?'}
            </p>
            {nextExercise && (
              <p className="text-xs mt-1" style={{ color: 'var(--rvl-text-faint)' }}>{nextExercise}</p>
            )}
          </div>
        )}
      </div>

      <div className="pb-6">
        <button
          onClick={onSkipRest}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm transition-all active:scale-[0.97] rvl-btn-ghost"
        >
          <HeartPulse className="w-4 h-4" />
          跳过休息，直接开始
        </button>
      </div>
    </div>
  );
});

export default RestSurface;
