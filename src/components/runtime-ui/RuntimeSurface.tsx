'use client';
import { memo, type ReactNode } from 'react';

interface RuntimeSurfaceProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'muted';
  className?: string;
  style?: React.CSSProperties;
}

const RuntimeSurface = memo(function RuntimeSurface({ children, variant = 'default', className = '', style }: RuntimeSurfaceProps) {
  const base = 'rounded-3xl overflow-hidden';
  const variants = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface shadow-lg border border-border',
    muted: 'bg-surface-2',
  };
  return (
    <div className={base + ' ' + variants[variant] + ' ' + className} style={style}>
      {children}
    </div>
  );
});

export default RuntimeSurface;
