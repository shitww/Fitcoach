'use client';

import { memo } from 'react';
import { useReducedMotion, motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

interface ExerciseItem {
  name: string;
  lastWeight?: number | null;
  lastReps?: number | null;
  setsCount?: number;
}

interface ExerciseHistoryStripProps {
  items: ExerciseItem[];
  currentExercise: string;
  onSelect: (name: string) => void;
}

const ExerciseHistoryStrip = memo(function ExerciseHistoryStrip({
  items,
  currentExercise,
  onSelect,
}: ExerciseHistoryStripProps) {
  const reduce = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <div className="mb-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-1">
        {items.map((item, i) => {
          const isActive = item.name === currentExercise;
          const baseName = item.name.split(' (')[0];
          const hasRecord = item.lastWeight != null && item.lastReps != null;

          return (
            <motion.button
              key={item.name + i}
              onClick={() => onSelect(item.name)}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.03 }}
              className="shrink-0 flex flex-col items-start gap-0.5 px-3.5 py-2.5 rounded-2xl text-left transition-all active:scale-95"
              style={{
                background: isActive ? 'rgba(var(--accent-rgb), 0.12)' : 'var(--surface-2)',
                border: isActive ? '1px solid rgba(var(--accent-rgb), 0.35)' : '1px solid var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--text-med)',
                touchAction: 'manipulation',
                minWidth: 88,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-3 h-3 shrink-0 opacity-60" />
                <span className="text-xs font-bold truncate max-w-[90px]">{baseName}</span>
              </div>
              {hasRecord ? (
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--text-low)' }}>
                  {item.lastWeight}×{item.lastReps}
                </span>
              ) : item.setsCount && item.setsCount > 0 ? (
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>
                  {item.setsCount}组
                </span>
              ) : (
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
                  未记录
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

export default ExerciseHistoryStrip;
