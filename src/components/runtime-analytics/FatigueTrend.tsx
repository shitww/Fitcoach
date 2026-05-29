'use client';
import { memo } from 'react';
import { Zap } from 'lucide-react';

interface FatiguePoint {
  date: string;
  fatigue: number;
  recovery: number;
}

interface FatigueTrendProps {
  data: FatiguePoint[];
}

const FatigueTrend = memo(function FatigueTrend({ data }: FatigueTrendProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => Math.max(d.fatigue, d.recovery)), 1);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>疲劳与恢复</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-end gap-[3px] h-28">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-[3px] relative group">
              <div className="w-full rounded-t-sm transition-all" style={{ height: (d.recovery / max * 100) + '%', background: '#34D399', opacity: 0.5 }} />
              <div className="w-full rounded-t-sm transition-all" style={{ height: (d.fatigue / max * 100) + '%', background: '#F87171', opacity: 0.5 }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#34D399', opacity: 0.5 }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>恢复</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#F87171', opacity: 0.5 }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>疲劳</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FatigueTrend;
