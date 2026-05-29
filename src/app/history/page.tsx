'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dumbbell, AlertCircle, Clock } from 'lucide-react'
import { useWorkoutTimer } from '@/stores/workoutTimer'
import { logger } from "@/lib/logger";
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/components/Toast'
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import PullToRefresh from '@/components/PullToRefresh'
import { TimelineSurface, MilestoneStrip, ProgressionArc } from '@/components/training-timeline'

export default function HistoryPage() {
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const userId = sessionData?.user?.id ?? ''
  const { isTrainingActive, isPaused } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused

  const [workouts, setWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/workout?limit=100', { credentials: 'include' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      setWorkouts(json.data ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(() => { void fetchHistory() }, [fetchHistory])

  useEffect(() => {
    if (userId) void fetchHistory()
  }, [userId, fetchHistory])

  // Streaks
  const workoutDates = workouts.map(w => new Date(w.date).toISOString().slice(0, 10));
  const uniqueDates = [...new Set(workoutDates)].sort();
  const today = new Date().toISOString().slice(0, 10);
  const thisMonthPrefix = today.slice(0, 7);
  const thisMonthCount = workoutDates.filter(d => d.startsWith(thisMonthPrefix)).length;

  const computeStreaks = () => {
    if (!uniqueDates.length) return { current: 0, max: 0 };
    let maxS = 1, streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i - 1]).getTime()) / 86400000;
      if (diff === 1) { streak++; maxS = Math.max(maxS, streak); } else streak = 1;
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = uniqueDates[uniqueDates.length - 1];
    let curr = 0;
    if (last === today || last === yesterday) {
      curr = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const diff = (new Date(uniqueDates[i + 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
        if (diff === 1) curr++; else break;
      }
    }
    return { current: curr, max: Math.max(maxS, curr) };
  };
  const { current: currentStreak, max: maxStreak } = computeStreaks();

  // PR / strongest lift
  let strongestLift = { name: '', weight: 0 };
  let prCount = 0;
  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      for (const s of ex.sets || []) {
        if (!s.isWarmup && !s.isCardio && s.weight > strongestLift.weight) {
          strongestLift = { name: ex.name, weight: s.weight };
        }
      }
    }
  }
  prCount = workouts.reduce((sum, w) => sum + (w.prCount || 0), 0);

  // Milestones
  const milestones = [
    currentStreak >= 3 ? { type: 'streak' as const, value: currentStreak + '天', label: '连续训练' } : null,
    workouts.length >= 10 ? { type: 'consistency' as const, value: workouts.length + '次', label: '总训练' } : null,
    strongestLift.weight > 0 ? { type: 'pr' as const, value: strongestLift.weight + 'kg', label: strongestLift.name } : null,
  ].filter(Boolean) as { type: 'streak' | 'volume' | 'consistency' | 'pr'; value: string; label: string }[];

  if (status === 'unauthenticated') {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="mb-4" style={{ color: 'var(--text-low)' }}>请先登录</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-6 py-2.5 rounded-xl font-bold text-accent-foreground"
              style={{ background: 'var(--accent)' }}>
              登录
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="训练时间线"
        subtitle={workouts.length > 0 ? workouts.length + ' 次训练' : undefined}
        onBack={() => router.back()}
      />
      <PullToRefresh onRefresh={refresh}>
        <PageContent>
          {isLoading ? (
            <SkeletonList rows={4} />
          ) : error ? (
            <EmptyState icon={<AlertCircle className="w-8 h-8" />} title="加载失败" description="请检查网络后重试" action={{ label: '重新加载', onClick: refresh }} />
          ) : workouts.length === 0 ? (
            <EmptyState icon={<Dumbbell className="w-8 h-8" />} title="还没有训练记录" description="完成第一次训练后，这里会显示你的时间线" action={{ label: hasActiveSession ? '继续训练' : '开始训练', onClick: () => router.push('/workout') }} />
          ) : (
            <>
              <TimelineSurface
                workouts={workouts}
                currentStreak={currentStreak}
                maxStreak={maxStreak}
                thisMonthCount={thisMonthCount}
              />
              {milestones.length > 0 && (
                <MilestoneStrip milestones={milestones} />
              )}
              {strongestLift.weight > 0 && (
                <ProgressionArc strongestLift={strongestLift} prCount={prCount} />
              )}
            </>
          )}
        </PageContent>
      </PullToRefresh>
    </PageShell>
  )
}
