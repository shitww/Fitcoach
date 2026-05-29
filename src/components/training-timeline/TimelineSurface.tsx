'use client';
import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Dumbbell, Flame, Zap, Trophy } from 'lucide-react';
import { MotionLayer } from '@/components/runtime-ui';

interface Workout {
  id: string;
  date: string;
  duration: number;
  totalVolume: number;
  exercises: { name: string; muscleGroup: string; sets: any[] }[];
}

interface TimelineSurfaceProps {
  workouts: Workout[];
  currentStreak?: number;
  maxStreak?: number;
  thisMonthCount?: number;
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return '今天';
  return (d.getMonth() + 1) + '/' + d.getDate();
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  return m + '分钟';
}

const TimelineSurface = memo(function TimelineSurface({
  workouts, currentStreak, maxStreak, thisMonthCount
}: TimelineSurfaceProps) {
  const router = useRouter();
  if (workouts.length === 0) return null;

  const hasInsights = currentStreak !== undefined && maxStreak !== undefined && thisMonthCount !== undefined;

  return (
    <div className="px-5 space-y-4">
      {/* Narrative header — only rendered when Growth layer provides insights */}
      {hasInsights && (
        <MotionLayer state="active">
          <div className="rounded-3xl p-5 rvl-surface-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--rvl-active-dim)', color: 'var(--rvl-active)' }}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--rvl-text-high)' }}>
                  {currentStreak! > 0 ? '连续 ' + currentStreak + ' 天训练' : '准备好开始'}
                </p>
                <p className="text-xs" style={{ color: 'var(--rvl-text-faint)' }}>
                  {thisMonthCount} 次训练 · 最长连续 {maxStreak} 天
                </p>
              </div>
            </div>
            {/* Activity strip — last 14 days */}
            <div className="flex gap-1">
              {Array.from({ length: 14 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (13 - i));
                const ds = d.toISOString().slice(0, 10);
                const has = workouts.some(w => new Date(w.date).toISOString().slice(0, 10) === ds);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full aspect-square rounded-md"
                      style={{ background: has ? 'var(--rvl-active)' : 'var(--rvl-surface-3)', opacity: has ? 1 : 0.4, boxShadow: has ? '0 0 8px var(--rvl-active-glow)' : 'none' }} />
                    <span className="text-[9px] font-bold" style={{ color: 'var(--rvl-text-faint)' }}>{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </MotionLayer>
      )}

      {/* Sessions as narrative nodes */}
      {workouts.slice(0, 20).map((w, i) => {
        const vol = w.totalVolume || 0;
        const sets = w.exercises.reduce((s, e) => s + (e.sets?.length || 0), 0);
        const muscleGroups = Array.from(new Set(w.exercises.map(e => e.muscleGroup).filter(Boolean))).slice(0, 3);
        const isLatest = i === 0;

        return (
          <MotionLayer key={w.id} state="active">
            <button
              onClick={() => router.push('/workout/history/' + w.id)}
              className="w-full text-left rounded-3xl p-5 transition-all active:scale-[0.98]"
              style={{
                background: isLatest ? 'var(--rvl-surface-1)' : 'var(--rvl-surface-2)',
                border: '1px solid var(--rvl-border-subtle)',
                boxShadow: isLatest ? '0 0 20px var(--rvl-active-glow)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: 'var(--rvl-active-dim)', color: 'var(--rvl-active)' }}>
                    {fmtDate(w.date)}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--rvl-active-dim)', color: 'var(--rvl-active)' }}>
                      最新
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--rvl-text-faint)' }}>
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{fmtDuration(w.duration)}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--rvl-text-hero)' }}>
                  {vol >= 1000 ? (vol / 1000).toFixed(1) + 't' : vol}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--rvl-text-faint)' }}>容量</span>
                <span className="text-sm font-black tabular-nums ml-3" style={{ color: 'var(--rvl-text-high)' }}>{sets}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--rvl-text-faint)' }}>组</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map(mg => (
                  <span key={mg} className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'var(--rvl-surface-3)', color: 'var(--rvl-text-faint)' }}>
                    {mg}
                  </span>
                ))}
                {w.exercises.length > muscleGroups.length && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: 'var(--rvl-text-faint)' }}>
                    +{w.exercises.length - muscleGroups.length}
                  </span>
                )}
              </div>
            </button>
          </MotionLayer>
        );
      })}
    </div>
  );
});

export default TimelineSurface;
