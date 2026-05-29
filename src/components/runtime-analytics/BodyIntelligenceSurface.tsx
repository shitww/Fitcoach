'use client';
import { memo } from 'react';
import { Brain, Activity } from 'lucide-react';
import { MotionLayer } from '@/components/runtime-ui';

interface BodyIntelligenceSurfaceProps {
  overallReadiness: number;
  fatigueTrend: 'rising' | 'falling' | 'stable';
  consistencyScore: number;
  nextRecommendation: string;
}

const BodyIntelligenceSurface = memo(function BodyIntelligenceSurface({
  overallReadiness, fatigueTrend, consistencyScore, nextRecommendation
}: BodyIntelligenceSurfaceProps) {
  const readinessColor = overallReadiness > 0.7 ? 'var(--rvl-active)' : overallReadiness > 0.4 ? 'var(--rvl-complete)' : 'var(--rvl-fatigue)';
  const trendLabel = { rising: '上升中', falling: '下降中', stable: '稳定' }[fatigueTrend];
  const trendColor = fatigueTrend === 'rising' ? 'var(--rvl-fatigue)' : fatigueTrend === 'falling' ? 'var(--rvl-active)' : 'var(--rvl-complete)';

  return (
    <MotionLayer state="active">
      <div className="px-5 pt-6 pb-4">
        <div className="rounded-3xl p-6 relative overflow-hidden rvl-surface-elevated">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: readinessColor, opacity: 0.14, filter: 'blur(48px)' }} />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--rvl-active-dim)', color: 'var(--rvl-active)' }}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--rvl-text-high)' }}>身体智能</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--rvl-text-faint)' }}>Adaptive Body Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: readinessColor, letterSpacing: '-0.02em' }}>{Math.round(overallReadiness * 100)}</p>
              <p className="rvl-label-text mt-1">就绪度</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: trendColor, letterSpacing: '-0.02em' }}>{trendLabel}</p>
              <p className="rvl-label-text mt-1">疲劳趋势</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: 'var(--rvl-active)', letterSpacing: '-0.02em' }}>{Math.round(consistencyScore * 100)}</p>
              <p className="rvl-label-text mt-1">一致性</p>
            </div>
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--rvl-surface-2)', border: '1px solid var(--rvl-border-subtle)' }}>
            <Activity className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--rvl-active)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--rvl-text-high)' }}>{nextRecommendation}</p>
          </div>
        </div>
      </div>
    </MotionLayer>
  );
});

export default BodyIntelligenceSurface;
