"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Calendar, Clock, TrendingUp, Trash2, Flame, AlertCircle, Check, Zap, Trophy, Activity } from 'lucide-react'
import { logger } from "@/lib/logger";
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/components/Toast'
import { PageShell, PageHeader, PageContent, Section } from "@/components/layout"
import { WorkoutMonthCalendar } from '@/components/WorkoutMonthCalendar'
import PullToRefresh from '@/components/PullToRefresh'

export default function HistoryPage() {
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const userId = sessionData?.user?.id ?? ''
  const { isTrainingActive, isPaused } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused

  const [workouts, setWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/workout?limit=100', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
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

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setConfirmDeleteId(null);
    setDeleting(id)
    // Optimistic local removal
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    try {
      const res = await fetch(`/api/workout?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        toast({ message: '删除失败', type: 'error' })
        // Revert optimistic removal by refreshing cache
        void refresh()
      }
    } catch (err) {
      logger.error('Delete error:', err)
      toast({ message: '删除失败', type: 'error' })
      void refresh()
    } finally {
      setDeleting(null)
    }
  }


  // 统计数据
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

  /** 列表接口返回 `WorkoutSummaryDto.exercises` */
  const exercisesToGroupedRows = (exercises: any[]) =>
    (exercises || []).map((ex: any) => ({
      exercise: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets || [],
      isCardio: ex.sets?.length > 0 && ex.sets.every((s: any) => s.isCardio),
      isWarmup: ex.sets?.length > 0 && ex.sets.every((s: any) => s.isWarmup),
    }))

  // Build dayMap for WorkoutMonthCalendar
  const workoutDayMap = useMemo(() => {
    const map = new Map<string, { workoutId: string; duration: number; totalVolume: number; muscleGroups: string[]; isCardio: boolean; exercises: string[] }>()
    for (const w of workouts) {
      const date = new Date(w.date).toISOString().slice(0, 10)
      const grouped = exercisesToGroupedRows(w.exercises || [])
      const muscleGroups = Array.from(new Set(
        grouped.filter((g: any) => !g.isCardio && !g.isWarmup && g.muscleGroup && g.muscleGroup !== 'cardio').map((g: any) => g.muscleGroup)
      )) as string[]
      const isCardio = grouped.some((g: any) => g.isCardio)
      const exercises = grouped.filter((g: any) => !g.isWarmup).map((g: any) => g.exercise).filter(Boolean) as string[]
      const prev = map.get(date)
      if (prev) {
        map.set(date, {
          workoutId: prev.workoutId,
          duration: prev.duration + (w.duration || 0),
          totalVolume: prev.totalVolume + (w.totalVolume || 0),
          muscleGroups: Array.from(new Set([...prev.muscleGroups, ...muscleGroups])),
          isCardio: prev.isCardio || isCardio,
          exercises: [...prev.exercises, ...exercises],
        })
      } else {
        map.set(date, { workoutId: w.id, duration: w.duration || 0, totalVolume: w.totalVolume || 0, muscleGroups, isCardio, exercises })
      }
    }
    return map
  }, [workouts])

  if (status === 'unauthenticated') {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="mb-4 text-muted-foreground">请先登录</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-6 py-2.5 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90">
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
        title="训练历史"
        subtitle={workouts.length > 0 ? `${workouts.length} 条记录` : undefined}
        onBack={() => router.back()}
      />
      <PullToRefresh onRefresh={refresh}>
        <PageContent>

        {/* Stats strip */}
        {!isLoading && !error && workouts.length > 0 && (
          <Section>
            <div className="card-grid-4 mb-3">
              {[
                { label: '总训练', value: workouts.length, icon: <Dumbbell className="w-3.5 h-3.5 text-primary" /> },
                { label: '本月', value: thisMonthCount, icon: <Calendar className="w-3.5 h-3.5 text-recovery" /> },
                { label: '连续', value: `${currentStreak}天`, icon: <Zap className="w-3.5 h-3.5 text-warning" /> },
                { label: '最长', value: `${maxStreak}天`, icon: <Trophy className="w-3.5 h-3.5 text-primary" /> },
              ].map(s => (
                <div key={s.label} className="metric-compact text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">{s.icon}</div>
                  <div className="text-lg font-black text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <WorkoutMonthCalendar dayMap={workoutDayMap} />
          </Section>
        )}

        {/* Loading / error / empty */}
        <Section>
        {isLoading ? (
          <SkeletonList rows={4} />
        ) : error ? (
          <EmptyState icon={<AlertCircle className="w-8 h-8" />} title="加载失败" description="请检查网络后重试" action={{ label: '重新加载', onClick: refresh }} />
        ) : workouts.length === 0 ? (
          <EmptyState icon={<Dumbbell className="w-8 h-8" />} title="还没有训练记录" description="完成第一次训练后，这里会显示你的历史记录" action={{ label: hasActiveSession ? '继续训练' : '开始训练', onClick: () => router.push('/workout') }} />
        ) : (
          <div className="card-stack">
            {workouts.map(workout => {
              const groupedExercises = exercisesToGroupedRows(workout.exercises || [])
              return (
                <div key={workout.id} className="rounded-2xl p-4 bg-card border border-border cursor-pointer transition-all active:scale-[0.99]"
                  onClick={() => router.push(`/workout/${workout.id}`)}>

                  {/* Card header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          {new Date(workout.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs flex items-center gap-2.5 mt-0.5 text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round((workout.duration || 0) / 60)}分钟</span>
                          {workout.totalVolume > 0 && (
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{(workout.totalVolume / 1000).toFixed(1)}t</span>
                          )}
                        </div>
                        {(() => {
                          const strengthGroups = Array.from(new Set(
                            groupedExercises.filter((l: any) => !l.isCardio && !l.isWarmup && l.muscleGroup && l.muscleGroup !== 'cardio').map((l: any) => l.muscleGroup)
                          ))
                          const hasCardio = groupedExercises.some((l: any) => l.isCardio)
                          const hasWarmup = groupedExercises.some((l: any) => l.isWarmup)
                          return (strengthGroups.length > 0 || hasCardio || hasWarmup) ? (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {hasCardio && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">有氧</span>}
                              {hasWarmup && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-secondary text-muted-foreground">热身</span>}
                              {strengthGroups.map((g: any, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-secondary text-foreground">{g}</span>
                              ))}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(workout.id) }}
                      disabled={deleting === workout.id}
                      className={`p-2 rounded-xl transition-all shrink-0 ${confirmDeleteId === workout.id ? 'bg-danger/10 text-danger' : 'text-muted-foreground bg-transparent'}`}
                      title={confirmDeleteId === workout.id ? '再次点击确认删除' : '删除'}
                    >
                      {confirmDeleteId === workout.id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Exercise rows */}
                  {groupedExercises.length > 0 ? (
                    <div className="space-y-1.5">
                      {groupedExercises.map((log: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary">
                          {log.isCardio
                            ? <Activity className="w-3.5 h-3.5 shrink-0 text-primary" />
                            : log.isWarmup
                              ? <Flame className="w-3.5 h-3.5 shrink-0 text-warning" />
                              : <Dumbbell className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                          <span className="flex-1 text-sm font-medium truncate">{log.exercise}</span>
                          {log.isCardio && log.sets[0] ? (
                            <span className="text-sm font-semibold tabular-nums text-primary">
                              {log.sets[0].weight > 0 ? `${log.sets[0].weight}km` : ''}
                            </span>
                          ) : log.isWarmup ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">热身</span>
                          ) : (
                            <span className="text-sm font-bold tabular-nums text-primary">
                              {log.sets.filter((s: any) => !s.isWarmup && !s.isCardio).reduce((sum: number, s: any) => sum + s.weight * s.reps, 0)}kg
                              <span className="text-xs font-normal ml-1 text-muted-foreground">{log.sets.length}组</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm px-1 text-muted-foreground">暂无动作数据</p>
                  )}

                  {workout.notes && (() => {
                    try {
                      const parsed = JSON.parse(workout.notes)
                      return parsed.memo ? <p className="mt-2.5 text-xs italic px-1 text-muted-foreground">{parsed.memo}</p> : null
                    } catch {
                      return <p className="mt-2.5 text-xs italic px-1 text-muted-foreground">{workout.notes}</p>
                    }
                  })()}
                </div>
              )
            })}
          </div>
        )}
        </Section>
        </PageContent>
      </PullToRefresh>

    </PageShell>
  )
}