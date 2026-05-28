'use client';

import { memo } from 'react';
import { Clock, Dumbbell, Activity, Zap } from 'lucide-react';

interface TrainingStatusBarProps {
  durationSec: number;
  setCount: number;
  totalVolume: number;
  currentExercise?: string;
  isResting?: boolean;
  restRemainingSec?: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const TrainingStatusBar = memo(function TrainingStatusBar({
  durationSec,
  setCount,
  totalVolume,
  currentExercise,
  isResting,
  restRemainingSec,
}: TrainingStatusBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: isResting
          ? 'rgba(251,191,36,0.08)'
          : 'var(--surface-2)',
        border: `1px solid ${isResting ? 'rgba(251,191,36,0.15)' : 'var(--border)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Duration */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Clock className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-black tabular-nums" style={{ color: 'var(--text-med)' }}>
          {formatDuration(durationSec)}
        </span>
      </div>

      <div className="w-px h-3 shrink-0" style={{ background: 'var(--border)' }} />

      {/* Sets */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Dumbbell className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-black tabular-nums" style={{ color: 'var(--text-med)' }}>
          {setCount}
        </span>
      </div>

      <div className="w-px h-3 shrink-0" style={{ background: 'var(--border)' }} />

      {/* Volume */}
      {totalVolume > 0 && (
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-black tabular-nums" style={{ color: 'var(--text-med)' }}>
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
          </span>
        </div>
      )}

      {isResting && restRemainingSec !== undefined && (
        <>
          <div className="w-px h-3 shrink-0" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-1.5 min-w-0">
            <Zap className="w-3 h-3 shrink-0" style={{ color: '#fbbf24' }} />
            <span className="text-xs font-black tabular-nums" style={{ color: '#fbbf24' }}>
              {restRemainingSec}s
            </span>
          </div>
        </>
      )}

      {/* Current exercise */}
      {currentExercise && (
        <>
          <div className="w-px h-3 shrink-0" style={{ background: 'var(--border)' }} />
          <span className="text-[10px] font-semibold truncate max-w-[80px]" style={{ color: 'var(--text-faint)' }}>
            {currentExercise.split(' (')[0]}
          </span>
        </>
      )}
    </div>
  );
});

export default TrainingStatusBar;
