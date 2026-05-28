"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dumbbell, TrendingUp, Clock, Calendar,
  Trophy, Activity, Target,
  ChevronDown, Check, Sparkles, Loader2, CalendarDays, X, ShieldAlert
} from "lucide-react"
import { AmbientGlow } from "@/components/AmbientGlow"
import BottomTabBar from "@/components/BottomTabBar"
import { MuscleHeatmap } from "@/components/ai-coaching/MuscleHeatmap"
import { logger } from "@/lib/logger"
import { EmptyState } from "@/components/EmptyState"
import { useWorkoutTimer } from "@/stores/workoutTimer"
import { SkeletonStatGrid } from "@/components/Skeleton"
import { cachedFetch, getCached, setCached, invalidateCache } from "@/lib/client-cache"

const ProgressiveOverloadPanel = dynamic(
  () => import('@/components/ai-coaching/ProgressiveOverloadPanel').then(m => ({ default: m.ProgressiveOverloadPanel })),
  { ssr: false, loading: () => <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} /> },
)

const TrendsBarChart = dynamic(() => import('./_components/TrendsBarChart'), {
  ssr: false,
  loading: () => <div className="h-52 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />,
})

function formatVolume(vol: number) {
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + "t"
  if (vol >= 1000) return (vol / 1000).toFixed(1) + "t"
  return vol + "kg"
}


function TrainingAnalysisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customStart = searchParams.get('start')
  const customEnd = searchParams.get('end')
  const hasCustomRange = !!(customStart && customEnd)
  const { isTrainingActive, isPaused } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused
  const { status } = useSession()
  const [timeRange, setTimeRange] = useState('month')
  const cacheKey = `training-analysis:${timeRange}`
  const cached = getCached<any>(cacheKey)
  const [summary, setSummary] = useState<any>(() => getCached<any>(`training-analysis:month`)?.summary ?? null)
  const [records, setRecords] = useState<any[]>(() => getCached<any>(`training-analysis:month`)?.records ?? [])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>(() => getCached<any>(`training-analysis:month`)?.recentWorkouts ?? [])
  const [loading, setLoading] = useState(() => !getCached<any>(`training-analysis:month`))
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState<any>(null)
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [weeklyRequested, setWeeklyRequested] = useState(false)
  const [trendsData, setTrendsData] = useState<any[]>([])

  const TIME_OPTIONS = [
    { value: 'week',        label: '本周' },
    { value: 'lastweek',    label: '上周' },
    { value: 'twoweeksago', label: '上上周' },
    { value: 'month',       label: '本月' },
    { value: 'lastmonth',   label: '上月' },
    { value: 'year',        label: '年度' },
  ]
  const currentLabel = TIME_OPTIONS.find(o => o.value === timeRange)?.label ?? '本月'

  const fetchData = async () => {
    try {
      const periodParam = hasCustomRange
        ? `custom&start=${customStart}&end=${customEnd}`
        : timeRange
      const [sumResult, recResult, wResult, trendsResult] = await Promise.all([
        cachedFetch(`/api/analysis/summary?period=${periodParam}`, { credentials: "include" }),
        cachedFetch("/api/analysis/personal-records", { credentials: "include" }),
        cachedFetch("/api/workout?limit=5", { credentials: "include" }),
        cachedFetch(`/api/analysis/trends?period=${periodParam}`, { credentials: "include" }),
      ])
      const sumData = sumResult.data as any
      const recData = recResult.data as any
      const wData = wResult.data as any
      const trendsData = trendsResult.data as any
      setSummary(sumData)
      setRecords((recData?.records || []).slice(0, 5))
      setRecentWorkouts(wData?.data || [])
      setTrendsData(trendsData?.trends || [])
      // Persist to session cache keyed by time range
      setCached(cacheKey, { summary: sumData, records: (recData?.records || []).slice(0, 5), recentWorkouts: wData?.data || [] })
    } catch (e) {
      logger.warn("[TrainingAnalysis] fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (status === "authenticated") fetchData()
    else if (status === "unauthenticated") router.replace("/auth/signin")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeRange, customStart, customEnd, router])

  const fetchWeeklyReport = async () => {
    setWeeklyRequested(true)
    setWeeklyLoading(true)
    setWeeklyReport(null)
    try {
      const res = await fetch(`/api/analysis/weekly-summary?period=${timeRange}`, { credentials: "include" })
      if (res.ok) setWeeklyReport(await res.json())
    } catch (e) {
      logger.warn("[TrainingAnalysis] weekly report error:", e)
    } finally {
      setWeeklyLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: "Inter, Space Grotesk, sans-serif" }}>
      <AmbientGlow />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black tracking-tight">训练分析</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/exercises')}
              title="动作库"
              className="p-2 rounded-xl transition-all hover:bg-muted active:scale-95"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Dumbbell className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </button>
            {/* Recent history shortcut */}
            <button
              onClick={() => router.push('/history')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)', touchAction: 'manipulation' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              训练历史
            </button>
            {/* Time range dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTimeDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--accent)', touchAction: 'manipulation' }}
              >
                <Calendar className="w-4 h-4" />
                {currentLabel}
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-low)', transform: showTimeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showTimeDropdown && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', minWidth: 130, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
                >
                  {TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setTimeRange(opt.value); setShowTimeDropdown(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all"
                      style={{ color: timeRange === opt.value ? 'var(--accent)' : 'var(--text-med)', borderBottom: '1px solid var(--border)' }}
                    >
                      {opt.label}
                      {timeRange === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowTimeDropdown(false); router.push('/calendar'); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                    style={{ color: 'var(--text-low)', borderTop: '1px solid var(--border)' }}
                  >
                    <span className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" />查看日历</span>
                    <span style={{ color: 'var(--text-faint)' }}>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Custom range banner */}
        {hasCustomRange && (
          <div className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-4"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-med)" }}>
              <CalendarDays className="w-4 h-4" />
              <span className="font-bold">自定义区间</span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>{customStart} → {customEnd}</span>
            </div>
            <button onClick={() => router.push('/training-log')} title="清除区间">
              <X className="w-4 h-4" style={{ color: "var(--text-faint)" }} />
            </button>
          </div>
        )}

        {/* 统计卡片 */}
        {loading ? (
          <SkeletonStatGrid cols={4} className="mb-6" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Calendar,   label: '训练次数', value: summary?.totalWorkouts ?? 0,                                  unit: '次',  color: 'var(--accent)' },
              { icon: Activity,   label: '训练总量', value: ((summary?.totalVolume ?? 0) / 1000).toFixed(1) + 't',        unit: '',    color: 'var(--accent)' },
              { icon: Target,     label: '完成组数', value: summary?.totalSets ?? 0,                                      unit: '组',  color: 'var(--accent)' },
              { icon: Clock,      label: '平均时长', value: summary?.avgDuration ?? 0,                                    unit: '分钟', color: 'var(--accent)' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{stat.label}</span>
                </div>
                <div className="text-2xl font-black" style={{ color: stat.color }}>
                  {stat.value}<span className="text-sm ml-0.5" style={{ color: 'var(--text-faint)' }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 健康状态入口 */}
        <button
          onClick={() => router.push('/analytics/health')}
          className="w-full rounded-2xl p-4 mb-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, rgb(var(--destructive)) 12%, transparent)' }}>
            <ShieldAlert className="w-5 h-5" style={{ color: 'rgb(var(--destructive))' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">健康状态</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>疲劳评分 · 受伤风险 · 营养缺口</p>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>查看 →</span>
        </button>

        {/* 本周 AI 训练复盘 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-bold">AI 训练复盘</span>
            </div>
            {(!weeklyRequested || weeklyReport) && (
              <button
                onClick={fetchWeeklyReport}
                disabled={weeklyLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--accent)', touchAction: 'manipulation' }}
              >
                {weeklyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {weeklyReport ? '重新生成' : 'AI 生成复盘'}
              </button>
            )}
          </div>
          {!weeklyRequested ? (
            <div className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}>
              <Sparkles className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              <p className="text-sm" style={{ color: 'var(--text-low)' }}>点击「AI 生成复盘」查看本阶段训练总结与建议</p>
            </div>
          ) : weeklyLoading ? (
            <div className="rounded-2xl p-5 flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-faint)' }}>AI 分析中…</span>
            </div>
          ) : weeklyReport ? (
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-high)' }}>{weeklyReport.summary}</p>
              {weeklyReport.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {weeklyReport.highlights.map((h: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--accent)', border: '1px solid var(--border)' }}>{h}</span>
                  ))}
                </div>
              )}
              {weeklyReport.nextWeekFocus && (
                <div className="rounded-xl p-3" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent, rgba(134,179,0,0.2))' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>
                    {['week','lastweek','twoweeksago'].includes(timeRange) ? '下周建议' : timeRange === 'year' ? '明年建议' : '下阶段建议'}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-low)' }}>{weeklyReport.nextWeekFocus}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>生成失败，请重试</p>
            </div>
          )}
        </div>

        {/* 肌群热力图 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold">肌群热力图</span>
          </div>
          <MuscleHeatmap period={timeRange} />
        </div>

        {/* 超负荷分析 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold">超负荷分析</span>
          </div>
          <ProgressiveOverloadPanel />
        </div>

        {/* 训练量趋势 */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold">{currentLabel}训练量趋势</span>
          </div>
          {trendsData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--text-faint)' }}>
              {currentLabel}暂无训练数据
            </div>
          ) : (
            <TrendsBarChart
              data={(trendsData as { date: string; volume: number }[]).map(t => ({
                date: t.date.slice(5),
                volume: Math.round(t.volume / 1000),
              }))}
            />
          )}
        </div>

        {/* 最近训练 */}
        {recentWorkouts.length === 0 && !loading && (
          <div className="rounded-2xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <EmptyState
              icon={<Dumbbell className="w-10 h-10" />}
              title="还没有训练记录"
              description="开始第一次训练后，这里会显示你的进度、力量趋势与肌群热力图"
              action={{ label: hasActiveSession ? '继续训练' : '开始训练', onClick: () => router.push('/workout') }}
            />
          </div>
        )}
        {recentWorkouts.length > 0 && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-bold">训练历史</h3>
              </div>
              <button onClick={() => router.push("/history")}
                className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                全部记录 →
              </button>
            </div>
            <div className="space-y-2">
              {recentWorkouts.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-dim)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {new Date(w.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-low)' }}>
                      {w.exercises?.map((e: { name?: string }) => e.name).filter(Boolean).join(" · ") || "训练日"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{formatVolume(w.totalVolume)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{w.duration || 0} 分钟</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 个人最佳 */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold">个人最佳</h3>
            </div>
            <button onClick={() => router.push("/analytics")}
              className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              全部 →
            </button>
          </div>
          {records.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: 'var(--text-faint)' }}>
              暂无记录，开始训练后自动生成
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{rec.exercise}</div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{rec.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black" style={{ color: 'var(--accent)' }}>{rec.weight}kg × {rec.reps}次</div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      估算 1RM: {Math.round(rec.estimated1RM)} kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomTabBar active="training" />
    </div>
  )
}

export default function TrainingAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    }>
      <TrainingAnalysisContent />
    </Suspense>
  )
}
