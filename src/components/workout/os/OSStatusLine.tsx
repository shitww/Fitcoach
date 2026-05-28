'use client';

import { memo } from 'react';
import { Activity, Heart, Clock, Flame, CheckCircle2 } from 'lucide-react';
import type { OSDisplayItem } from '@/lib/training/orchestrator/trainingExperienceController';

interface OSStatusLineProps {
  item: OSDisplayItem;
}

const typeMeta: Record<OSDisplayItem['type'], { icon: typeof Activity; defaultColor: string }> = {
  badge: { icon: Flame, defaultColor: 'var(--accent)' },
  status: { icon: Activity, defaultColor: 'var(--text-low)' },
  chip: { icon: CheckCircle2, defaultColor: 'var(--accent)' },
  narrative: { icon: Flame, defaultColor: 'var(--text-high)' },
  progression: { icon: Flame, defaultColor: 'var(--accent)' },
  warmup: { icon: Clock, defaultColor: '#f59e0b' },
  tip: { icon: Heart, defaultColor: 'var(--text-med)' },
};

const variantColor: Record<OSDisplayItem['variant'], string> = {
  positive: 'var(--accent)',
  neutral: 'var(--text-low)',
  attention: '#f59e0b',
  critical: '#ef4444',
  subtle: 'var(--text-faint)',
};

const OSStatusLine = memo(function OSStatusLine({ item }: OSStatusLineProps) {
  const meta = typeMeta[item.type];
  const Icon = meta.icon;
  const color = variantColor[item.variant];

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-high)' }}>
        {item.text}
      </span>
      {item.action && (
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-3)', color }}>
          {item.action}
        </span>
      )}
    </div>
  );
});

export default OSStatusLine;
