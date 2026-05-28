'use client';

import { memo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Share2, Download, X, Trophy, Dumbbell, Clock, TrendingUp } from 'lucide-react';

interface ShareWorkoutCardProps {
  visible: boolean;
  durationSec: number;
  setCount: number;
  totalVolume: number;
  prCount: number;
  exerciseNames: string[];
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}min`;
}

const ShareWorkoutCard = memo(function ShareWorkoutCard({
  visible,
  durationSec,
  setCount,
  totalVolume,
  prCount,
  exerciseNames,
  onClose,
}: ShareWorkoutCardProps) {
  const reduce = useReducedMotion();

  const handleShare = useCallback(async () => {
    const text = `今天训练完成！\n` +
      `⏱ ${formatDuration(durationSec)}\n` +
      `💪 ${setCount} 组\n` +
      `📊 ${totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`} 总容量\n` +
      `${prCount > 0 ? `🏆 ${prCount} 项 PR\n` : ''}` +
      `\n${exerciseNames.map(n => `· ${n.split(' (')[0]}`).join('\n')}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: '训练完成',
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert('已复制到剪贴板');
      }
    } catch {
      // User cancelled or share failed
    }
  }, [durationSec, setCount, totalVolume, prCount, exerciseNames]);

  if (!visible) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center px-0 sm:px-6 pb-0 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={reduce ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm sm:rounded-3xl rounded-t-3xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black" style={{ color: 'var(--text-high)' }}>分享训练</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          </button>
        </div>

        {/* Preview card */}
        <div
          className="rounded-2xl p-5 mb-5 space-y-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>训练完成</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-low)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-med)' }}>{formatDuration(durationSec)}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--text-low)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-med)' }}>
                {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-3.5 h-3.5" style={{ color: 'var(--text-low)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-med)' }}>{setCount} 组</span>
            </div>
            {prCount > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
                <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>{prCount} PR</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exerciseNames.slice(0, 5).map(name => (
              <span key={name} className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: 'var(--surface-3)', color: 'var(--text-low)' }}>
                {name.split(' (')[0]}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)', touchAction: 'manipulation' }}
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>
      </motion.div>
    </motion.div>
  );
});

export default ShareWorkoutCard;
