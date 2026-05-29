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
    <div className="flex flex-col h-full px-6 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="mb-8 rounded-full transition-all duration-[4000ms] ease-in-out"
          style={{
            width: 120 + breathe * 16,
            height: 120 + breathe * 16,
            background: 'rgba(52,211,153,0.06)',
            border: '1px solid rgba(52,211,153,0.2)',
          }}
        />
        <Timer className="w-6 h-6 mb-4" style={{ color: 'var(--text-faint)' }} />
        <p className="text-6xl font-black tabular-nums tracking-tight" style={{ color: 'var(--text-high)' }}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </p>
        <p className="text-sm font-medium mt-3" style={{ color: 'var(--text-low)' }}>恢复中…</p>

        {/* Next set preview */}
        {(nextWeight != null || nextReps != null) && (
          <div className="mt-8 px-5 py-3 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-1 justify-center">
              <ArrowUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>下一组建议</span>
            </div>
            <p className="text-lg font-black" style={{ color: 'var(--text-high)' }}>
              {nextWeight != null && nextWeight > 0 ? nextWeight + 'kg' : '自重'}
              {' × '}
              {nextReps != null ? nextReps + '次' : '?'}
            </p>
            {nextExercise && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-low)' }}>{nextExercise}</p>
            )}
          </div>
        )}
      </div>

      <div className="pb-6">
        <button
          onClick={onSkipRest}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm transition-all active:scale-[0.97]"
          style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
        >
          <HeartPulse className="w-4 h-4" />
          跳过休息，直接开始
        </button>
      </div>
    </div>
  );
});

export default RestSurface;
