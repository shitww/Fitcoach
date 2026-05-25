'use client'

import { Flame } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface StreakSnapshot {
  currentStreak: number
  todayDone: boolean
  longestStreak: number
  totalWorkouts: number
  last14Days: { date: string; done: boolean }[]
}

interface Props {
  data: StreakSnapshot | null
  loading?: boolean
}

export default function StreakCard({ data, loading }: Props) {
  const { t } = useTheme()

  if (loading || !data) {
    return (
      <div className="rounded-2xl p-4 mb-5 animate-pulse" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-8 w-28 rounded-lg" style={{ background: t.surface2 }} />
          <div className="h-6 w-20 rounded-full" style={{ background: t.surface2 }} />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: t.surface2 }} />
          ))}
        </div>
      </div>
    )
  }

  const { currentStreak, todayDone, longestStreak, totalWorkouts, last14Days } = data

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Flame
            className="w-5 h-5 shrink-0"
            style={{ color: currentStreak > 0 ? '#FF6B35' : t.textFaint }}
          />
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color: currentStreak > 0 ? '#FF6B35' : t.textMuted }}
            >
              {currentStreak}
            </span>
            <span className="text-sm font-semibold" style={{ color: t.textMuted }}>天连续</span>
          </div>
        </div>

        {todayDone ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-bold text-green-400">今日完成</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: t.surface2 }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textFaint }} />
            <span className="text-xs" style={{ color: t.textFaint }}>今日待训练</span>
          </div>
        )}
      </div>

      {/* 14-day activity bars */}
      <div className="flex gap-1 mb-2">
        {last14Days.map((day, i) => {
          const isToday = i === last14Days.length - 1
          return (
            <div
              key={day.date}
              className="flex-1 rounded-full transition-all duration-500"
              style={{
                height: '6px',
                background: day.done
                  ? isToday
                    ? '#22c55e'
                    : t.accent
                  : t.surface3,
                opacity: day.done ? 1 : 0.4,
              }}
            />
          )
        })}
      </div>

      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color: t.textFaint }}>14天前</span>
        <span className="text-[10px]" style={{ color: t.textFaint }}>
          最佳 {longestStreak}天 · 共{totalWorkouts}次
        </span>
        <span className="text-[10px]" style={{ color: t.textFaint }}>今天</span>
      </div>
    </div>
  )
}
