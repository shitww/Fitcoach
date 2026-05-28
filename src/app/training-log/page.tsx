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
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import BottomTabBar from "@/components/BottomTabBar"
import { logger } from "@/lib/logger"

const MuscleHeatmap = dynamic(
  () => import('@/components/ai-coaching/MuscleHeatmap').then(m => ({ default: m.MuscleHeatmap })),
  { ssr: false, loading: () => <div className="h-40 rounded-2xl animate-pulse bg-card" /> },
)
import { EmptyState } from "@/components/EmptyState"
import { useWorkoutTimer } from "@/stores/workoutTimer"
import { SkeletonStatGrid } from "@/components/Skeleton"
import { cachedFetch, getCached, setCached, invalidateCache } from "@/lib/client-cache"

const ProgressiveOverloadPanel = dynamic(
  () => import('@/components/ai-coaching/ProgressiveOverloadPanel').then(m => ({ default: m.ProgressiveOverloadPanel })),
  { ssr: false, loading: () => <div className="h-40 rounded-2xl animate-pulse bg-card" /> },
)

const TrendsBarChart = dynamic(() => import('./_components/TrendsBarChart'), {
  ssr: false,
  loading: () => <div className="h-52 rounded-xl animate-pulse bg-secondary" />,
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
    <PageShell>
      <PageHeader
        title="训练分析"
        action={
          <div className="flex items-center gap-1.5">
            <button onClick={() => router.push('/exercises')}
              title="动作库"
              className="p-2 rounded-xl transition-all hover:bg-muted bg-secondary border border-border">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => router.push('/history')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary border border-border text-muted-foreground hover:bg-muted"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              历史
            </button>
            {/* Time range dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTimeDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-secondary border border-border text-primary"
              >
                <Calendar className="w-4 h-4" />
                {currentLabel}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showTimeDropdown && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 rounded-2xl overflow-hidden bg-card border border-border shadow-xl"
                  style={{ minWidth: 130 }}
                >
                  {TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setTimeRange(opt.value); setShowTimeDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all border-b border-border ${timeRange === opt.value ? 'text-primary' : 'text-foreground'}`}
                    >
                      {opt.label}
                      {timeRange === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowTimeDropdown(false); router.push('/calendar'); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold border-t border-border text-muted-foreground"
                  >
                    <span className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" />查看日历</span>
                    <span className="text-muted-foreground">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />
      <PageContent>

        {/* Custom range banner */}
        {hasCustomRange && (
          <div className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-4 bg-secondary border border-border">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CalendarDays className="w-4 h-4" />
              <span className="font-bold">自定义区间</span>
              <span className="text-xs text-muted-foreground">{customStart} → {customEnd}</span>
            </div>
            <button onClick={() => router.push('/training-log')} title="清除区间">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* 统计卡片 */}
        {loading ? (
          <SkeletonStatGrid cols={4} className="mb-6" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Calendar, label: '训练次数', value: summary?.totalWorkouts ?? 0,                           unit: '次'  },
              { icon: Activity, label: '训练总量', value: ((summary?.totalVolume ?? 0) / 1000).toFixed(1) + 't', unit: ''   },
              { icon: Target,   label: '完成组数', value: summary?.totalSets ?? 0,                                 unit: '组'  },
              { icon: Clock,    label: '平均时长', value: summary?.avgDuration ?? 0,                               unit: '分钟' },
            ].map((stat, i) => (
              <div key={i} className="metric-compact">
                <div className="flex items-center gap-1.5 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-primary">
                  {stat.value}<span className="text-sm ml-0.5 text-muted-foreground">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 健康状态入口 */}
        <button
          onClick={() => router.push('/analytics/health')}
          className="w-full rounded-2xl p-4 mb-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform bg-card border border-border"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-danger/10">
            <ShieldAlert className="w-5 h-5 text-danger" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">健康状态</p>
            <p className="text-xs mt-0.5 text-muted-foreground">疲劳评分 · 受伤风险 · 营养缺口</p>
          </div>
          <span className="text-sm font-semibold text-primary">查看 →</span>
        </button>

        {/* 本周 AI 训练复盘 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">AI 训练复盘</span>
            </div>
            {(!weeklyRequested || weeklyReport) && (
              <button
                onClick={fetchWeeklyReport}
                disabled={weeklyLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 bg-secondary border border-border text-primary"
                style={{ touchAction: 'manipulation' }}
              >
                {weeklyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {weeklyReport ? '重新生成' : 'AI 生成复盘'}
              </button>
            )}
          </div>
          {!weeklyRequested ? (
            <div className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center bg-card border border-dashed border-border">
              <Sparkles className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground">点击「AI 生成复盘」查看本阶段训练总结与建议</p>
            </div>
          ) : weeklyLoading ? (
            <div className="rounded-2xl p-5 flex items-center gap-3 bg-card border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">AI 分析中…</span>
            </div>
          ) : weeklyReport ? (
            <div className="rounded-2xl p-5 bg-card border border-border">
              <p className="text-sm mb-3 leading-relaxed text-foreground">{weeklyReport.summary}</p>
              {weeklyReport.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {weeklyReport.highlights.map((h: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-primary border border-border">{h}</span>
                  ))}
                </div>
              )}
              {weeklyReport.nextWeekFocus && (
                <div className="rounded-xl p-3 bg-primary/10 border border-primary/20">
                  <div className="text-xs font-bold mb-1 text-primary">
                    {['week','lastweek','twoweeksago'].includes(timeRange) ? '下周建议' : timeRange === 'year' ? '明年建议' : '下阶段建议'}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{weeklyReport.nextWeekFocus}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-4 text-center bg-card border border-border">
              <p className="text-xs text-muted-foreground">生成失败，请重试</p>
            </div>
          )}
        </div>

        {/* 肌群热力图 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">肌群热力图</span>
          </div>
          <MuscleHeatmap period={timeRange} />
        </div>

        {/* 超负荷分析 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">超负荷分析</span>
          </div>
          <ProgressiveOverloadPanel />
        </div>

        {/* 训练量趋势 */}
        <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{currentLabel}训练量趋势</span>
          </div>
          {trendsData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
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
          <div className="rounded-2xl mb-6 bg-card border border-border">
            <EmptyState
              icon={<Dumbbell className="w-10 h-10" />}
              title="还没有训练记录"
              description="开始第一次训练后，这里会显示你的进度、力量趋势与肌群热力图"
              action={{ label: hasActiveSession ? '继续训练' : '开始训练', onClick: () => router.push('/workout') }}
            />
          </div>
        )}
        {recentWorkouts.length > 0 && (
          <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold">训练历史</h3>
              </div>
              <button onClick={() => router.push("/history")}
                className="text-sm font-semibold text-primary">
                全部记录 →
              </button>
            </div>
            <div className="space-y-2">
              {recentWorkouts.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {new Date(w.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                    </div>
                    <div className="text-xs truncate text-muted-foreground">
                      {w.exercises?.map((e: { name?: string }) => e.name).filter(Boolean).join(" · ") || "训练日"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm text-primary">{formatVolume(w.totalVolume)}</div>
                    <div className="text-xs text-muted-foreground">{w.duration || 0} 分钟</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 个人最佳 */}
        <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-bold">个人最佳</h3>
            </div>
            <button onClick={() => router.push("/analytics")}
              className="text-sm font-semibold text-primary">
              全部 →
            </button>
          </div>
          {records.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              暂无记录，开始训练后自动生成
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-primary/10 text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{rec.exercise}</div>
                    <div className="text-xs text-muted-foreground">{rec.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-primary">{rec.weight}kg × {rec.reps}次</div>
                    <div className="text-xs text-muted-foreground">
                      估算 1RM: {Math.round(rec.estimated1RM)} kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </PageContent>

      <BottomTabBar active="training" />
    </PageShell>
  )
}

export default function TrainingAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="page-shell items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <TrainingAnalysisContent />
    </Suspense>
  )
}
