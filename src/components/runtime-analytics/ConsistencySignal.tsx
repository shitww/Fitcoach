'use client';
import { memo } from 'react';
import { Flame } from 'lucide-react';

interface ConsistencySignalProps {
  score: number;
  weeklySets: number[];
  targetSets: number;
}

const ConsistencySignal = memo(function ConsistencySignal({ score, weeklySets, targetSets }: ConsistencySignalProps) {
  const max = Math.max(...weeklySets, targetSets, 1);
  const color = score > 0.8 ? '#34D399' : score > 0.5 ? '#FBBF24' : '#F87171';
  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>训练一致性</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black" style={{ color }}>{Math.round(score * 100)}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>一致性指数</span>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {weeklySets.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1">
              <div className="w-full rounded-t-md transition-all"
                style={{ height: (s / max * 100) + '%', background: s >= targetSets ? '#34D399' : 'var(--accent)', opacity: s >= targetSets ? 0.8 : 0.4 }} />
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ConsistencySignal;
