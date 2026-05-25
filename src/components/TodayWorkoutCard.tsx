'use client'

import dynamic from 'next/dynamic'
import { Play, CheckCircle, Moon, ChevronRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useWorkoutTimer } from '@/stores/workoutTimer'
import type { UserStatus } from '@/app/api/dashboard/status/route'

const SmartWorkoutSuggestion = dynamic(
  () => import('@/components/ai-coaching/SmartWorkoutSuggestion').then(m => ({ default: m.SmartWorkoutSuggestion })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
    ),
  }
)

interface PlanDay {
  dayName: string
  exercises: string
}

interface Plan {
  id: string
  name: string
  days: PlanDay[]
}

interface Props {
  plans: Plan[]
  loading: boolean
  todayDone: boolean
  userStatus?: UserStatus
  coachInsight?: string
}

const DOW_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function safeParseExercises(raw: string): string[] {
  try {
    return JSON.parse(raw || '[]')
  } catch {
    return []
  }
}

const STATUS_META: Record<UserStatus, { label: string; dot: string; bg: string }> = {
  READY_TO_TRAIN: { label: '状态良好', dot: '#CCFF00', bg: 'rgba(204,255,0,0.1)' },
  FATIGUED:       { label: '注意疲劳', dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  RECOVERED:      { label: '充分恢复', dot: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  REST_DAY:       { label: '今日休息', dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
}

export default function TodayWorkoutCard({ plans, loading, todayDone, userStatus, coachInsight }: Props) {
  const router = useRouter()
  const { t } = useTheme()
  const { isTrainingActive, isPaused } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused

  const todayDow = new Date().getDay()
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1
  const dayLabel = DOW_LABELS[todayDow]

  const activePlan = plans[0] ?? null
  const todayPlanDay = activePlan?.days?.[todayIdx] ?? null
  const todayExercises = todayPlanDay ? safeParseExercises(todayPlanDay.exercises) : []
  const hasTodayExercises = todayExercises.length > 0
  const isRestDay = !!activePlan && !hasTodayExercises

  const meta = userStatus ? STATUS_META[userStatus] : null

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl p-5 mb-5 animate-pulse" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 rounded" style={{ background: t.surface2 }} />
          <div className="h-5 w-14 rounded-full" style={{ background: t.surface2 }} />
        </div>
        <div className="h-5 w-40 rounded mb-1" style={{ background: t.surface2 }} />
        <div className="h-3 w-28 rounded mb-4" style={{ background: t.surface3 }} />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-7 w-20 rounded-full" style={{ background: t.surface2 }} />
          ))}
        </div>
        <div className="h-12 w-full rounded-xl" style={{ background: t.surface2 }} />
      </div>
    )
  }

  // ── State 1: Already worked out today ────────────────────────────────────
  if (todayDone) {
    return (
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: t.surface, border: '1px solid rgba(34,197,94,0.25)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)' }}
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-green-400">今日训练完成 ✓</div>
            <div className="text-xs mt-0.5" style={{ color: t.textFaint }}>
              {coachInsight || (dayLabel + ' · 太棒了，继续保持！')}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/history')}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            查看记录
          </button>
          <button
            onClick={() => router.push(hasActiveSession ? '/workout' : '/intent')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            {hasActiveSession ? '继续训练' : '追加训练'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── State 2: Has plan with today's exercises ──────────────────────────────
  if (hasTodayExercises) {
    return (
      <div
        className="rounded-2xl p-5 mb-5"
        style={{
          background: t.surface,
          border: `1px solid ${t.borderAccent}`,
          boxShadow: `0 0 28px ${t.accentDim}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>今日训练</span>
          </div>
          {meta ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: meta.bg, color: meta.dot }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
              {meta.label}
            </div>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.surface2, color: t.textMuted }}>{dayLabel}</span>
          )}
        </div>

        <div className="mb-3">
          <h3 className="text-base font-bold leading-snug mb-0.5" style={{ color: t.text }}>
            {todayPlanDay?.dayName || dayLabel + '训练'}
          </h3>
          <p className="text-xs" style={{ color: t.textFaint }}>{activePlan!.name}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {todayExercises.slice(0, 5).map((ex, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: t.surface2, color: t.textSec }}
            >
              {ex}
            </span>
          ))}
          {todayExercises.length > 5 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: t.surface2, color: t.textFaint }}
            >
              +{todayExercises.length - 5}
            </span>
          )}
        </div>

        {coachInsight && (
          <p className="text-xs mb-4 leading-relaxed" style={{ color: t.textMuted }}>
            {coachInsight}
          </p>
        )}

        <button
          onClick={() => router.push(`/workout?plan=${activePlan!.id}&day=${todayIdx}`)}
          className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
            color: t.accentText,
            boxShadow: `0 0 20px ${t.accentGlow}`,
          }}
        >
          <Play className="w-4 h-4" />
          {hasActiveSession ? '继续训练' : '立即开始'}
        </button>
      </div>
    )
  }

  // ── State 3: Rest day (plan exists, but today = rest) ────────────────────
  if (isRestDay) {
    return (
      <div className="rounded-2xl p-5 mb-5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: t.surface2 }}
          >
            <Moon className="w-5 h-5" style={{ color: t.textMuted }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: t.text }}>今日休息日</div>
            <div className="text-xs mt-0.5" style={{ color: t.textFaint }}>
              {activePlan!.name} · {dayLabel}
            </div>
          </div>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: t.textMuted }}>
          充分休息，为下次训练蓄力。可以做轻度拉伸或有氧放松。
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/intent')}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            轻度训练
          </button>
          <button
            onClick={() => router.push('/plans')}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            查看全周计划
          </button>
        </div>
      </div>
    )
  }

  // ── State 4: No plan — AI suggestion hero ────────────────────────────────
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: t.accent }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>AI 今日推荐</span>
        </div>
        {meta && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: meta.bg, color: meta.dot }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
            {meta.label}
          </div>
        )}
      </div>
      {coachInsight && (
        <p className="text-xs mb-3" style={{ color: t.textMuted }}>{coachInsight}</p>
      )}
      <SmartWorkoutSuggestion />
    </div>
  )
}
