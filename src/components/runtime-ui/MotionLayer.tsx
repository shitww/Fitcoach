'use client';
import { memo, type ReactNode } from 'react';

interface MotionLayerProps {
  children: ReactNode;
  state?: 'idle' | 'active' | 'rest' | 'fatigue' | 'transition' | 'completion';
  className?: string;
}

const stateStyles: Record<string, React.CSSProperties> = {
  idle: {},
  active: { animation: 'p3-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both' },
  rest: { animation: 'p3-fade-up 0.6s ease-out both' },
  fatigue: {},
  transition: { animation: 'p3-fade-up 0.3s ease-out both' },
  completion: { animation: 'p3-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both' },
};

const MotionLayer = memo(function MotionLayer({ children, state = 'idle', className = '' }: MotionLayerProps) {
  return (
    <div className={className} style={stateStyles[state]}>
      {children}
    </div>
  );
});

export default MotionLayer;
