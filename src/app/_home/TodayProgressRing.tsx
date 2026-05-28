"use client"

import { useTheme } from "@/contexts/ThemeContext"

interface Props {
  weeklyWorkouts: number
  todayDone: boolean
  currentStreak: number
}

/** Compact circular progress for weekly goal.
 *  Fixed size, no skeleton, no layout shift.
 */
export default function TodayProgressRing({ weeklyWorkouts, todayDone, currentStreak }: Props) {
  const { t } = useTheme()
  const goal = 5
  const pct = Math.min(100, Math.round((weeklyWorkouts / goal) * 100))
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: t.surface2, border: `1px solid ${t.border}` }}
    >
      <div className="relative w-[52px] h-[52px] shrink-0">
        <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={t.border}
            strokeWidth="5"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={todayDone ? "#22c55e" : t.accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color: t.text }}>
            {weeklyWorkouts}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold leading-tight" style={{ color: t.text }}>
          {todayDone ? "今日已完成" : "本周进度"}
        </div>
        <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>
          {currentStreak > 0 ? `${currentStreak} 天连续 · ` : ""}
          {weeklyWorkouts}/{goal} 次
        </div>
      </div>
    </div>
  )
}
