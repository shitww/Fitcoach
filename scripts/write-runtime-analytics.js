const fs = require('fs');
const path = require('path');

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(dir, file, content) {
  fs.writeFileSync(path.join(dir, file), content, 'utf8');
}

// ── runtime-analytics surfaces ──────────────────────────
const aDir = path.join(process.cwd(), 'src/components/runtime-analytics');
mkdir(aDir);

write(aDir, 'index.ts', `export { default as BodyIntelligenceSurface } from './BodyIntelligenceSurface';
export { default as ReadinessBalance } from './ReadinessBalance';
export { default as FatigueTrend } from './FatigueTrend';
export { default as ProgressionVelocity } from './ProgressionVelocity';
export { default as ConsistencySignal } from './ConsistencySignal';
`);

write(aDir, 'BodyIntelligenceSurface.tsx', `\'use client\';
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
`);

write(aDir, 'ReadinessBalance.tsx', `\'use client\';
import { memo } from 'react';
import { Shield } from 'lucide-react';

interface MuscleReadiness {
  name: string;
  readiness: number;
  lastTrained: string;
}

interface ReadinessBalanceProps {
  muscles: MuscleReadiness[];
}

const ReadinessBalance = memo(function ReadinessBalance({ muscles }: ReadinessBalanceProps) {
  if (muscles.length === 0) return null;
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>肌群平衡</p>
      </div>
      <div className="space-y-2">
        {muscles.map((m) => {
          const color = m.readiness > 0.7 ? '#34D399' : m.readiness > 0.4 ? '#FBBF24' : '#F87171';
          return (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-xs font-semibold w-10 shrink-0" style={{ color: 'var(--text-med)' }}>{m.name}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: m.readiness * 100 + '%', background: color }} />
              </div>
              <span className="text-[10px] font-bold tabular-nums shrink-0 w-6 text-right" style={{ color }}>{Math.round(m.readiness * 100)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ReadinessBalance;
`);

write(aDir, 'FatigueTrend.tsx', `\'use client\';
import { memo } from 'react';
import { Zap } from 'lucide-react';

interface FatiguePoint {
  date: string;
  fatigue: number;
  recovery: number;
}

interface FatigueTrendProps {
  data: FatiguePoint[];
}

const FatigueTrend = memo(function FatigueTrend({ data }: FatigueTrendProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => Math.max(d.fatigue, d.recovery)), 1);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>疲劳与恢复</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-end gap-[3px] h-28">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-[3px] relative group">
              <div className="w-full rounded-t-sm transition-all" style={{ height: (d.recovery / max * 100) + '%', background: '#34D399', opacity: 0.5 }} />
              <div className="w-full rounded-t-sm transition-all" style={{ height: (d.fatigue / max * 100) + '%', background: '#F87171', opacity: 0.5 }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#34D399', opacity: 0.5 }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>恢复</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#F87171', opacity: 0.5 }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-faint)' }}>疲劳</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FatigueTrend;
`);

write(aDir, 'ProgressionVelocity.tsx', `\'use client\';
import { memo } from 'react';
import { TrendingUp } from 'lucide-react';

interface ProgressionPoint {
  date: string;
  estimated1RM: number;
}

interface ProgressionVelocityProps {
  exercise: string;
  data: ProgressionPoint[];
  velocity: number;
}

const ProgressionVelocity = memo(function ProgressionVelocity({ exercise, data, velocity }: ProgressionVelocityProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.estimated1RM), 1);
  const min = Math.min(...data.map(d => d.estimated1RM));
  const range = max - min || 1;
  const velocityColor = velocity > 0.05 ? '#34D399' : velocity > 0 ? '#FBBF24' : '#F87171';

  return (
    <div className="px-5 pb-4">
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>{exercise}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: velocityColor + '18', color: velocityColor }}>
            {velocity > 0 ? '+' : ''}{(velocity * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-end gap-[2px] h-20">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex justify-center items-end">
              <div className="w-full rounded-t-sm transition-all" style={{
                height: ((d.estimated1RM - min) / range * 60 + 20) + '%',
                background: 'var(--accent)',
                opacity: 0.5 + (i / data.length) * 0.5,
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProgressionVelocity;
`);

write(aDir, 'ConsistencySignal.tsx', `\'use client\';
import { memo } from 'react';
import { Flame } from 'lucide-react';

interface ConsistencySignalProps {
  score: number;
  weeklySets: number[];
  targetSets: number;
}

const ConsistencySignal = memo(function ConsistencySignal({ score, weeklySets, targetSets }: ConsistencySignalProps) {
  const max = Math.max(...weeklySets, targetSets, 1);
  const color = score > 0.8 ? '#34D399' : score > 0.5 ? '#FBBF24' : '#F87171';
  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>训练一致性</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black" style={{ color }}>{Math.round(score * 100)}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>一致性指数</span>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {weeklySets.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1">
              <div className="w-full rounded-t-md transition-all"
                style={{ height: (s / max * 100) + '%', background: s >= targetSets ? '#34D399' : 'var(--accent)', opacity: s >= targetSets ? 0.8 : 0.4 }} />
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-faint)' }}>{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ConsistencySignal;
`);

console.log('runtime-analytics surfaces written');
