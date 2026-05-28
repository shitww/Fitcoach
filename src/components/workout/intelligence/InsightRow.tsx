'use client';

import { memo } from 'react';
import { TrendingUp, Trophy, Clock, Activity, Zap, Shield } from 'lucide-react';
import type { TrainingInsight } from '@/lib/training/trainingTypes';

interface InsightRowProps {
  insight: TrainingInsight;
}

const typeMeta: Record<
  TrainingInsight['type'],
  { icon: typeof TrendingUp; color: string }
> = {
  volume_trend: { icon: TrendingUp, color: 'var(--accent)' },
  pr_milestone: { icon: Trophy, color: '#fbbf24' },
  frequency_gap: { icon: Clock, color: 'var(--text-faint)' },
  recovery_quality: { icon: Shield, color: '#ef4444' },
  consistency: { icon: Activity, color: 'var(--accent)' },
  technique: { icon: Zap, color: 'var(--accent)' },
};

const severityMeta: Record<
  TrainingInsight['severity'],
  { bg: string }
> = {
  positive: { bg: 'var(--accent-dim)' },
  neutral: { bg: 'var(--surface-2)' },
  attention: { bg: 'rgba(239,68,68,0.06)' },
};

const InsightRow = memo(function InsightRow({ insight }: InsightRowProps) {
  const meta = typeMeta[insight.type];
  const sev = severityMeta[insight.severity];
  const Icon = meta.icon;

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
      style={{ background: sev.bg, border: '1px solid var(--border)' }}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: meta.color }} />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-high)' }}>
          {insight.text}
        </p>
        {insight.detail && (
          <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-low)' }}>
            {insight.detail}
          </p>
        )}
      </div>
    </div>
  );
});

export default InsightRow;
