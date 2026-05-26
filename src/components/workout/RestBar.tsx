'use client';
import { memo, useEffect } from 'react';
import { useWorkoutTimer, selectRestSecondsRemaining, selectWorkoutPhase } from '@/stores/workoutTimer';

const RestBar = memo(function RestBar() {
  const workoutPhase  = useWorkoutTimer(selectWorkoutPhase);
  const restSecs      = useWorkoutTimer(selectRestSecondsRemaining);
  const restTimer     = useWorkoutTimer(s => s.restTimer);
  const completeRest  = useWorkoutTimer(s => s.completeRest);
  const skipRest      = useWorkoutTimer(s => s.skipRest);
  const nextExercise  = useWorkoutTimer(s => s.nextExercise);

  useEffect(() => {
    if (workoutPhase !== 'rest') return;
    if (restSecs > 0) return;
    completeRest();
  }, [restSecs, workoutPhase, completeRest]);

  if (workoutPhase !== 'rest' || restSecs <= 0) return null;

  const isUrgent  = restSecs <= 10;
  const ringColor = isUrgent ? '#ef4444' : '#f59e0b';
  const pct       = restTimer.duration > 0 ? restSecs / restTimer.duration : 0;
  const R         = 14;
  const CIRC      = 2 * Math.PI * R;
  const dash      = pct * CIRC;
  const mins      = Math.floor(restSecs / 60);
  const secs      = restSecs % 60;
  const timeStr   = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${restSecs}`;

  return (
    <div
      className="fixed left-0 right-0 z-[55] flex items-center gap-3 px-4 py-3"
      style={{
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--surface)',
        borderTop: `2px solid ${ringColor}`,
        boxShadow: `0 -4px 20px rgba(0,0,0,0.15)`,
      }}
    >
      {/* Mini ring */}
      <div className="shrink-0 relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx="18" cy="18" r={R} fill="none" strokeWidth="2.5" stroke="var(--border)" />
          <circle
            cx="18" cy="18" r={R} fill="none" strokeWidth="2.5"
            stroke={ringColor} strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <span className="font-black tabular-nums z-10" style={{ fontSize: '0.7rem', color: ringColor }}>
          {timeStr}
        </span>
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold" style={{ color: 'var(--text-low)' }}>
          休息中
        </p>
        {nextExercise && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>
            下一个：<span className="font-semibold" style={{ color: 'var(--text-med)' }}>{nextExercise}</span>
          </p>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={skipRest}
        className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
        style={{
          background: 'var(--surface-3)',
          color: 'var(--text-low)',
          border: '1px solid var(--border)',
          touchAction: 'manipulation',
        }}
      >
        跳过
      </button>
    </div>
  );
});

export default RestBar;
