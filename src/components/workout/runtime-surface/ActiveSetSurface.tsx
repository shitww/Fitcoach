'use client';
import { memo } from 'react';
import { Flame, Zap } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      {/* Exercise hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-faint)' }}>
          第 {setNumber} 组
        </p>
        <h2 className="text-2xl font-black leading-tight mb-6" style={{ color: 'var(--text-high)' }}>
          {exercise}
        </h2>

        {/* Weight input */}
        <div className="flex items-center gap-3 mb-6">
          {!isBodyweight && (
            <button
              onClick={() => onWeightChange(String(Math.max(0, (Number(weight) || 0) - 2.5)))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90"
              style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
            >
              −
            </button>
          )}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold mb-1" style={{ color: 'var(--text-faint)' }}>
              {isBodyweight ? '自重' : '重量'}
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-32 text-center text-5xl font-black bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--text-high)' }}
              placeholder="0"
            />
            {!isBodyweight && <span className="text-xs font-bold mt-1" style={{ color: 'var(--text-low)' }}>kg</span>}
          </div>
          {!isBodyweight && (
            <button
              onClick={() => onWeightChange(String((Number(weight) || 0) + 2.5))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90"
              style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
            >
              +
            </button>
          )}
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onRepsChange(String(Math.max(1, (Number(reps) || 0) - 1)))}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90"
            style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
          >
            −
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold mb-1" style={{ color: 'var(--text-faint)' }}>次数</span>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => onRepsChange(e.target.value)}
              className="w-32 text-center text-5xl font-black bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--text-high)' }}
              placeholder="0"
            />
            <span className="text-xs font-bold mt-1" style={{ color: 'var(--text-low)' }}>次</span>
          </div>
          <button
            onClick={() => onRepsChange(String((Number(reps) || 0) + 1))}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90"
            style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
          >
            +
          </button>
        </div>

        {/* RIR selector */}
        <div className="flex gap-1.5 mb-5">
          {RIR_META.map((m) => (
            <button
              key={m.value}
              onClick={() => onRirChange(m.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: rir === m.value ? 'var(--accent)' : 'var(--surface-2)',
                color: rir === m.value ? '#000' : 'var(--text-low)',
                border: '1px solid ' + (rir === m.value ? 'var(--accent)' : 'var(--border)'),
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Decision / recommendation */}
        {decisionMessage && (
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{decisionMessage}</span>
          </div>
        )}

        {/* Fatigue badge */}
        {fatigueScore != null && fatigueScore > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.08)' }}>
            <Flame className="w-3 h-3" style={{ color: '#FBBF24' }} />
            <span className="text-[10px] font-bold" style={{ color: '#FBBF24' }}>疲劳 {fatigueScore.toFixed(0)}</span>
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
