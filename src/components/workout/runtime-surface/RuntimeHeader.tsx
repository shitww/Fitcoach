'use client';
import { memo } from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { useWorkoutTimer, selectTrainingSeconds } from '@/stores/workoutTimer';

interface RuntimeHeaderProps {
  onBack: () => void;
  onFinish: () => void;
  showFinish?: boolean;
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

const RuntimeHeader = memo(function RuntimeHeader({ onBack, onFinish, showFinish }: RuntimeHeaderProps) {
  const secs = useWorkoutTimer(selectTrainingSeconds);
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <button
        onClick={onBack}
        className="p-2.5 rounded-xl transition-all active:scale-90"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-low)' }}>
        <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        {fmt(secs)}
      </div>
      {showFinish && (
        <button
          onClick={onFinish}
          className="px-3 py-2 rounded-xl text-xs font-black text-black transition-all"
          style={{ background: 'var(--accent)' }}
        >
          完成
        </button>
      )}
    </div>
  );
});

export default RuntimeHeader;
