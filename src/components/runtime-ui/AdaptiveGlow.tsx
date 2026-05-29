'use client';
import { memo } from 'react';

interface AdaptiveGlowProps {
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  className?: string;
}

const intensityMap = {
  low: { opacity: 0.04, blur: 40 },
  medium: { opacity: 0.08, blur: 60 },
  high: { opacity: 0.14, blur: 80 },
};

const AdaptiveGlow = memo(function AdaptiveGlow({ intensity = 'medium', color = 'var(--accent)', className = '' }: AdaptiveGlowProps) {
  const { opacity, blur } = intensityMap[intensity];
  return (
    <div
      className={'absolute pointer-events-none -z-10 ' + className}
      style={{
        background: color,
        opacity,
        filter: 'blur(' + blur + 'px)',
        borderRadius: '50%',
        width: '120%',
        height: '120%',
        left: '-10%',
        top: '-10%',
      }}
    />
  );
});

export default AdaptiveGlow;
