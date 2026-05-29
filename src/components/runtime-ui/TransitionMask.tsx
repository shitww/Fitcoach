'use client';
import { memo, type ReactNode } from 'react';

interface TransitionMaskProps {
  visible: boolean;
  children: ReactNode;
  duration?: number;
}

const TransitionMask = memo(function TransitionMask({ visible, children, duration = 350 }: TransitionMaskProps) {
  return (
    <div
      className="transition-all"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transitionDuration: duration + 'ms',
        transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {children}
    </div>
  );
});

export default TransitionMask;
