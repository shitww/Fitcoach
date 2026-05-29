"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { calculateAdaptiveStreak } from "@/lib/emotional-runtime/streak/calculateAdaptiveStreak"
import { generateConsistencyScore } from "@/lib/emotional-runtime/streak/generateConsistencyScore"
import type { ProgressData, RecoveryData } from "@/lib/dashboard-bootstrap"

interface Props {
  progress: ProgressData
  recovery: RecoveryData
}

/** Consistency Rhythm Card — replaces the punishment-streak model.
 *  Shows flexible 14-day consistency, not consecutive-day streak.
 *  Non-punishing. Rest days are valued.
 */
export default function ConsistencyRhythmCard({ progress, recovery }: Props) {
  const streak = calculateAdaptiveStreak(progress, recovery)
  const consistency = generateConsistencyScore(progress)
  const todayDone = progress.todayDone
  const { t } = useTheme()
  const gradeColor = {
    excellent: '#22c55e',
    good:      '#CCFF00',
    building:  '#94a3b8',
    returning: '#60A5FA',
  }[consistency.grade]

  const trendArrow = {
    improving: '↑',
    stable:    '→',
    declining: '↓',
  }[consistency.trend]

  // Bar fill per day
  const barColor = (done: boolean, isToday: boolean) => {
    if (done && isToday) return '#22c55e'
    if (done) return t.accent
    return t.surface3
  }

  return (
    <div
      className="rounded-2xl p-4 mb-5 opacity-0 animate-[fadeIn_0.5s_ease_0.05s_forwards]"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-2xl font-black tabular-nums leading-none"
            style={{ color: gradeColor }}
          >
            {streak.flexibleConsistency}
          </span>
          <span className="text-sm font-semibold" style={{ color: t.textMuted }}>
            / {streak.flexibleWindow} 天
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={
            todayDone
              ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }
              : { background: t.surface2 }
          }
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: todayDone ? '#22c55e' : t.textFaint }}
          />
          <span
            className="text-xs font-bold"
            style={{ color: todayDone ? '#22c55e' : t.textFaint }}
          >
            {todayDone ? '今日完成' : '今日待训练'}
          </span>
        </div>
      </div>

      {/* 14-day activity bars */}
      <div className="flex gap-1 mb-2.5">
        {progress.last14Days.map((day, i) => {
          const isToday = i === progress.last14Days.length - 1
          return (
            <div
              key={day.date}
              className="flex-1 rounded-full transition-all duration-500"
              style={{
                height: '6px',
                background: barColor(day.done, isToday),
                opacity: day.done ? 1 : 0.3,
              }}
            />
          )
        })}
      </div>

      {/* Bottom line */}
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: t.textFaint }}>
          {streak.onTrackMessage}
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{ color: gradeColor }}
        >
          {trendArrow} {consistency.label}
        </span>
      </div>
    </div>
  )
}
