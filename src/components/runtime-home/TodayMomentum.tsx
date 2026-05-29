'use client';
import { memo } from 'react';
import { Flame, Dumbbell, Trophy } from 'lucide-react';

interface TodayMomentumProps {
  streak: number;
  totalSetsThisWeek: number;
  weeklyGoal: number;
  lastPr?: string;
}

const TodayMomentum = memo(function TodayMomentum({ streak, totalSetsThisWeek, weeklyGoal, lastPr }: TodayMomentumProps) {
  const pct = Math.min(1, totalSetsThisWeek / weeklyGoal);
  return (
    <div className="px-5 pb-4">
      <p className="rvl-label-text mb-3">本周势头</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-2xl p-4 rvl-surface">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" style={{ color: 'var(--rvl-fatigue)' }} />
            <span className="rvl-label-text">连续 {streak} 天</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-black" style={{ color: 'var(--rvl-text-hero)' }}>{totalSetsThisWeek}</span>
            <span className="text-xs font-bold mb-1" style={{ color: 'var(--rvl-text-faint)' }}>/ {weeklyGoal} 组</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--rvl-surface-3)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: pct * 100 + '%', background: 'var(--rvl-active)', boxShadow: '0 0 8px var(--rvl-active-glow)' }} />
          </div>
        </div>
        {lastPr && (
          <div className="w-24 rounded-2xl p-4 flex flex-col items-center justify-center text-center rvl-surface">
            <Trophy className="w-5 h-5 mb-1.5" style={{ color: 'var(--rvl-complete)' }} />
            <span className="rvl-label-text">最近 PR</span>
            <span className="text-xs font-black mt-1" style={{ color: 'var(--rvl-text-high)' }}>{lastPr}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default TodayMomentum;
