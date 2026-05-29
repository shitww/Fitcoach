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
  const readinessColor = overallReadiness > 0.7 ? '#34D399' : overallReadiness > 0.4 ? '#FBBF24' : '#F87171';
  const trendLabel = { rising: '上升中', falling: '下降中', stable: '稳定' }[fatigueTrend];
  const trendColor = fatigueTrend === 'rising' ? '#F87171' : fatigueTrend === 'falling' ? '#34D399' : '#FBBF24';

  return (
    <MotionLayer state="active">
      <div className="px-5 pt-6 pb-4">
        <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: readinessColor, opacity: 0.06, filter: 'blur(40px)' }} />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-high)' }}>身体智能</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>Adaptive Body Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: readinessColor }}>{Math.round(overallReadiness * 100)}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-faint)' }}>就绪度</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: trendColor }}>{trendLabel}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-faint)' }}>疲劳趋势</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{Math.round(consistencyScore * 100)}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-faint)' }}>一致性</p>
            </div>
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <Activity className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--text-high)' }}>{nextRecommendation}</p>
          </div>
        </div>
      </div>
    </MotionLayer>
  );
});

export default BodyIntelligenceSurface;
