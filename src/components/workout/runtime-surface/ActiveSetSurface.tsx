'use client';
import { memo } from 'react';
import { Flame, Zap, Minus, Plus } from 'lucide-react';
import RuntimeActionBar from './RuntimeActionBar';

interface ActiveSetSurfaceProps {
  exercise: string;
  setNumber: number;
  targetWeight?: number;
  targetReps?: number;
  weight: string;
  reps: string;
  rir: string;
  isBodyweight: boolean;
  restTime: string;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onRirChange: (v: string) => void;
  onRestTimeChange: (v: string) => void;
  onBodyweightToggle: () => void;
  onLogSet: () => void;
  decisionMessage?: string;
  recommendedWeight?: number;
  fatigueScore?: number;
}

const RIR_META = [
  { value: '4', label: '很轻松' },
  { value: '3', label: '轻松' },
  { value: '2', label: '适中' },
  { value: '1', label: '吃力' },
  { value: '0', label: '力竭' },
];

const ActiveSetSurface = memo(function ActiveSetSurface({
  exercise, setNumber, weight, reps, rir, isBodyweight,
  onWeightChange, onRepsChange, onRirChange, onLogSet, onBodyweightToggle,
  decisionMessage, recommendedWeight, fatigueScore,
}: ActiveSetSurfaceProps) {
  return (
    <div className="flex flex-col h-full rvl-animate-enter">
      {/* Exercise hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="rvl-label-text mb-3">第 {setNumber} 组</p>
        <h2 className="rvl-headline-text mb-8">{exercise}</h2>

        {/* Weight input */}
        <div className="flex items-center gap-3 mb-8">
          {!isBodyweight && (
            <button
              onClick={() => onWeightChange(String(Math.max(0, (Number(weight) || 0) - 2.5)))}
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'var(--rvl-surface-2)', color: 'var(--rvl-text-med)', border: '1px solid var(--rvl-border-subtle)' }}
            >
              <Minus className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col items-center">
            <span className="rvl-label-text mb-1">{isBodyweight ? '自重' : '重量'}</span>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-36 text-center text-6xl font-black bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--rvl-text-hero)', letterSpacing: '-0.03em' }}
              placeholder="0"
            />
            {!isBodyweight && <span className="rvl-label-text mt-1">kg</span>}
          </div>
          {!isBodyweight && (
            <button
              onClick={() => onWeightChange(String((Number(weight) || 0) + 2.5))}
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'var(--rvl-surface-2)', color: 'var(--rvl-text-med)', border: '1px solid var(--rvl-border-subtle)' }}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onRepsChange(String(Math.max(1, (Number(reps) || 0) - 1)))}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'var(--rvl-surface-2)', color: 'var(--rvl-text-med)', border: '1px solid var(--rvl-border-subtle)' }}
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="rvl-label-text mb-1">次数</span>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => onRepsChange(e.target.value)}
              className="w-36 text-center text-6xl font-black bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--rvl-text-hero)', letterSpacing: '-0.03em' }}
              placeholder="0"
            />
            <span className="rvl-label-text mt-1">次</span>
          </div>
          <button
            onClick={() => onRepsChange(String((Number(reps) || 0) + 1))}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'var(--rvl-surface-2)', color: 'var(--rvl-text-med)', border: '1px solid var(--rvl-border-subtle)' }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* RIR selector */}
        <div className="flex gap-1.5 mb-5">
          {RIR_META.map((m) => (
            <button
              key={m.value}
              onClick={() => onRirChange(m.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: rir === m.value ? 'var(--rvl-active)' : 'var(--rvl-surface-2)',
                color: rir === m.value ? '#000' : 'var(--rvl-text-faint)',
                border: '1px solid ' + (rir === m.value ? 'var(--rvl-active)' : 'var(--rvl-border-subtle)'),
                boxShadow: rir === m.value ? '0 0 16px var(--rvl-active-glow)' : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Decision / recommendation */}
        {decisionMessage && (
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--rvl-active)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--rvl-text-faint)' }}>{decisionMessage}</span>
          </div>
        )}

        {/* Fatigue badge */}
        {fatigueScore != null && fatigueScore > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'var(--rvl-fatigue-dim)', border: '1px solid var(--rvl-border-subtle)' }}>
            <Flame className="w-3 h-3" style={{ color: 'var(--rvl-fatigue)' }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--rvl-fatigue)' }}>疲劳 {fatigueScore.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* Action */}
      <RuntimeActionBar
        primaryLabel={isBodyweight ? '记录自重组' : '完成此组'}
        onPrimary={onLogSet}
        secondaryLabel={isBodyweight ? '切换负重' : '切换自重'}
        onSecondary={onBodyweightToggle}
      />
    </div>
  );
});

export default ActiveSetSurface;
