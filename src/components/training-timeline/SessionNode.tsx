'use client';
import { memo } from 'react';

interface SessionNodeProps {
  date: string;
  volume: number;
  sets: number;
  exercises: string[];
  isLatest?: boolean;
  onClick: () => void;
}

const SessionNode = memo(function SessionNode({ date, volume, sets, exercises, isLatest, onClick }: SessionNodeProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        background: isLatest ? 'var(--surface)' : 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black" style={{ color: 'var(--text-high)' }}>{date}</span>
        {isLatest && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>最新</span>}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-lg font-black">{volume >= 1000 ? (volume / 1000).toFixed(1) + 't' : volume}</span>
        <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>{sets} 组</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {exercises.map(e => (
          <span key={e} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-3)', color: 'var(--text-low)' }}>{e}</span>
        ))}
      </div>
    </button>
  );
});

export default SessionNode;
