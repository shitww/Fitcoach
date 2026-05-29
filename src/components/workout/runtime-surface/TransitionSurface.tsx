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
    <div className="flex flex-col h-full px-6 text-center items-center justify-center rvl-animate-enter">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 rvl-glow-active"
        style={{ background: 'var(--rvl-active-dim)', border: '1px solid var(--rvl-active-glow)' }}>
        <Check className="w-8 h-8" style={{ color: 'var(--rvl-active)' }} />
      </div>
      <p className="rvl-headline-text tabular-nums mb-1" style={{ color: 'var(--rvl-text-hero)' }}>
        {weight > 0 ? weight + 'kg' : '自重'} × {reps}
      </p>
      <p className="rvl-label-text mb-6">得分 {score}</p>

      <div className="flex items-center gap-2 px-5 py-4 rounded-2xl max-w-xs rvl-surface-glass"
        style={{ background: meta.bg, border: '1px solid ' + meta.color + '20' }}>
        <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
        <span className="text-xs font-bold" style={{ color: 'var(--rvl-text-high)' }}>{message}</span>
      </div>
    </div>
  );
});

export default TransitionSurface;
