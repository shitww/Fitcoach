'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trophy, Search, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { logger } from '@/lib/logger'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import {
  BodyIntelligenceSurface,
  ProgressionVelocity,
} from '@/components/runtime-analytics'

interface PRRecord {
  exercise: string
  weight: number
  reps: number
  estimated1RM: number
  date: string
}

interface HistoryPoint {
  date: string
  weight: number
  reps: number
  estimated1RM: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [records, setRecords] = useState<PRRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({})
  const [historyLoading, setHistoryLoading] = useState<string | null>(null)

  const fetchRecords = async () => {
    setError(false)
    try {
      const res = await fetch('/api/analysis/personal-records', { credentials: 'include' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      setRecords(data.records || [])
    } catch (e) {
      logger.error('Personal records fetch error:', e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin')
    if (status === 'authenticated') fetchRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const fetchHistory = useCallback(async (exercise: string) => {
    if (history[exercise]) return
    setHistoryLoading(exercise)
    try {
      const res = await fetch(
        '/api/analysis/personal-records?exercise=' + encodeURIComponent(exercise),
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        setHistory(prev => ({ ...prev, [exercise]: data.history || [] }))
      }
    } catch (e) {
      logger.error('Exercise history fetch error:', e)
    } finally {
      setHistoryLoading(null)
    }
  }, [history])

  const toggleExercise = (exercise: string) => {
    if (expandedExercise === exercise) {
      setExpandedExercise(null)
    } else {
      setExpandedExercise(exercise)
      fetchHistory(exercise)
    }
  }

  const filtered = search
    ? records.filter(r => r.exercise.toLowerCase().includes(search.toLowerCase()))
    : records

  // Derived intelligence metrics
  const topRM = records[0]?.estimated1RM ?? 0
  const overallReadiness = records.length > 0 ? Math.min(1, 0.3 + records.length * 0.02) : 0.3
  const consistencyScore = Math.min(1, records.length / 20)
  const fatigueTrend: 'rising' | 'falling' | 'stable' = records.length > 10 ? 'rising' : records.length > 5 ? 'stable' : 'falling'

  return (
    <PageShell>
      <PageHeader
        title="身体智能"
        subtitle="力量进展与恢复状态"
        onBack={() => router.back()}
      />
      <PageContent bare>

        {/* Adaptive Body Intelligence Hero */}
        {!loading && records.length > 0 && (
          <BodyIntelligenceSurface
            overallReadiness={overallReadiness}
            fatigueTrend={fatigueTrend}
            consistencyScore={consistencyScore}
            nextRecommendation={
              records.length > 0
                ? '最强动作 ' + records[0].exercise + ' 1RM ≈ ' + Math.round(topRM) + 'kg，继续保持'
                : '开始训练，建立你的力量基线'
            }
          />
        )}

        {/* Search */}
        {records.length > 5 && (
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--rvl-text-faint)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索动作…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--rvl-surface-1)', border: '1px solid var(--rvl-border-subtle)', color: 'var(--rvl-text-high)' }}
              />
            </div>
          </div>
        )}

        {/* Progression Velocity per exercise */}
        {loading ? (
          <div className="px-5">
            <SkeletonList rows={4} />
          </div>
        ) : error ? (
          <div className="px-5">
            <EmptyState
              icon={<AlertCircle className="w-8 h-8" />}
              title="加载失败"
              description="请检查网络后重试"
              action={{ label: '重新加载', onClick: fetchRecords }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5">
            <EmptyState
              icon={<Trophy className="w-8 h-8" />}
              title={search ? '未找到「' + search + '」' : '暂无记录'}
              description={search ? '尝试其他关键词' : '完成训练后自动生成个人最佳记录'}
            />
          </div>
        ) : (
          <div className="px-5 pb-6 space-y-3">
            <p className="rvl-label-text">力量进展</p>
            {filtered.map((rec) => {
              const isExpanded = expandedExercise === rec.exercise
              const exHistory = history[rec.exercise] ?? []
              const isLoadingHistory = historyLoading === rec.exercise
              const velocity = exHistory.length >= 2
                ? (exHistory[exHistory.length - 1].estimated1RM - exHistory[0].estimated1RM) / exHistory[0].estimated1RM
                : 0

              return (
                <div key={rec.exercise}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--rvl-surface-1)', border: '1px solid ' + (isExpanded ? 'var(--rvl-active)' : 'var(--rvl-border-subtle)') }}>

                  {/* Header row */}
                  <button
                    onClick={() => toggleExercise(rec.exercise)}
                    className="w-full flex items-center gap-3 p-3.5 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: 'var(--rvl-active-dim)', color: 'var(--rvl-active)' }}>
                      {records.indexOf(rec) + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-snug" style={{ color: 'var(--rvl-text-high)' }}>{rec.exercise}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--rvl-text-faint)' }}>PR: {rec.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm" style={{ color: 'var(--rvl-active)' }}>
                        {rec.weight}kg × {rec.reps}次
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--rvl-text-faint)' }}>
                        1RM ≈ <span style={{ color: 'var(--rvl-active)' }}>{Math.round(rec.estimated1RM)} kg</span>
                      </div>
                    </div>
                    <div className="shrink-0 ml-1" style={{ color: 'var(--rvl-text-faint)' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded: Progression Velocity + history */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--rvl-border-subtle)' }}>
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--rvl-active)' }} />
                          <span className="text-xs" style={{ color: 'var(--rvl-text-faint)' }}>加载历史…</span>
                        </div>
                      ) : exHistory.length === 0 ? (
                        <p className="text-center py-6 text-xs" style={{ color: 'var(--rvl-text-faint)' }}>暂无历史记录</p>
                      ) : (
                        <>
                          {exHistory.length >= 2 && (
                            <ProgressionVelocity
                              exercise={rec.exercise}
                              data={exHistory.map(h => ({ date: h.date, estimated1RM: h.estimated1RM }))}
                              velocity={velocity}
                            />
                          )}
                          <div className="space-y-1 mt-2">
                            {exHistory.map((h, hi) => {
                              const isPR = h.estimated1RM >= rec.estimated1RM
                              return (
                                <div key={hi} className="flex items-center justify-between py-2"
                                  style={{ borderBottom: '1px solid var(--rvl-border-subtle)' }}>
                                  <div>
                                    <div className="text-xs font-semibold" style={{ color: 'var(--rvl-text-high)' }}>{h.date}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--rvl-text-faint)' }}>{h.weight}kg × {h.reps}次</div>
                                  </div>
                                  <div className="text-xs shrink-0 flex items-center gap-1"
                                    style={{ color: isPR ? 'var(--rvl-active)' : 'var(--rvl-text-faint)' }}>
                                    {isPR && <Trophy className="w-3 h-3" />}
                                    {h.estimated1RM} kg
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}
