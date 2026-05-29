'use client';
import { memo } from 'react';
import { Activity } from 'lucide-react';

interface FatigueCycleProps {
  data: { date: string; fatigue: number; recovery: number }[];
}

const FatigueCycle = memo(function FatigueCycle({ data }: FatigueCycleProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => Math.max(d.fatigue, d.recovery)), 1);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>疲劳周期</span>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-end gap-[2px] h-24">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-[2px]">
              <div className="w-full rounded-t-sm" style={{ height: (d.fatigue / max * 100) + '%', background: '#F87171', opacity: 0.6 }} />
              <div className="w-full rounded-t-sm" style={{ height: (d.recovery / max * 100) + '%', background: '#34D399', opacity: 0.6 }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>{data[0]?.date}</span>
          <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
});

export default FatigueCycle;
