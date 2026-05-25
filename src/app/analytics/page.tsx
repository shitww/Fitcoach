"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Search, TrendingUp, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { logger } from '@/lib/logger'
import { SkeletonStatGrid, SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { AmbientGlow } from "@/components/AmbientGlow"

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

  const medalColor = (i: number) =>
    i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#FFB800'

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
      <AmbientGlow />

      <div className="relative max-w-2xl mx-auto px-4 py-6 pb-20">

        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
          </button>
          <div>
            <h1 className="text-xl font-black">个人最佳</h1>
            <p className="text-xs" style={{ color: 'var(--text-low)' }}>点击动作查看完整训练历史</p>
          </div>
        </header>

        {/* Summary cards */}
        {loading && <SkeletonStatGrid cols={3} className="mb-6" />}
        {!loading && records.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5" style={{ color: '#FFB800' }} />
                <span className="text-xs" style={{ color: 'var(--text-low)' }}>动作总数</span>
              </div>
              <div className="text-2xl font-black" style={{ color: '#FFB800' }}>{records.length}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span className="text-xs" style={{ color: 'var(--text-low)' }}>最强 1RM</span>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                {Math.round(topRM)}<span className="text-xs ml-0.5">kg</span>
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5" style={{ color: '#A855F7' }} />
                <span className="text-xs" style={{ color: 'var(--text-low)' }}>最强动作</span>
              </div>
              <div className="text-xs font-black leading-snug" style={{ color: '#A855F7' }}>{records[0]?.exercise ?? '—'}</div>
            </div>
          </div>
        )}

        {/* Search */}
        {records.length > 5 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索动作…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        )}

        {/* Records list */}
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
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface)', border: isExpanded ? '1px solid var(--accent-glow)' : '1px solid var(--border)' }}>

                  {/* Summary row — clickable */}
                  <button
                    onClick={() => toggleExercise(rec.exercise)}
                    className="w-full flex items-center gap-3 p-3.5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Rank badge */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{
                        background: rank < 3 ? `${medalColor(rank)}18` : 'rgba(255,184,0,0.08)',
                        color: medalColor(rank)
                      }}>
                      {rank + 1}
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-snug">{rec.exercise}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                        PR: {rec.date}
                      </div>
                    </div>

                    {/* Best stats */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm" style={{ color: '#FFB800' }}>
                        {rec.weight}kg × {rec.reps}次
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                        1RM ≈ <span style={{ color: 'var(--accent)' }}>{Math.round(rec.estimated1RM)} kg</span>
                      </div>
                    </div>

                    {/* Expand icon */}
                    <div className="shrink-0 ml-1" style={{ color: 'var(--text-faint)' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded: trend chart + history list */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--border)' }}>
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-low)' }}>加载历史…</span>
                        </div>
                      ) : exHistory.length === 0 ? (
                        <p className="text-center py-6 text-xs" style={{ color: 'var(--text-low)' }}>
                          暂无历史记录
                        </p>
                      ) : (
                        <>
                          {/* 1RM Trend chart */}
                          {exHistory.length >= 2 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-med)' }}>
                                  1RM 进步曲线
                                </span>
                              </div>
                              <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={exHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis
                                      dataKey="date"
                                      stroke="var(--text-faint)"
                                      fontSize={9}
                                      tickFormatter={d => d.slice(5)}
                                    />
                                    <YAxis
                                      stroke="var(--text-faint)"
                                      fontSize={9}
                                      tickFormatter={v => `${v}kg`}
                                      domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                      contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '11px' }}
                                      formatter={(val) => [`${val} kg`, '估算1RM']}
                                      labelFormatter={l => `📅 ${l}`}
                                    />
                                    <ReferenceLine y={Math.round(rec.estimated1RM)} stroke="var(--accent-glow)" strokeDasharray="4 4" />
                                    <Line
                                      type="monotone"
                                      dataKey="estimated1RM"
                                      stroke="var(--accent)"
                                      strokeWidth={2}
                                      dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                                      activeDot={{ r: 5 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                          {/* Per-session history list */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-med)' }}>
                              每次训练记录
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                              ({exHistory.length} 次)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {exHistory.map((h, hi) => {
                              const isPR = h.estimated1RM >= rec.estimated1RM;
                              return (
                                <div key={hi} className="flex items-center justify-between py-2 border-b last:border-0"
                                  style={{ borderColor: 'var(--border)' }}>
                                  <div>
                                    <div className="text-xs font-semibold">{h.date}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                                      {h.weight}kg × {h.reps}次
                                    </div>
                                  </div>
                                  <div className="text-xs shrink-0" style={{ color: isPR ? 'var(--accent)' : 'var(--text-faint)' }}>
                                    {isPR && <span className="mr-1">🏆</span>}
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
      </div>
    </div>
  )
}
