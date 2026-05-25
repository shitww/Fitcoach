"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Minus, Utensils, Droplets, Zap,
  Camera, Loader2, ChevronDown, ChevronUp, BarChart3, FileText
} from "lucide-react"
import { SkeletonStatGrid, SkeletonScoreCard, SkeletonChart } from "@/components/Skeleton"
import { AmbientGlow } from "@/components/AmbientGlow"
import BottomTabBar from "@/components/BottomTabBar"

const WeeklyTrendsCharts = dynamic(() => import('./_components/WeeklyTrendsCharts'), {
  ssr: false,
  loading: () => <div className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />,
})

// ── Types ──────────────────────────────────────────────────────────────────────
interface AiInsights {
  proteinScore: number; proteinDesc: string
  carbsScore: number;   carbsDesc: string
  fatScore: number;     fatDesc: string
  hydrationScore: number; hydrationDesc: string
  overallScore: number; overallLevel: string; overallAssessment: string
  gaps: {
    nutrient: string; gapAmount: number; unit: string
    recommendations: { combo: string; description: string; fillPercent: number }[]
  }[]
}

interface PhotoMealFood {
  name: string; quantity: number; unit: string
  calories: number; protein: number; carbs: number; fat: number
}

interface PhotoMealResult {
  foods: PhotoMealFood[]
  totalMacros: { calories: number; protein: number; carbs: number; fat: number }
  fitnessInterpretation: string
  mealTiming: string
}

interface WeeklyDay {
  date: string
  dayLabel: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

interface WeeklyReport {
  title: string
  summary: string
  highlightDay: string
  weakDay: string
  nextWeekTip: string
}

// ── Arc SVG helper ─────────────────────────────────────────────────────────────
function ScoreArc({ score, color, label }: { score: number; color: string; label: string }) {
  const r = 28; const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ * 0.75
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(135deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="5"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ - dash + circ * 0.25}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs" style={{ color: 'var(--text-med)' }}>{label}</span>
    </div>
  )
}

