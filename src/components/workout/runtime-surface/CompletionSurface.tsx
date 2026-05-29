'use client';
import { memo } from 'react';
import { Trophy, Dumbbell, Flame, ChevronRight } from 'lucide-react';

interface CompletionSurfaceProps {
  strongestWeight: number;
  strongestReps: number;
  totalSets: number;
  totalVolume: number;
  onFinish: () => void;
  onClose: () => void;
}

const CompletionSurface = memo(function CompletionSurface({
  strongestWeight, strongestReps, totalSets, totalVolume, onFinish, onClose,
}: CompletionSurfaceProps) {
  return (
    <div className="flex flex-col h-full px-6 text-center items-center justify-center">
      <div className="mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--accent)', boxShadow: '0 0 40px var(--accent-dim)' }}
        >
          <Trophy className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-2xl font-black" style={{ color: 'var(--text-high)' }}>训练完成</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-low)' }}>出色的表现，继续加油</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8">
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Dumbbell className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
          <p className="text-xl font-black tabular-nums">{totalSets}</p>
          <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-low)' }}>总组数</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <Flame className="w-4 h-4 mx-auto mb-2" style={{ color: '#FBBF24' }} />
          <p className="text-xl font-black tabular-nums">{totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 't' : totalVolume}</p>
          <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-low)' }}>总容量</p>
        </div>
        <div className="rounded-2xl p-4 col-span-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-low)' }}>最强组</p>
          <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
            {strongestWeight > 0 ? strongestWeight + 'kg' : '自重'} × {strongestReps}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={onFinish}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97]"
          style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 28px var(--accent-dim)' }}
        >
          <ChevronRight className="w-5 h-5" />
          保存训练
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-xs font-bold transition-all"
          style={{ color: 'var(--text-low)' }}
        >
          继续训练
        </button>
      </div>
    </div>
  );
});

export default CompletionSurface;
