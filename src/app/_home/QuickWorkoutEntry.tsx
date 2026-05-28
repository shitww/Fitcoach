"use client"

import Link from "next/link"
import { Play, CheckCircle, Moon, ChevronRight, Dumbbell } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useWorkoutTimer } from "@/stores/workoutTimer"
import type { QuickEntryData } from "@/lib/dashboard-bootstrap"

interface Props {
  data: QuickEntryData
}

const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  READY_TO_TRAIN: { label: "状态良好", dot: "#CCFF00", bg: "rgba(204,255,0,0.1)", text: "#CCFF00" },
  FATIGUED:       { label: "注意疲劳", dot: "#F59E0B", bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
  RECOVERED:      { label: "充分恢复", dot: "#22c55e", bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
  REST_DAY:       { label: "今日休息", dot: "#60A5FA", bg: "rgba(96,165,250,0.1)", text: "#60A5FA" },
}

export default function QuickWorkoutEntry({ data }: Props) {
  const { t } = useTheme()
  const { isTrainingActive, isPaused, currentExercise } = useWorkoutTimer()
  const hasActiveSession = isTrainingActive || isPaused

  const meta = STATUS_META[data.userStatus]

  // ── State: Active session ────────────────────────────────────────────────
  if (hasActiveSession) {
    return (
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: t.surface,
          border: `1px solid ${t.borderAccent}`,
          boxShadow: `0 0 28px ${t.accentDim}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>
              训练中
            </span>
          </div>
          {meta && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: meta.bg, color: meta.dot }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
              {meta.label}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-base font-bold leading-snug mb-0.5" style={{ color: t.text }}>
            {currentExercise || "继续当前训练"}
          </h3>
          <p className="text-xs" style={{ color: t.textFaint }}>
            {data.coachInsight || "点击继续完成今日训练目标"}
          </p>
        </div>

        <Link
          href="/workout"
          className="block w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
            color: t.accentText,
            boxShadow: `0 0 20px ${t.accentGlow}`,
          }}
        >
          <Play className="w-4 h-4" />
          继续训练
        </Link>
      </div>
    )
  }

  // ── State: Already worked out today ────────────────────────────────────────
  if (data.todayDone) {
    return (
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: t.surface, border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-green-400">今日训练完成</div>
            <div className="text-xs mt-0.5" style={{ color: t.textFaint }}>
              {data.coachInsight || `${data.dayLabel} · 太棒了，继续保持！`}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/history"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all active:scale-95"
            style={{
              background: "rgba(34,197,94,0.1)",
              color: "#22c55e",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            查看记录
          </Link>
          <Link
            href="/workout"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            追加训练 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  // ── State: Has plan with today's exercises ─────────────────────────────────
  if (data.hasTodayExercises && data.todayPlanDay) {
    return (
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: t.surface,
          border: `1px solid ${t.borderAccent}`,
          boxShadow: `0 0 28px ${t.accentDim}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>
              今日训练
            </span>
          </div>
          {meta ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: meta.bg, color: meta.dot }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
              {meta.label}
            </div>
          ) : (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.surface2, color: t.textMuted }}
            >
              {data.dayLabel}
            </span>
          )}
        </div>

        <div className="mb-3">
          <h3 className="text-base font-bold leading-snug mb-0.5" style={{ color: t.text }}>
            {data.todayPlanDay.dayName || `${data.dayLabel}训练`}
          </h3>
          {data.activePlan && (
            <p className="text-xs" style={{ color: t.textFaint }}>
              {data.activePlan.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.todayPlanDay.exercises.slice(0, 5).map((ex, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: t.surface2, color: t.textSec }}
            >
              {ex}
            </span>
          ))}
          {data.todayPlanDay.exercises.length > 5 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: t.surface2, color: t.textFaint }}
            >
              +{data.todayPlanDay.exercises.length - 5}
            </span>
          )}
        </div>

        {data.coachInsight && (
          <p className="text-xs mb-4 leading-relaxed" style={{ color: t.textMuted }}>
            {data.coachInsight}
          </p>
        )}

        <Link
          href={`/workout?plan=${data.activePlan!.id}&day=${new Date().getDay() === 0 ? 6 : new Date().getDay() - 1}`}
          className="block w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
            color: t.accentText,
            boxShadow: `0 0 20px ${t.accentGlow}`,
          }}
        >
          <Play className="w-4 h-4" />
          立即开始
        </Link>
      </div>
    )
  }

  // ── State: Rest day ──────────────────────────────────────────────────────
  if (data.isRestDay) {
    return (
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: t.surface, border: `1px solid ${t.border}` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: t.surface2 }}
          >
            <Moon className="w-5 h-5" style={{ color: t.textMuted }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: t.text }}>
              今日休息日
            </div>
            {data.activePlan && (
              <div className="text-xs mt-0.5" style={{ color: t.textFaint }}>
                {data.activePlan.name} · {data.dayLabel}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: t.textMuted }}>
          充分休息，为下次训练蓄力。可以做轻度拉伸或有氧放松。
        </p>
        <div className="flex gap-2">
          <Link
            href="/workout"
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            轻度训练
          </Link>
          <Link
            href="/plans"
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center transition-all active:scale-95"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            查看全周计划
          </Link>
        </div>
      </div>
    )
  }

  // ── State: No plan ───────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: t.surface,
        border: `1px solid ${t.borderAccent}`,
        boxShadow: `0 0 28px ${t.accentDim}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>
            今日训练
          </span>
        </div>
        {meta ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: meta.bg, color: meta.dot }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
            {meta.label}
          </div>
        ) : (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: t.surface2, color: t.textMuted }}
          >
            {data.dayLabel}
          </span>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-base font-bold leading-snug mb-0.5" style={{ color: t.text }}>
          自由训练
        </h3>
        <p className="text-xs" style={{ color: t.textFaint }}>
          {data.coachInsight || "准备好，开始今天的训练吧"}
        </p>
      </div>

      <Link
        href="/workout"
        className="block w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
          color: t.accentText,
          boxShadow: `0 0 20px ${t.accentGlow}`,
        }}
      >
        <Dumbbell className="w-4 h-4" />
        开始训练
      </Link>
    </div>
  )
}
