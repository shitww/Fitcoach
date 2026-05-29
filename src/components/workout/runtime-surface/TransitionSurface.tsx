'use client';
import { memo, useEffect } from 'react';
import { Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TransitionSurfaceProps {
  weight: number;
  reps: number;
  score: number;
  action: 'increase' | 'maintain' | 'decrease';
  message: string;
  onDone: () => void;
}

const actionMeta = {
  increase: { icon: TrendingUp, color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  maintain: { icon: Minus, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
  decrease: { icon: TrendingDown, color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
};

const TransitionSurface = memo(function TransitionSurface({ weight, reps, score, action, message, onDone }: TransitionSurfaceProps) {
  useEffect(() => {
    const id = setTimeout(onDone, 800);
    return () => clearTimeout(id);
  }, [onDone]);

  const meta = actionMeta[action] ?? actionMeta.maintain;
  const Icon = meta.icon;

  return (
    <div className="flex flex-col h-full px-6 text-center items-center justify-center" style={{ animation: 'p3-fade-up 0.35s ease-out' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(52,211,153,0.1)' }}>
        <Check className="w-7 h-7" style={{ color: '#34D399' }} />
      </div>
      <p className="text-3xl font-black tabular-nums mb-1" style={{ color: 'var(--text-high)' }}>
        {weight > 0 ? weight + 'kg' : '自重'} × {reps}
      </p>
      <p className="text-sm font-bold mb-5" style={{ color: 'var(--text-low)' }}>得分 {score}</p>

      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl max-w-xs" style={{ background: meta.bg, border: '1px solid var(--border)' }}>
        <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-high)' }}>{message}</span>
      </div>
    </div>
  );
});

export default TransitionSurface;
