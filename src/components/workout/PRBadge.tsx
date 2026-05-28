'use client';

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export type PRType = 'weight' | 'reps' | 'volume';

interface PRBadgeProps {
  type: PRType;
  display: string;
  visible: boolean;
}

const LABELS: Record<PRType, string> = {
  weight: '重量新纪录',
  reps: '次数新纪录',
  volume: '容量新纪录',
};

const PRBadge = memo(function PRBadge({ type, display, visible }: PRBadgeProps) {
  const reduce = useReducedMotion();

  if (!visible) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-center justify-center gap-2 py-2.5 rounded-2xl mb-3"
      style={{
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.2)',
      }}
    >
      <Trophy className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />
      <span className="text-xs font-black" style={{ color: '#fbbf24' }}>
        {LABELS[type]} · {display}
      </span>
    </motion.div>
  );
});

export default PRBadge;
