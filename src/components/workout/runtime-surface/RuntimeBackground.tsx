'use client';
import { memo } from 'react';

interface RuntimeBackgroundProps {
  variant?: 'active' | 'rest' | 'transition' | 'completion';
}

const RuntimeBackground = memo(function RuntimeBackground({ variant = 'active' }: RuntimeBackgroundProps) {
  const bg = variant === 'rest'
    ? 'var(--surface-2)'
    : variant === 'completion'
    ? 'var(--surface)'
    : 'var(--background)';
  return (
    <div
      className="fixed inset-0 -z-10 transition-colors duration-700"
      style={{ background: bg }}
    />
  );
});

export default RuntimeBackground;
