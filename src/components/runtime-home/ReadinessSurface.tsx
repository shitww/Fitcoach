'use client';
import { memo } from 'react';
import { Zap, Shield, Clock } from 'lucide-react';
import { RuntimeProjection } from '@/components/runtime-ui';

interface ReadinessSurfaceProps {
  readiness: number;
  recovery: number;
  fatigue: number;
  lastWorkoutDays: number;
}

const ReadinessSurface = memo(function ReadinessSurface({
  readiness, recovery, fatigue, lastWorkoutDays
}: ReadinessSurfaceProps) {
  return (
    <div className="px-5 pb-4 space-y-3">
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>身体状态</p>
      <div className="grid grid-cols-2 gap-2">
        <RuntimeProjection
          label="恢复度"
          value={Math.round(recovery * 100)}
          unit="%"
          trend={recovery > 0.7 ? 'up' : recovery > 0.4 ? 'neutral' : 'down'}
          icon={<Shield className="w-4 h-4" />}
          accent="#34D399"
        />
        <RuntimeProjection
          label="疲劳累积"
          value={Math.round(fatigue * 100)}
          unit="%"
          trend={fatigue > 0.6 ? 'down' : 'neutral'}
          icon={<Zap className="w-4 h-4" />}
          accent="#FBBF24"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
        <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>
          {lastWorkoutDays === 0 ? '今天已训练' : lastWorkoutDays === 1 ? '昨天训练过' : '上次训练 ' + lastWorkoutDays + ' 天前'}
        </span>
      </div>
    </div>
  );
});

export default ReadinessSurface;
