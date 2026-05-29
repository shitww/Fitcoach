'use client';
import { memo } from 'react';
import { HeartPulse, TrendingUp, TrendingDown } from 'lucide-react';

interface RecoveryProjectionProps {
  muscleGroups: { name: string; readiness: number; status: 'ready' | 'fatigued' | 'recovering' }[];
}

const statusMeta = {
  ready: { color: 'var(--rvl-active)', bg: 'var(--rvl-active-dim)', icon: TrendingUp },
  recovering: { color: 'var(--rvl-complete)', bg: 'var(--rvl-complete-dim)', icon: TrendingDown },
  fatigued: { color: 'var(--rvl-fatigue)', bg: 'var(--rvl-fatigue-dim)', icon: TrendingDown },
};

const RecoveryProjection = memo(function RecoveryProjection({ muscleGroups }: RecoveryProjectionProps) {
  if (muscleGroups.length === 0) return null;
  return (
    <div className="px-5 pb-4">
      <p className="rvl-label-text mb-3">肌群恢复</p>
      <div className="space-y-2">
        {muscleGroups.map((mg) => {
          const meta = statusMeta[mg.status];
          const Icon = meta.icon;
          return (
            <div key={mg.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: meta.bg, border: '1px solid var(--rvl-border-subtle)' }}>
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
              <span className="text-xs font-semibold flex-1" style={{ color: 'var(--rvl-text-high)' }}>{mg.name}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--rvl-surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: mg.readiness * 100 + '%', background: meta.color, boxShadow: '0 0 6px ' + meta.color + '40' }} />
              </div>
              <span className="text-[10px] font-bold tabular-nums shrink-0 w-6 text-right" style={{ color: meta.color }}>{Math.round(mg.readiness * 100)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default RecoveryProjection;
