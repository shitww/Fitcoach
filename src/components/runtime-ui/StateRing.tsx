'use client';
import { memo } from 'react';

interface StateRingProps {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

const StateRing = memo(function StateRing({
  progress, size = 120, stroke = 8, color = 'var(--accent)', bgColor = 'var(--surface-3)', children
}: StateRingProps) {
  const R = size / 2;
  const r = R - stroke / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, Math.max(0, progress));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={R} cy={R} r={r} fill="none" stroke={bgColor} strokeWidth={stroke} />
        <circle cx={R} cy={R} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={dash + ' ' + (circ - dash)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
});

export default StateRing;
