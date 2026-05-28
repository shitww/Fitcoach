'use client';

import { memo } from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingUp, Minus, TrendingDown, Zap } from 'lucide-react';
import type { OSDisplayItem } from '@/lib/training/orchestrator/trainingExperienceController';

interface OSBadgeProps {
  item: OSDisplayItem;
}

const variantMeta: Record<
  OSDisplayItem['variant'],
  { icon: typeof AlertTriangle; color: string; bg: string }
> = {
  positive: { icon: TrendingUp, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  neutral: { icon: Info, color: 'var(--text-low)', bg: 'var(--surface-2)' },
  attention: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  critical: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  subtle: { icon: Minus, color: 'var(--text-faint)', bg: 'var(--surface-2)' },
};

const OSBadge = memo(function OSBadge({ item }: OSBadgeProps) {
  const meta = variantMeta[item.variant];
  const Icon = meta.icon;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
      style={{ background: meta.bg, color: meta.color, border: '1px solid var(--border)' }}
    >
      <Icon className="w-3 h-3" />
      <span className="truncate max-w-[200px]">{item.text}</span>
      {item.action && (
        <span className="ml-0.5 opacity-70 font-semibold">· {item.action}</span>
      )}
    </div>
  );
});

export default OSBadge;
