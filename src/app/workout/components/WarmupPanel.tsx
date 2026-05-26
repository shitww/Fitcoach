"use client";

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Flame } from 'lucide-react';
import { WARMUP_PRESETS } from '@/lib/warmup-presets';
import type { WarmupItem } from '@/lib/warmup-presets';

type WarmupPhase = 'idle' | 'active' | 'done';

interface WarmupPanelProps {
  muscleGroup?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function WarmupPanel({ muscleGroup, onComplete, onSkip }: WarmupPanelProps) {
  const [phase, setPhase] = useState<WarmupPhase>('idle');
  const [items, setItems] = useState<WarmupItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const presets = useMemo(() => {
    const key = muscleGroup ?? 'default';
    return (WARMUP_PRESETS[key] ?? WARMUP_PRESETS.default).map(i => ({ ...i, done: false }));
  }, [muscleGroup]);

  const handleStart = () => {
    setItems(presets.map(i => ({ ...i, done: false })));
    setPhase('active');
  };

  const toggleItem = (index: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], done: !next[index].done };
      return next;
    });
  };

  const allDone = items.length > 0 && items.every(i => i.done);

  const handleComplete = () => {
    setPhase('done');
    setCollapsed(true);
    onComplete();
  };

  if (collapsed && phase === 'done') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4"
        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <Check className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
        <span className="text-xs font-bold" style={{ color: '#34D399' }}>热身已完成</span>
        <button onClick={() => setCollapsed(false)} className="ml-auto"
          style={{ color: 'var(--text-low)', background: 'none', border: 'none' }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const displayItems = phase === 'idle' ? presets : items;

  return (
    <div className="rounded-2xl mb-4 overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-black">训练准备</span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
            建议 3 分钟
          </span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        {displayItems.map((item, i) => (
          <div
            key={i}
            onClick={phase === 'active' ? () => toggleItem(i) : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all${phase === 'active' ? ' cursor-pointer active:scale-[0.98]' : ''}`}
            style={{ background: item.done ? 'rgba(52,211,153,0.08)' : 'var(--surface-2)' }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: item.done ? '#34D399' : 'var(--surface-3)',
                border: item.done ? 'none' : '1px solid var(--border)',
              }}>
              {item.done
                ? <Check className="w-3 h-3" style={{ color: '#000' }} />
                : <span className="text-xs font-black" style={{ color: 'var(--text-low)' }}>{i + 1}</span>
              }
            </div>
            <span className="flex-1 text-sm font-semibold"
              style={{ color: item.done ? '#34D399' : 'var(--text-med)' }}>
              {item.name}
            </span>
            <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-low)' }}>
              × {item.reps}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 flex gap-3">
        {phase === 'idle' && (
          <>
            <button onClick={onSkip}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'var(--surface-2)', color: 'var(--text-low)' }}>
              直接训练
            </button>
            <button onClick={handleStart}
              className="flex-1 py-3 rounded-xl text-sm font-black"
              style={{ background: 'rgb(var(--accent))', color: 'var(--accent-text)' }}>
              开始热身
            </button>
          </>
        )}
        {phase === 'active' && (
          <button
            onClick={allDone ? handleComplete : undefined}
            className="w-full py-3 rounded-xl text-sm font-black transition-all"
            style={{
              background: allDone ? 'rgb(var(--accent))' : 'var(--surface-2)',
              color: allDone ? 'var(--accent-text)' : 'var(--text-low)',
              cursor: allDone ? 'pointer' : 'default',
            }}>
            {allDone
              ? '✓ 热身完成，开始训练'
              : `完成热身（${items.filter(i => i.done).length}/${items.length}）`}
          </button>
        )}
      </div>
    </div>
  );
}
