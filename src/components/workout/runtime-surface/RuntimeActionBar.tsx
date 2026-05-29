'use client';
import { memo } from 'react';
import { ChevronRight, Dumbbell } from 'lucide-react';

interface RuntimeActionBarProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  disabled?: boolean;
  accent?: string;
}

const RuntimeActionBar = memo(function RuntimeActionBar({
  primaryLabel, onPrimary, secondaryLabel, onSecondary, disabled, accent = 'var(--accent)'
}: RuntimeActionBarProps) {
  return (
    <div className="px-5 pb-6 pt-3 space-y-3">
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.97]"
          style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
        >
          <ChevronRight className="w-4 h-4" />
          {secondaryLabel}
        </button>
      )}
      <button
        onClick={onPrimary}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97]"
        style={{
          background: accent,
          color: '#000',
          opacity: disabled ? 0.45 : 1,
          boxShadow: '0 0 28px ' + accent + '33',
        }}
      >
        <Dumbbell className="w-5 h-5" />
        {primaryLabel}
      </button>
    </div>
  );
});

export default RuntimeActionBar;
