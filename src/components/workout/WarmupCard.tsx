'use client';

import { memo, useState, useCallback } from 'react';
import { Check, Flame, ChevronDown } from 'lucide-react';
import type { SessionSet } from '@/stores/workoutSession';

interface WarmupSuggestion {
  weight: number;
  reps: number;
}

interface WarmupCardProps {
  exerciseName: string;
  suggestions?: WarmupSuggestion[];
  onCompleteWarmup: (set: { weight: number; reps: number }) => void;
}

const DEFAULT_SUGGESTIONS: WarmupSuggestion[] = [
  { weight: 20, reps: 15 },
  { weight: 40, reps: 8 },
  { weight: 60, reps: 5 },
];

function generateWarmup(weight: number): WarmupSuggestion[] {
  if (weight <= 0) return DEFAULT_SUGGESTIONS;
  const w1 = Math.max(0, Math.round(weight * 0.4));
  const w2 = Math.max(0, Math.round(weight * 0.6));
  const w3 = Math.max(0, Math.round(weight * 0.8));
  return [
    { weight: w1, reps: 15 },
    { weight: w2, reps: 8 },
    { weight: w3, reps: 5 },
  ];
}

const WarmupCard = memo(function WarmupCard({ exerciseName, suggestions, onCompleteWarmup }: WarmupCardProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const items = suggestions && suggestions.length > 0 ? suggestions : generateWarmup(0);

  const handleComplete = useCallback((i: number, item: WarmupSuggestion) => {
    setDone((prev) => ({ ...prev, [i]: true }));
    onCompleteWarmup(item);
  }, [onCompleteWarmup]);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.12)' }}
    >
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
          <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>热身建议</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>
            不计入正式组
          </span>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ color: '#60A5FA', transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
        />
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-1.5">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => handleComplete(i, item)}
              disabled={done[i]}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all active:scale-[0.98]"
              style={{
                background: done[i] ? 'rgba(52,211,153,0.08)' : 'var(--surface-2)',
                border: `1px solid ${done[i] ? 'rgba(52,211,153,0.15)' : 'var(--border)'}`,
                opacity: done[i] ? 0.6 : 1,
                touchAction: 'manipulation',
              }}
            >
              <span className="text-xs font-bold" style={{ color: done[i] ? '#34D399' : 'var(--text-med)' }}>
                {item.weight}kg × {item.reps}次
              </span>
              {done[i] ? (
                <Check className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>
                  完成
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default WarmupCard;