// ── AI Gap Card ────────────────────────────────────────────────────────────────
function AiGapCard({ gap }: { gap: AiInsights['gaps'][0] }) {
  const [open, setOpen] = useState(false)
  const colorMap: Record<string, string> = { '蛋白质': '#4ADE80', '碳水': '#22D3EE', '脂肪': '#FB923C' }
  const color = colorMap[gap.nutrient] ?? 'var(--accent)'
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <button className="w-full flex items-center justify-between p-4" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <Zap className="w-4 h-4" style={{ color }} />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold">今日{gap.nutrient}缺口</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-high)' }}>
              还差 <span className="font-bold" style={{ color }}>{gap.gapAmount}{gap.unit}</span>，点击查看 AI 补充方案
            </div>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-low)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-low)' }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs" style={{ color: 'var(--text-low)' }}>补上这个缺口，你只需要：</p>
          {gap.recommendations.map((r, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm">{r.combo}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                  style={{ background: `${color}20`, color }}>补{r.fillPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full mb-2" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${r.fillPercent}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-high)' }}>{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DietAnalysisPage() {
  const router = useRouter()
  const { status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [intake, setIntake] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [goals, setGoals] = useState({ targetCalories: 2000, targetProtein: 150, targetCarbs: 250, targetFat: 65 })
  const [waterMl, setWaterMl] = useState(() => {
    if (typeof window === 'undefined') return 0
    const key = `water_ml_${new Date().toISOString().split('T')[0]}`
    return parseInt(localStorage.getItem(key) || '0', 10)
  })
  const [loading, setLoading] = useState(true)

  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [recentWorkout, setRecentWorkout] = useState('')

  const [weeklyDays, setWeeklyDays] = useState<WeeklyDay[]>([])
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null)
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false)
  const [aiTab, setAiTab] = useState<'daily' | 'weekly'>('daily')

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState<PhotoMealResult | null>(null)
  const [photoError, setPhotoError] = useState('')

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [logRes, goalRes, workoutRes, weeklyRes] = await Promise.all([
        fetch(`/api/food-logs?date=${today}`, { credentials: 'include' }),
        fetch('/api/nutrition-goals', { credentials: 'include' }),
        fetch('/api/workout?limit=1', { credentials: 'include' }),
        fetch('/api/food-logs/weekly', { credentials: 'include' }),
      ])
      let newIntake = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      let newGoals = { targetCalories: 2000, targetProtein: 150, targetCarbs: 250, targetFat: 65 }
      if (logRes.ok) {
        const d = await logRes.json(); const s = d.summary
        if (s) newIntake = { calories: s.calories ?? 0, protein: s.protein ?? 0, carbs: s.carbs ?? 0, fat: s.fat ?? 0 }
      }
      if (goalRes.ok) {
        const d = await goalRes.json()
        newGoals = { targetCalories: d.targetCalories ?? 2000, targetProtein: d.targetProtein ?? 150, targetCarbs: d.targetCarbs ?? 250, targetFat: d.targetFat ?? 65 }
      }
      if (workoutRes.ok) {
        const d = await workoutRes.json()
        const w = d.data?.[0]
        if (w) {
          const exercises = w.exercises.map((e: { name: string }) => e.name).join('、')
          setRecentWorkout(`${new Date(w.date).toLocaleDateString('zh-CN')}：${exercises}（容量 ${w.totalVolume}kg）`)
        }
      }
      if (weeklyRes.ok) {
        const d = await weeklyRes.json()
        if (d.days) {
          // 合并本地饮水数据
          const daysWithWater = d.days.map((day: WeeklyDay) => {
            const w = parseInt(localStorage.getItem(`water_ml_${day.date}`) || '0', 10)
            return { ...day, water: w }
          })
          setWeeklyDays(daysWithWater)
        }
      }
      setIntake(newIntake); setGoals(newGoals)
      const w = parseInt(localStorage.getItem(`water_ml_${new Date().toISOString().split('T')[0]}`) || '0', 10)
      setWaterMl(w)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  useEffect(() => {
    // eslint-disable-next-line
    if (status === 'authenticated') fetchData()
    else if (status === 'unauthenticated') router.replace('/auth/signin')
  }, [status, router])

  const adjustWater = (delta: number) => {
    setWaterMl(prev => {
      const next = Math.max(0, prev + delta)
      localStorage.setItem(`water_ml_${new Date().toISOString().split('T')[0]}`, String(next))
      return next
    })
  }

  const fetchWeeklyReport = async () => {
    if (weeklyDays.length === 0 || !goals.targetCalories) return
    setWeeklyReportLoading(true)
    try {
      const res = await fetch('/api/diet-analysis/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days: weeklyDays, goals }),
      })
      if (res.ok) setWeeklyReport(await res.json())
    } catch { /* silent */ } finally { setWeeklyReportLoading(false) }
  }

  const fetchAiInsights = async (
    intakeData: typeof intake,
    goalsData: typeof goals,
    water: number,
    workoutDesc?: string
  ) => {
    setAiLoading(true); setAiError('')
    try {
      const res = await fetch('/api/diet-analysis/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ intake: intakeData, goals: goalsData, waterMl: water, recentWorkout: workoutDesc || undefined }),
      })
      if (res.ok) setAiInsights(await res.json())
      else { const d = await res.json(); setAiError(d.error || 'AI 分析失败') }
    } catch { setAiError('网络错误') } finally { setAiLoading(false) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPhotoError(''); setPhotoResult(null)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handlePhotoAnalyze = async () => {
    if (!photoPreview) return
    setPhotoLoading(true); setPhotoError('')
    try {
      const res = await fetch('/api/foods/photo-meal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: photoPreview }),
      })
      const data = await res.json()
      if (!res.ok) { setPhotoError(data.error || '识别失败'); return }
      setPhotoResult(data)
    } catch { setPhotoError('网络错误，请重试') } finally { setPhotoLoading(false) }
  }

  const ai = aiInsights
  const scoreColor = ai ? (ai.overallScore >= 85 ? 'var(--accent)' : ai.overallScore >= 65 ? '#FFB800' : '#FF6B35') : '#444'
  const overallScore = ai?.overallScore ?? 0
  const R = 36; const CIRC = 2 * Math.PI * R

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
      <AmbientGlow />
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFileSelect} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black tracking-tight">饮食分析</h1>
          <button onClick={() => router.push('/diet')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
            <Utensils className="w-4 h-4" />记录饮食
          </button>
        </header>

        {/* Quick stats */}
        {loading ? (
          <SkeletonStatGrid cols={4} className="mb-6" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: '热量',   value: Math.round(intake.calories), goal: goals.targetCalories, unit: 'kcal', color: 'var(--accent)' },
              { label: '碳水',   value: Math.round(intake.carbs),    goal: goals.targetCarbs,    unit: 'g',    color: '#22D3EE' },
              { label: '蛋白质', value: Math.round(intake.protein),  goal: goals.targetProtein,  unit: 'g',    color: '#4ADE80' },
              { label: '脂肪',   value: Math.round(intake.fat),      goal: goals.targetFat,      unit: 'g',    color: '#FB923C' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-low)' }}>{s.label}</div>
                <div className="text-xl font-black" style={{ color: s.color }}>
                  {s.value}<span className="text-xs ml-0.5 text-foreground/30">{s.unit}</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full" style={{ background: 'var(--surface-3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, s.goal > 0 ? (s.value/s.goal)*100 : 0)}%`, background: s.color }} />
                </div>
                <div className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-faint)' }}>/{s.goal}{s.unit}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── 拍照识食 · 健身解读 ── */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-bold">拍照识食 · 健身解读</span>
            </div>
            <button onClick={() => { setPhotoPreview(null); setPhotoResult(null); fileInputRef.current?.click() }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black active:scale-95"
              style={{ background: 'var(--accent)' }}>
              <Camera className="w-3.5 h-3.5" />{photoResult ? '重拍' : '拍照'}
            </button>
          </div>

          {!photoPreview && !photoResult && (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 flex flex-col items-center gap-2 transition-all"
              style={{ color: 'var(--text-faint)' }}>
              <Camera className="w-10 h-10" />
              <p className="text-sm">拍下你的餐食</p>
              <p className="text-xs">AI 自动识别食物并给出健身解读</p>
            </button>
          )}

          {photoPreview && !photoResult && (
            <div className="p-4 space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-card" style={{ maxHeight: 220 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="餐食" className="w-full object-contain" style={{ maxHeight: 220 }} />
                {photoLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ background: 'var(--background)', backdropFilter: 'blur(4px)' }}>
                    {/* 扫描线动画 */}
                    <div className="absolute inset-x-0" style={{ top: '0%', animation: 'scan-line 1.6s ease-in-out infinite', height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium">AI 识别中...</span>
                    <span className="text-xs" style={{ color: 'var(--text-high)' }}>分析食物成分与健身解读</span>
                  </div>
                )}
              </div>
              {photoError && <p className="text-xs text-red-400 px-1">{photoError}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setPhotoPreview(null); setPhotoError('') }} disabled={photoLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)' }}>重拍</button>
                <button onClick={handlePhotoAnalyze} disabled={photoLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50 active:scale-95"
                  style={{ background: 'var(--accent)' }}>
                  {photoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {photoLoading ? '识别中…' : '开始识别'}
                </button>
              </div>
            </div>
          )}

          {photoResult && (
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {photoResult.foods.map((f, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-high)' }}>
                    {f.name} {f.quantity}{f.unit}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '热量', value: photoResult.totalMacros.calories, unit: 'kcal', color: 'var(--accent)' },
                  { label: '蛋白', value: photoResult.totalMacros.protein,  unit: 'g',    color: 'var(--accent)' },
                  { label: '碳水', value: photoResult.totalMacros.carbs,    unit: 'g',    color: 'var(--accent)' },
                  { label: '脂肪', value: photoResult.totalMacros.fat,      unit: 'g',    color: 'var(--accent)' },
                ].map((m, i) => (
                  <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: 'var(--surface-2)' }}>
                    <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-low)' }}>{m.label}</div>
                    <div className="text-sm font-black" style={{ color: m.color }}>{m.value}<span className="text-[9px] ml-0.5 opacity-50">{m.unit}</span></div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>健身解读</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {photoResult.mealTiming}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-med)' }}>
                  {photoResult.fitnessInterpretation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── 补水记录 ── */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-bold">今日补水</span>
            </div>
            <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>
              {waterMl}<span className="text-xs font-normal text-foreground/30 ml-0.5">/ 2000 ml</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full mb-4" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (waterMl/2000)*100)}%`, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-dim)' }} />
          </div>
          <div className="flex items-center gap-2">
            {[200, 350, 500].map(ml => (
              <button key={ml} onClick={() => adjustWater(ml)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)' }}>
                +{ml}ml
              </button>
            ))}
            <button onClick={() => adjustWater(-200)}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Minus className="w-4 h-4" style={{ color: 'var(--text-high)' }} />
            </button>
          </div>
        </div>

        {/* ── AI 智能分析（今日 / 周报 合并卡片） ── */}
        <div className="rounded-2xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* 卡片头：标题 + Tab 切换 + 刷新 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-bold">AI 饮食智能</span>
              {(aiLoading || weeklyReportLoading) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" style={{ color: 'var(--text-low)' }} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 刷新按钮 */}
              {aiTab === 'daily' && ai && !aiLoading && (
                <button onClick={() => fetchAiInsights(intake, goals, waterMl, recentWorkout)}
                  className="p-1.5 rounded-lg active:scale-95 transition-all" style={{ color: 'var(--text-low)' }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
                  </svg>
                </button>
              )}
              {aiTab === 'weekly' && weeklyReport && !weeklyReportLoading && (
                <button onClick={fetchWeeklyReport}
                  className="p-1.5 rounded-lg active:scale-95 transition-all" style={{ color: 'var(--text-low)' }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
                  </svg>
                </button>
              )}
              {/* Tab 切换 */}
              <div className="flex gap-0.5 rounded-xl p-0.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {([
                  { key: 'daily',  label: '今日分析', icon: <Zap  className="w-3 h-3" /> },
                  { key: 'weekly', label: '周报告',   icon: <BarChart3 className="w-3 h-3" /> },
                ] as const).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setAiTab(t.key)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={aiTab === t.key
                      ? { background: 'var(--accent)', color: 'var(--accent-text)' }
                      : { color: 'var(--text-low)' }}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">

            {/* ══ 今日分析 Tab ══ */}
            {aiTab === 'daily' && (
              <>
                {!ai && !aiLoading && !aiError ? (
                  <div className="text-center py-5">
                    {recentWorkout && (
                      <div className="mb-3 rounded-xl px-3 py-2 text-[11px]" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
                        结合训练：{recentWorkout}
                      </div>
                    )}
                    <p className="text-xs mb-4" style={{ color: 'var(--text-low)' }}>
                      基于今日摄入与目标{recentWorkout ? '及最近训练' : ''}，AI 为你评估饮食恢复状态并推荐缺口补充方案
                    </p>
                    <button onClick={() => fetchAiInsights(intake, goals, waterMl, recentWorkout)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold active:scale-[0.98]"
                      style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                      <Zap className="w-4 h-4" />开始 AI 分析
                    </button>
                  </div>
                ) : aiError ? (
                  <div className="text-center py-6">
                    <p className="text-xs mb-3" style={{ color: 'var(--text-low)' }}>{aiError}</p>
                    <button onClick={() => fetchAiInsights(intake, goals, waterMl, recentWorkout)}
                      className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                      重新分析
                    </button>
                  </div>
                ) : aiLoading && !ai ? (
                  <SkeletonScoreCard />
                ) : ai ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative w-24 h-24">
                          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(135deg)' }}>
                            <circle cx="48" cy="48" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="6"
                              strokeDasharray={`${CIRC*0.75} ${CIRC*0.25}`} strokeLinecap="round" />
                            <circle cx="48" cy="48" r={R} fill="none" stroke={scoreColor} strokeWidth="6"
                              strokeDasharray={`${(overallScore/100)*CIRC*0.75} ${CIRC-(overallScore/100)*CIRC*0.75+CIRC*0.25}`}
                              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.9s ease' }} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black" style={{ color: scoreColor }}>{overallScore}</span>
                            <span className="text-[9px]" style={{ color: 'var(--text-low)' }}>总分</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: scoreColor }}>{ai.overallLevel}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <ScoreArc score={ai.proteinScore} color="var(--accent)" label="蛋白质" />
                        <ScoreArc score={ai.carbsScore}   color="var(--accent)" label="碳水" />
                        <ScoreArc score={ai.hydrationScore} color="var(--accent)" label="补水" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: '蛋白质', score: ai.proteinScore,   desc: ai.proteinDesc,   color: 'var(--accent)' },
                        { label: '碳水',   score: ai.carbsScore,     desc: ai.carbsDesc,     color: 'var(--accent)' },
                        { label: '补水',   score: ai.hydrationScore, desc: ai.hydrationDesc, color: 'var(--accent)' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                          <span className="text-xs font-bold w-14 flex-shrink-0" style={{ color: s.color }}>{s.label} {s.score}</span>
                          <span className="text-xs" style={{ color: 'var(--text-med)' }}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                    {recentWorkout && (
                      <div className="mb-4 rounded-xl px-3 py-2.5 text-xs" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
                        <span className="font-bold mr-1">结合训练</span>{recentWorkout}
                      </div>
                    )}
                    <div className="px-4 py-3 rounded-xl text-sm font-medium mb-5" style={{
                      background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)', color: 'var(--accent)'
                    }}>
                      {ai.overallAssessment}
                    </div>
                    {ai.gaps.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>⚡ 缺口补充方案</span>
                        {ai.gaps.map((g, i) => <AiGapCard key={i} gap={g} />)}
                      </div>
                    ) : (
                      <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <div className="text-2xl mb-1">🎉</div>
                        <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>今日三大营养素均已达标！</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-low)' }}>继续保持，训练恢复效果最佳</p>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            )}

            {/* ══ 周报告 Tab ══ */}
            {aiTab === 'weekly' && (
              <>
                {/* 趋势图 */}
                {loading ? (
                  <SkeletonChart className="mb-4" />
                ) : weeklyDays.length > 0 ? (
                  <div className="mb-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--text-low)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-low)' }}>本周趋势</span>
                    </div>
                    <WeeklyTrendsCharts days={weeklyDays} />
                  </div>
                ) : null}

                {/* 分割线 */}
                {weeklyDays.length > 0 && <div className="mb-4" style={{ height: 1, background: 'var(--border)' }} />}

                {/* AI 周报内容 */}
                {weeklyReportLoading && !weeklyReport ? (
                  <div className="space-y-3">
                    <div className="h-3.5 rounded-full animate-pulse" style={{ background: 'var(--surface-3)' }} />
                    <div className="h-3.5 rounded-full animate-pulse w-5/6" style={{ background: 'var(--surface-3)' }} />
                    <div className="h-3.5 rounded-full animate-pulse w-4/6" style={{ background: 'var(--surface-3)' }} />
                    <div className="h-3.5 rounded-full animate-pulse w-3/6" style={{ background: 'var(--surface-3)' }} />
                  </div>
                ) : weeklyReport ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{weeklyReport.title}</span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-med)' }}>{weeklyReport.summary}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {weeklyReport.highlightDay && (
                        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <div className="text-[10px] text-emerald-500 font-bold mb-0.5">表现最佳</div>
                          <div className="text-xs text-secondary-foreground">{weeklyReport.highlightDay}</div>
                        </div>
                      )}
                      {weeklyReport.weakDay && (
                        <div className="rounded-xl p-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <div className="text-[10px] text-orange-500 font-bold mb-0.5">需关注</div>
                          <div className="text-xs text-secondary-foreground">{weeklyReport.weakDay}</div>
                        </div>
                      )}
                    </div>
                    {weeklyReport.nextWeekTip && (
                      <div className="rounded-xl p-3" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                          <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>下周建议</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--accent)' }}>{weeklyReport.nextWeekTip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-xs mb-4" style={{ color: 'var(--text-low)' }}>
                      基于最近 7 天摄入数据，AI 生成饮食趋势总结与下周建议
                    </p>
                    <button onClick={fetchWeeklyReport}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold active:scale-[0.98]"
                      style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                      <FileText className="w-4 h-4" />生成 AI 周报
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>

      <BottomTabBar active="diet" />
    </div>
  )
}
