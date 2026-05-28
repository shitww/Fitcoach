'use client';

import { memo } from 'react';
import { Flame, Trophy, Wind, Target, Shield } from 'lucide-react';
import type { SessionNarrative } from '@/lib/training/narrative/trainingNarrativeEngine';

interface OSNarrativeBannerProps {
  narrative: SessionNarrative | null;
}

const moodMeta: Record<
  SessionNarrative['mood'],
  { icon: typeof Flame; color: string; bg: string }
> = {
  focused: { icon: Target, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  energized: { icon: Flame, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  calm: { icon: Wind, color: 'var(--text-low)', bg: 'var(--surface-2)' },
  triumphant: { icon: Trophy, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  cautious: { icon: Shield, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  neutral: { icon: Wind, color: 'var(--text-low)', bg: 'var(--surface-2)' },
};

const OSNarrativeBanner = memo(function OSNarrativeBanner({ narrative }: OSNarrativeBannerProps) {
  if (!narrative) return null;

  const meta = moodMeta[narrative.mood];
  const Icon = meta.icon;

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.color}20`,
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
      <span className="text-sm font-bold leading-snug" style={{ color: 'var(--text-high)' }}>
        {narrative.text}
      </span>
    </div>
  );
});

export default OSNarrativeBanner;
