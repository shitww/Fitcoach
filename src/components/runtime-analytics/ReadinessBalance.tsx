'use client';
import { memo } from 'react';
import { Shield } from 'lucide-react';

interface MuscleReadiness {
  name: string;
  readiness: number;
  lastTrained: string;
}

interface ReadinessBalanceProps {
  muscles: MuscleReadiness[];
}

const ReadinessBalance = memo(function ReadinessBalance({ muscles }: ReadinessBalanceProps) {
  if (muscles.length === 0) return null;
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>肌群平衡</p>
      </div>
      <div className="space-y-2">
        {muscles.map((m) => {
          const color = m.readiness > 0.7 ? '#34D399' : m.readiness > 0.4 ? '#FBBF24' : '#F87171';
          return (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-xs font-semibold w-10 shrink-0" style={{ color: 'var(--text-med)' }}>{m.name}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: m.readiness * 100 + '%', background: color }} />
              </div>
              <span className="text-[10px] font-bold tabular-nums shrink-0 w-6 text-right" style={{ color }}>{Math.round(m.readiness * 100)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ReadinessBalance;
