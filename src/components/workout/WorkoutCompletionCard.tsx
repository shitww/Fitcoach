'use client';

import { memo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Trophy, Clock, Dumbbell, TrendingUp, Zap, ArrowRight, Share2 } from 'lucide-react';
import { InsightRow } from './intelligence';
import type { TrainingInsight } from '@/lib/training/trainingTypes';

interface WorkoutCompletionCardProps {
  visible: boolean;
  durationSec: number;
  setCount: number;
  totalVolume: number;
  prCount: number;
  exerciseNames: string[];
  onDismiss: () => void;
  onShare?: () => void;
  // V2 Intelligence (optional)
  insights?: TrainingInsight[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const WorkoutCompletionCard = memo(function WorkoutCompletionCard({
  visible,
  durationSec,
  setCount,
  totalVolume,
  prCount,
  exerciseNames,
  onDismiss,
  onShare,
  insights,
}: WorkoutCompletionCardProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center px-0 sm:px-6 pb-0 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 flex flex-col gap-6 sm:gap-7"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <motion.div
            initial={reduce ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3"
            style={{ background: 'var(--accent-dim)' }}
          >
            <Zap className="w-7 h-7" style={{ color: 'var(--accent)' }} />
          </motion.div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-high)' }}>
            训练完成
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-low)' }}>
            又向前迈了一步
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
              {formatDuration(durationSec)}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>时长</span>
          </div>
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
              {setCount}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>组</span>
          </div>
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
              {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>总容量</span>
          </div>
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
            <span className="text-lg font-black tabular-nums" style={{ color: '#fbbf24' }}>
              {prCount}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>PR</span>
          </div>
        </div>

        {/* Exercises */}
        {exerciseNames.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              今日动作
            </span>
            <div className="flex flex-wrap gap-2">
              {exerciseNames.map((name) => (
                <span
                  key={name}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
                >
                  {name.split(' (')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Training insights (V2 Intelligence) */}
        {insights && insights.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              训练洞察
            </span>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <InsightRow key={`${insight.type}-${i}`} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)', touchAction: 'manipulation' }}
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
          )}
          <button
            onClick={onDismiss}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)', touchAction: 'manipulation' }}
          >
            查看详情
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default WorkoutCompletionCard;
