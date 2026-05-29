'use client';
import { memo } from 'react';
import { TrendingUp } from 'lucide-react';

interface ProgressionArcProps {
  strongestLift: { name: string; weight: number };
  prCount: number;
}

const ProgressionArc = memo(function ProgressionArc({ strongestLift, prCount }: ProgressionArcProps) {
  return (
    <div className="px-5 pb-4">
      <div className="rounded-3xl p-5 rvl-surface-elevated">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--rvl-active)' }} />
          <span className="rvl-label-text">力量进展</span>
        </div>
        <p className="rvl-headline-text" style={{ color: 'var(--rvl-text-hero)' }}>
          {strongestLift.weight > 0 ? strongestLift.weight + 'kg' : '自重'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--rvl-text-faint)' }}>{strongestLift.name}</p>
        {prCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl inline-flex" style={{ background: 'var(--rvl-active-dim)', border: '1px solid var(--rvl-border-subtle)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--rvl-active)' }}>{prCount} 项 PR</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProgressionArc;
