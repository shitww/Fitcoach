"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trophy, Search, TrendingUp, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { logger } from '@/lib/logger'
import { SkeletonStatGrid, SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { PageShell, PageHeader, PageContent, Section } from "@/components/layout"

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

export default function PersonalBestPage() {
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
        `/api/analysis/personal-records?exercise=${encodeURIComponent(exercise)}`,
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

  const filtered = useMemo(() =>
    search ? records.filter(r => r.exercise.toLowerCase().includes(search.toLowerCase())) : records,
    [records, search]
  )

  const topRM = records[0]?.estimated1RM ?? 0

  const medalClass = (i: number) =>
    i === 0 ? 'text-warning bg-warning/15' : i === 1 ? 'text-muted-foreground bg-muted' : i === 2 ? 'text-warning/80 bg-warning/10' : 'text-warning/70 bg-warning/8'

  return (
    <PageShell>
      <PageHeader
        title="个人最佳"
        subtitle="点击动作查看完整训练历史"
        onBack={() => router.back()}
      />
      <PageContent bare>

        {/* Summary cards */}
        <Section>
          {loading && <SkeletonStatGrid cols={3} />}
          {!loading && records.length > 0 && (
            <div className="card-grid-3">
              <div className="metric-compact">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs text-muted-foreground">动作总数</span>
                </div>
                <div className="text-2xl font-black text-warning">{records.length}</div>
              </div>
              <div className="metric-compact">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">最强 1RM</span>
                </div>
                <div className="text-2xl font-black text-primary">
                  {Math.round(topRM)}<span className="text-xs ml-0.5">kg</span>
                </div>
              </div>
              <div className="metric-compact">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-recovery" />
                  <span className="text-xs text-muted-foreground">最强动作</span>
                </div>
                <div className="text-xs font-black leading-snug text-recovery">{records[0]?.exercise ?? '—'}</div>
              </div>
            </div>
          )}
        </Section>

        {/* Search */}
        {records.length > 5 && (
          <Section>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索动作…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors bg-card border border-border text-foreground"
              />
            </div>
          </Section>
        )}

        {/* Records list */}
        <Section>
        {loading ? (
          <SkeletonList rows={5} />
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="w-8 h-8" />}
            title="加载失败"
            description="请检查网络后重试"
            action={{ label: '重新加载', onClick: fetchRecords }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8" />}
            title={search ? `未找到「${search}」` : '暂无记录'}
            description={search ? '尝试其他关键词' : '完成训练后自动生成个人最佳记录'}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((rec) => {
              const rank = records.indexOf(rec)
              const isExpanded = expandedExercise === rec.exercise
              const exHistory = history[rec.exercise] ?? []
              const isLoadingHistory = historyLoading === rec.exercise

              return (
                <div key={rec.exercise}
                  className={`rounded-2xl overflow-hidden bg-card border ${isExpanded ? 'border-primary/40' : 'border-border'}`}>

                  {/* Summary row — clickable */}
                  <button
                    onClick={() => toggleExercise(rec.exercise)}
                    className="w-full flex items-center gap-3 p-3.5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Rank badge */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${medalClass(rank)}`}>
                      {rank + 1}
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-snug">{rec.exercise}</div>
                      <div className="text-xs mt-0.5 text-muted-foreground">
                        PR: {rec.date}
                      </div>
                    </div>

                    {/* Best stats */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-warning">
                        {rec.weight}kg × {rec.reps}次
                      </div>
                      <div className="text-xs mt-0.5 text-muted-foreground">
                        1RM ≈ <span className="text-primary">{Math.round(rec.estimated1RM)} kg</span>
                      </div>
                    </div>

                    {/* Expand icon */}
                    <div className="shrink-0 ml-1 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded: trend chart + history list */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">加载历史…</span>
                        </div>
                      ) : exHistory.length === 0 ? (
                        <p className="text-center py-6 text-xs text-muted-foreground">
                          暂无历史记录
                        </p>
                      ) : (
                        <>
                          {/* 1RM Trend chart */}
                          {exHistory.length >= 2 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold text-foreground">
                                  1RM 进步曲线
                                </span>
                              </div>
                              <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={exHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis
                                      dataKey="date"
                                      stroke="rgb(var(--muted-foreground))"
                                      fontSize={9}
                                      tickFormatter={d => d.slice(5)}
                                    />
                                    <YAxis
                                      stroke="rgb(var(--muted-foreground))"
                                      fontSize={9}
                                      tickFormatter={v => `${v}kg`}
                                      domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                      contentStyle={{ backgroundColor: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '10px', fontSize: '11px' }}
                                      formatter={(val) => [`${val} kg`, '估算1RM']}
                                      labelFormatter={l => `${l}`}
                                    />
                                    <ReferenceLine y={Math.round(rec.estimated1RM)} stroke="rgb(var(--primary) / 0.4)" strokeDasharray="4 4" />
                                    <Line
                                      type="monotone"
                                      dataKey="estimated1RM"
                                      stroke="rgb(var(--primary))"
                                      strokeWidth={2}
                                      dot={{ fill: 'rgb(var(--primary))', r: 3, strokeWidth: 0 }}
                                      activeDot={{ r: 5 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                          {/* Per-session history list */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs font-semibold text-foreground">
                              每次训练记录
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({exHistory.length} 次)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {exHistory.map((h, hi) => {
                              const isPR = h.estimated1RM >= rec.estimated1RM;
                              return (
                                <div key={hi} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                  <div>
                                    <div className="text-xs font-semibold">{h.date}</div>
                                    <div className="text-xs mt-0.5 text-muted-foreground">
                                      {h.weight}kg × {h.reps}次
                                    </div>
                                  </div>
                                  <div className={`text-xs shrink-0 flex items-center gap-1 ${isPR ? 'text-primary' : 'text-muted-foreground'}`}>
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
        </Section>
      </PageContent>
    </PageShell>
  )
}
