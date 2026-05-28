'use client';

import { memo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Dumbbell, Clock, RotateCcw, X } from 'lucide-react';

interface SessionRecoveryDialogProps {
  visible: boolean;
  exerciseCount: number;
  setCount: number;
  durationSec: number;
  onResume: () => void;
  onDiscard: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const SessionRecoveryDialog = memo(function SessionRecoveryDialog({
  visible,
  exerciseCount,
  setCount,
  durationSec,
  onResume,
  onDiscard,
}: SessionRecoveryDialogProps) {
  const reduce = useReducedMotion();

  // Prevent background scroll
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
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-dim)' }}
          >
            <RotateCcw className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 className="text-base font-black" style={{ color: 'var(--text-high)' }}>
              恢复训练？
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
              检测到未完成的训练会话
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black" style={{ color: 'var(--text-high)' }}>{exerciseCount}</span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>动作</span>
          </div>
          <div
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span className="text-lg font-black" style={{ color: 'var(--text-high)' }}>{setCount}</span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>组</span>
          </div>
          <div
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
              {formatDuration(durationSec)}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>已训练</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'var(--surface-3)',
              color: 'var(--text-med)',
              border: '1px solid var(--border)',
              touchAction: 'manipulation',
            }}
          >
            <X className="w-4 h-4 inline mr-1 -mt-0.5" />
            丢弃
          </button>
          <button
            onClick={onResume}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              touchAction: 'manipulation',
            }}
          >
            <RotateCcw className="w-4 h-4 inline mr-1 -mt-0.5" />
            恢复训练
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default SessionRecoveryDialog;
