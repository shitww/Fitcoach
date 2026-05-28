'use client';

import { memo } from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { FatigueSignal } from '@/lib/training/trainingTypes';

interface FatigueBannerProps {
  signal: FatigueSignal | null;
}

const levelMeta: Record<
  NonNullable<FatigueSignal['level']>,
  { icon: typeof AlertTriangle; color: string; bg: string }
> = {
  none: { icon: Info, color: 'var(--text-faint)', bg: 'var(--surface-2)' },
  mild: { icon: Info, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  moderate: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  elevated: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

const FatigueBanner = memo(function FatigueBanner({ signal }: FatigueBannerProps) {
  if (!signal) return null;

  const meta = levelMeta[signal.level];
  const Icon = meta.icon;

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
      style={{ background: meta.bg, border: `1px solid ${meta.color}25` }}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: meta.color }} />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-high)' }}>
          {signal.reason}
        </p>
        {signal.suggestion && (
          <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-low)' }}>
            {signal.suggestion}
          </p>
        )}
      </div>
    </div>
  );
});

export default FatigueBanner;
