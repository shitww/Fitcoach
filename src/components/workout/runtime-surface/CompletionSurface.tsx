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
    <div className="flex flex-col h-full px-6 text-center items-center justify-center rvl-animate-scale-in">
      <div className="mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 rvl-glow-complete"
          style={{ background: 'linear-gradient(135deg, var(--rvl-complete), #FFA500)' }}
        >
          <Trophy className="w-12 h-12" style={{ color: '#000' }} />
        </div>
        <h2 className="rvl-headline-text">训练完成</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--rvl-text-faint)' }}>出色的表现，继续加油</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8">
        <div className="rounded-2xl p-4 rvl-surface" style={{ border: '1px solid var(--rvl-border-subtle)' }}>
          <Dumbbell className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--rvl-complete)' }} />
          <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--rvl-text-high)' }}>{totalSets}</p>
          <p className="rvl-label-text mt-1">总组数</p>
        </div>
        <div className="rounded-2xl p-4 rvl-surface" style={{ border: '1px solid var(--rvl-border-subtle)' }}>
          <Flame className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--rvl-fatigue)' }} />
          <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--rvl-text-high)' }}>{totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 't' : totalVolume}</p>
          <p className="rvl-label-text mt-1">总容量</p>
        </div>
        <div className="rounded-2xl p-4 col-span-2 rvl-surface" style={{ border: '1px solid var(--rvl-border-subtle)' }}>
          <p className="rvl-label-text mb-1">最强组</p>
          <p className="rvl-headline-text" style={{ color: 'var(--rvl-complete)' }}>
            {strongestWeight > 0 ? strongestWeight + 'kg' : '自重'} × {strongestReps}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={onFinish}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97] rvl-btn-primary"
          style={{ background: 'linear-gradient(135deg, var(--rvl-complete), #FFA500)', color: '#000', boxShadow: '0 0 32px var(--rvl-complete-glow)' }}
        >
          <ChevronRight className="w-5 h-5" />
          保存训练
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-xs font-bold transition-all rvl-btn-ghost"
        >
          继续训练
        </button>
      </div>
    </div>
  );
});

export default CompletionSurface;
