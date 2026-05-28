'use client';

import { memo, useEffect } from 'react';
import { SkipForward, Pause, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  useWorkoutTimer,
  selectRestSecondsRemaining,
  selectWorkoutPhase,
} from '@/stores/workoutTimer';
import { ContextualTipPill } from './intelligence';
import type { ContextualTip } from '@/lib/training/trainingTypes';

interface RestTimerPillProps {
  onSkip: () => void;
  exerciseName?: string;
  contextualTip?: ContextualTip | null;
}

function suggestRestText(exerciseName?: string): string | null {
  if (!exerciseName) return null;
  const name = exerciseName.toLowerCase();
  // Compound movements → longer rest
  if (/深蹲|硬拉|卧推|推举|划船|引体/.test(name)) return '大重量复合动作，建议充分休息';
  // Isolation → shorter rest
  if (/弯举|飞鸟|侧平举|后束|卷腹|腿屈伸/.test(name)) return '孤立动作，可缩短休息时间';
  // High rep / endurance
  if (/有氧|跑步|划船机|单车/.test(name)) return '有氧恢复，注意呼吸';
  return null;
}

const RestTimerPill = memo(function RestTimerPill({ onSkip, exerciseName, contextualTip }: RestTimerPillProps) {
  const phase = useWorkoutTimer(selectWorkoutPhase);
  const restTimer = useWorkoutTimer((s) => s.restTimer);
  const completeRest = useWorkoutTimer((s) => s.completeRest);
  const restSecs = useWorkoutTimer(selectRestSecondsRemaining);
  const reduce = useReducedMotion();

  // Auto-complete when timer reaches 0
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restSecs > 0) return;
    completeRest();
  }, [restSecs, phase, completeRest]);

  if (phase !== 'rest' || restSecs <= 0) return null;

  const isUrgent = restSecs <= 10;
  const total = restTimer.duration || 90;
  const pct = total > 0 ? restSecs / total : 0;
  const barColor = isUrgent ? '#ef4444' : '#f59e0b';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mb-3 rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
        boxShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.12)' : '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
              initial={reduce ? false : { width: `${pct * 100}%` }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
          </div>
          {/* Labels */}
          <div className="flex items-center justify-between mt-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: isUrgent ? '#ef4444' : 'var(--text-low)' }}
            >
              {isUrgent ? '准备开始' : '休息中'}
            </span>
            <span
              className="text-lg font-black tabular-nums leading-none"
              style={{ color: barColor, letterSpacing: '-0.02em' }}
            >
              {restSecs >= 60
                ? `${Math.floor(restSecs / 60)}:${String(restSecs % 60).padStart(2, '0')}`
                : `${restSecs}s`}
            </span>
          </div>
          {/* Smart suggestion */}
          {(() => {
            const suggestion = suggestRestText(exerciseName);
            if (!suggestion) return null;
            return (
              <p className="text-[10px] font-semibold mt-1 truncate" style={{ color: 'var(--text-faint)' }}>
                {suggestion}
              </p>
            );
          })()}
          {/* Contextual tip (V2 Intelligence) */}
          {contextualTip && (
            <div className="mt-2">
              <ContextualTipPill tip={contextualTip} />
            </div>
          )}
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-90"
          style={{
            background: 'var(--surface-3)',
            color: 'var(--text-med)',
            border: '1px solid var(--border)',
            touchAction: 'manipulation',
          }}
        >
          <SkipForward className="w-3.5 h-3.5" />
          跳过
        </button>
      </div>
    </motion.div>
  );
});

export default RestTimerPill;
