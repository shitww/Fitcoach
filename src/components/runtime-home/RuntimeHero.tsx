'use client';
import { memo } from 'react';
import { Activity, ArrowRight } from 'lucide-react';

interface RuntimeHeroProps {
  headline: string;
  subheadline: string;
  readinessPct?: number;
  onStart: () => void;
  isTrainingActive?: boolean;
  onResume?: () => void;
}

const RuntimeHero = memo(function RuntimeHero({
  headline, subheadline, readinessPct, onStart, isTrainingActive, onResume
}: RuntimeHeroProps) {
  const hasReadiness = readinessPct !== undefined;
  const R = 56;
  const circ = 2 * Math.PI * R;
  const dash = hasReadiness ? circ * Math.min(1, Math.max(0, readinessPct)) : 0;
  const color = hasReadiness
    ? (readinessPct > 0.7 ? 'var(--rvl-active)' : readinessPct > 0.4 ? 'var(--rvl-complete)' : 'var(--rvl-fatigue)')
    : 'var(--rvl-active)';

  return (
    <div className="relative px-5 pt-6 pb-8">
      <div className="relative rounded-3xl p-6 overflow-hidden rvl-surface-elevated">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: color, opacity: 0.12, filter: 'blur(48px)' }} />

        <div className="flex items-center gap-4">
          {/* Readiness ring — only when analytics layer provides it */}
          {hasReadiness && (
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <svg width={120} height={120} className="absolute rvl-glow-ring-active" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={60} cy={60} r={R} fill="none" stroke="var(--rvl-surface-3)" strokeWidth={8} />
                <circle cx={60} cy={60} r={R} fill="none" stroke={color} strokeWidth={8}
                  strokeDasharray={dash + ' ' + (circ - dash)} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease-out', filter: 'drop-shadow(0 0 4px ' + color + ')' }} />
              </svg>
              <div className="text-center z-10">
                <p className="text-3xl font-black tabular-nums" style={{ color, letterSpacing: '-0.03em' }}>{Math.round(readinessPct * 100)}</p>
                <p className="rvl-label-text">就绪度</p>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="rvl-title-text mb-1">{headline}</h1>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--rvl-text-faint)' }}>{subheadline}</p>
          </div>
        </div>

        <button
          onClick={isTrainingActive ? onResume : onStart}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-base transition-all active:scale-[0.97] rvl-btn-primary"
        >
          <Activity className="w-5 h-5" />
          {isTrainingActive ? '继续训练' : '开始训练'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default RuntimeHero;
