'use client';

import { memo } from 'react';
import { Trophy, Flame } from 'lucide-react';
interface SetLike {
  id?: string;
  weight: number;
  reps: number;
  rir?: number | null;
  isBodyweight?: boolean;
  isFailure?: boolean;
  estimated1RM?: number;
  completed?: boolean;
  isWarmup?: boolean;
  createdAt?: number;
}

interface SetRowProps {
  index: number;
  set: SetLike;
  isPR?: boolean;
  onDelete?: () => void;
}

const SetRow = memo(function SetRow({ index, set, isPR, onDelete }: SetRowProps) {
  const isWarmup = set.isWarmup;
  const vol = set.isBodyweight ? 0 : set.weight * set.reps;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all"
      style={{
        background: isWarmup
          ? 'rgba(96,165,250,0.06)'
          : isPR
            ? 'rgba(251,191,36,0.06)'
            : 'var(--surface-2)',
        border: `1px solid ${isWarmup ? 'rgba(96,165,250,0.12)' : isPR ? 'rgba(251,191,36,0.15)' : 'var(--border)'}`,
        opacity: isWarmup ? 0.72 : 1,
        touchAction: 'manipulation',
      }}
    >
      {/* Set number */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isWarmup
            ? 'rgba(96,165,250,0.12)'
            : isPR
              ? 'rgba(251,191,36,0.12)'
              : 'var(--surface)',
        }}
      >
        <span
          className="text-[10px] font-black"
          style={{ color: isWarmup ? '#60A5FA' : isPR ? '#fbbf24' : 'var(--text-low)' }}
        >
          {index + 1}
        </span>
      </div>

      {/* Main data */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {isWarmup ? (
          <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>
            热身 {set.weight}kg × {set.reps}
          </span>
        ) : set.isBodyweight ? (
          <span className="text-xs font-bold" style={{ color: 'var(--text-med)' }}>
            自重 × {set.reps}次
          </span>
        ) : (
          <span className="text-xs font-bold" style={{ color: 'var(--text-med)' }}>
            {set.weight}kg × {set.reps}次
          </span>
        )}
        {set.rir !== null && set.rir !== undefined && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}>
            RIR {set.rir}
          </span>
        )}
        {set.isFailure && (
          <Flame className="w-3 h-3 shrink-0" style={{ color: '#ef4444' }} />
        )}
      </div>

      {/* PR / Volume / Delete */}
      <div className="flex items-center gap-2 shrink-0">
        {isPR && (
          <span className="flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
            <Trophy className="w-2.5 h-2.5" />
            PR
          </span>
        )}
        {!isWarmup && vol > 0 && (
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--text-faint)' }}>
            {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
          </span>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'transparent' }}
            aria-label="删除组"
          >
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>×</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default SetRow;
