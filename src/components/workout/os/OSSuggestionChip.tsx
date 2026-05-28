'use client';

import { memo } from 'react';
import { Lightbulb, Info, AlertCircle, Zap, Shield } from 'lucide-react';
import type { OSDisplayItem } from '@/lib/training/orchestrator/trainingExperienceController';

interface OSSuggestionChipProps {
  item: OSDisplayItem;
  onAction?: () => void;
}

const variantMeta: Record<
  OSDisplayItem['variant'],
  { icon: typeof Lightbulb; color: string; bg: string }
> = {
  positive: { icon: Zap, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  neutral: { icon: Info, color: 'var(--text-low)', bg: 'var(--surface-2)' },
  attention: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  critical: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  subtle: { icon: Lightbulb, color: 'var(--text-faint)', bg: 'var(--surface-2)' },
};

const OSSuggestionChip = memo(function OSSuggestionChip({ item, onAction }: OSSuggestionChipProps) {
  const meta = variantMeta[item.variant];
  const Icon = meta.icon;

  return (
    <button
      onClick={onAction}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left w-full transition-all active:scale-[0.98]"
      style={{
        background: meta.bg,
        border: '1px solid var(--border)',
        touchAction: 'manipulation',
      }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
      <span className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text-med)' }}>
        {item.text}
      </span>
      {item.action && (
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap" style={{ background: 'var(--surface)', color: meta.color }}>
          {item.action}
        </span>
      )}
    </button>
  );
});

export default OSSuggestionChip;
