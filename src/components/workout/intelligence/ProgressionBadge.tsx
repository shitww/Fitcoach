'use client';

import { memo } from 'react';
import { TrendingUp, Minus, TrendingDown, AlertTriangle } from 'lucide-react';
import type { ProgressionRecommendation } from '@/lib/training/trainingTypes';

interface ProgressionBadgeProps {
  recommendation: ProgressionRecommendation | null;
  compact?: boolean;
}

const actionMeta: Record<
  NonNullable<ProgressionRecommendation['action']>,
  { icon: typeof TrendingUp; color: string; bg: string; label: string }
> = {
  increase: {
    icon: TrendingUp,
    color: 'var(--wo-rest-urgent)',
    bg: 'rgba(239,68,68,0.08)',
    label: '加重',
  },
  maintain: {
    icon: Minus,
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    label: '维持',
  },
  reduce: {
    icon: TrendingDown,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    label: '减重',
  },
  deload: {
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    label: '减载',
  },
};

const ProgressionBadge = memo(function ProgressionBadge({
  recommendation,
  compact = false,
}: ProgressionBadgeProps) {
  if (!recommendation) return null;

  const meta = actionMeta[recommendation.action];
  const Icon = meta.icon;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
        style={{ background: meta.bg, color: meta.color }}
      >
        <Icon className="w-3 h-3" />
        {meta.label}
        {recommendation.targetWeight > 0 && (
          <span className="opacity-80">
            {recommendation.targetWeight}kg × {recommendation.targetReps}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: meta.bg }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--text-high)' }}>
            {meta.label}
          </span>
          {recommendation.targetWeight > 0 && (
            <span className="text-xs font-bold tabular-nums" style={{ color: meta.color }}>
              {recommendation.targetWeight}kg × {recommendation.targetReps}
            </span>
          )}
        </div>
        <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: 'var(--text-low)' }}>
          {recommendation.reason}
        </p>
      </div>
    </div>
  );
});

export default ProgressionBadge;
