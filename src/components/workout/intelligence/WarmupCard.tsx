'use client';

import { memo, useState } from 'react';
import { Flame, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { WarmupPlan } from '@/lib/training/trainingTypes';

interface WarmupCardProps {
  plan: WarmupPlan | null;
  onLogWarmupSet?: (weight: number, reps: number) => void;
}

const WarmupCard = memo(function WarmupCard({ plan, onLogWarmupSet }: WarmupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (!plan || plan.sets.length === 0) return null;

  const toggleCheck = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-high)' }}>
            热身建议
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
            {plan.sets.length} 组
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {plan.note && (
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
              {plan.note}
            </p>
          )}
          {plan.sets.map((set, i) => (
            <button
              key={i}
              onClick={() => {
                toggleCheck(i);
                onLogWarmupSet?.(set.weight, set.reps);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors"
              style={{
                background: checked.has(i) ? 'var(--surface-3)' : 'var(--surface)',
                border: '1px solid var(--border)',
                touchAction: 'manipulation',
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: checked.has(i) ? 'var(--accent)' : 'var(--surface-3)',
                  border: '1px solid var(--border)',
                }}
              >
                {checked.has(i) && (
                  <Check className="w-3 h-3" style={{ color: 'var(--accent-text)' }} />
                )}
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-high)' }}>
                {set.weight > 0 ? `${set.weight}kg` : '自重'}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>
                × {set.reps} 次
              </span>
              <span
                className="ml-auto text-[10px] font-medium tabular-nums"
                style={{ color: 'var(--text-faint)' }}
              >
                {Math.round(set.percentOfWorkWeight * 100)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default WarmupCard;
