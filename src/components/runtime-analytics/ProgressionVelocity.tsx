'use client';
import { memo } from 'react';
import { TrendingUp } from 'lucide-react';

interface ProgressionPoint {
  date: string;
  estimated1RM: number;
}

interface ProgressionVelocityProps {
  exercise: string;
  data: ProgressionPoint[];
  velocity: number;
}

const ProgressionVelocity = memo(function ProgressionVelocity({ exercise, data, velocity }: ProgressionVelocityProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.estimated1RM), 1);
  const min = Math.min(...data.map(d => d.estimated1RM));
  const range = max - min || 1;
  const velocityColor = velocity > 0.05 ? 'var(--rvl-active)' : velocity > 0 ? 'var(--rvl-complete)' : 'var(--rvl-fatigue)';

  return (
    <div className="px-5 pb-4">
      <div className="rounded-2xl p-4 rvl-surface">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--rvl-active)' }} />
            <span className="rvl-label-text">{exercise}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: velocityColor + '18', color: velocityColor }}>
            {velocity > 0 ? '+' : ''}{(velocity * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-end gap-[2px] h-20">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex justify-center items-end">
              <div className="w-full rounded-t-sm transition-all" style={{
                height: ((d.estimated1RM - min) / range * 60 + 20) + '%',
                background: 'var(--rvl-active)',
                opacity: 0.5 + (i / data.length) * 0.5,
                boxShadow: i === data.length - 1 ? '0 0 8px var(--rvl-active-glow)' : 'none',
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProgressionVelocity;
