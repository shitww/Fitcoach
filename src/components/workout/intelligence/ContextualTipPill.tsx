'use client';

import { memo } from 'react';
import { Lightbulb, AlertCircle, Info } from 'lucide-react';
import type { ContextualTip } from '@/lib/training/trainingTypes';

interface ContextualTipPillProps {
  tip: ContextualTip;
}

const urgencyMeta: Record<
  ContextualTip['urgency'],
  { icon: typeof Lightbulb; color: string; bg: string }
> = {
  subtle: { icon: Info, color: 'var(--text-faint)', bg: 'var(--surface-2)' },
  notice: { icon: Lightbulb, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  alert: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

const ContextualTipPill = memo(function ContextualTipPill({ tip }: ContextualTipPillProps) {
  const meta = urgencyMeta[tip.urgency];
  const Icon = meta.icon;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: meta.bg, border: '1px solid var(--border)' }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
      <span
        className="text-[11px] font-semibold leading-snug"
        style={{ color: 'var(--text-med)' }}
      >
        {tip.text}
      </span>
    </div>
  );
});

export default ContextualTipPill;
