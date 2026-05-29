'use client';
import { memo, type ReactNode } from 'react';

interface RuntimeProjectionProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: ReactNode;
  accent?: string;
}

const trendMeta = {
  up: { color: '#34D399', arrow: '↑' },
  down: { color: '#F87171', arrow: '↓' },
  neutral: { color: 'var(--text-faint)', arrow: '→' },
};

const RuntimeProjection = memo(function RuntimeProjection({
  label, value, unit, trend = 'neutral', subtitle, icon, accent = 'var(--accent)'
}: RuntimeProjectionProps) {
  const tm = trendMeta[trend];
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      {icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + '18', color: accent }}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black tabular-nums">{value}</span>
          {unit && <span className="text-xs font-bold" style={{ color: 'var(--text-low)' }}>{unit}</span>}
          <span className="text-xs font-black ml-auto" style={{ color: tm.color }}>{tm.arrow}</span>
        </div>
        <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-faint)' }}>{label}</p>
        {subtitle && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-low)' }}>{subtitle}</p>}
      </div>
    </div>
  );
});

export default RuntimeProjection;
