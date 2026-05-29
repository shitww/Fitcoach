'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dumbbell, AlertCircle } from 'lucide-react'
import { useWorkoutTimer } from '@/stores/workoutTimer'
import { logger } from "@/lib/logger";
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import PullToRefresh from '@/components/PullToRefresh'
import { TimelineSurface } from '@/components/training-timeline'

export default function HistoryPage() {
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const userId = sessionData?.user?.id ?? ''
  const { isTrainingActive, isPaused } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused

  const [workouts, setWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
            <TimelineSurface workouts={workouts} />
          )}
        </PageContent>
      </PullToRefresh>
    </PageShell>
  )
}
