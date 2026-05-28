"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { useCachedFetch } from "@/lib/client-cache"
import type { RecentExercise } from "@/lib/dashboard-bootstrap"

interface Props {
  initial: RecentExercise[]
  userId: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "今天"
  if (diff === 1) return "昨天"
  return `${diff}天前`
}

export default function RecentExercisesStrip({ initial }: Props) {
  const { t } = useTheme()
  const { data } = useCachedFetch<RecentExercise[]>(
    "/api/dashboard/recent-exercises",
    { credentials: "include" },
    120_000
  )

  // Stale-while-revalidate: prefer cached data if available, otherwise SSR initial
  const exercises: RecentExercise[] = data ?? initial

  if (exercises.length === 0) {
    return (
      <div className="mb-4 opacity-0 animate-[fadeIn_0.5s_ease_0.2s_forwards]">
        <div className="text-xs font-bold tracking-wider mb-2" style={{ color: t.textMuted }}>
          最近训练
        </div>
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: t.surface2, color: t.textFaint }}
        >
          暂无近期训练记录
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 opacity-0 animate-[fadeIn_0.5s_ease_0.2s_forwards]">
      <div className="text-xs font-bold tracking-wider mb-2" style={{ color: t.textMuted }}>
        最近训练
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {exercises.map((ex, i) => (
          <div
            key={`${ex.name}-${i}`}
            className="shrink-0 rounded-xl px-3 py-2 flex flex-col gap-0.5"
            style={{ background: t.surface2, border: `1px solid ${t.border}`, minWidth: "120px" }}
          >
            <span className="text-xs font-semibold truncate" style={{ color: t.text }}>
              {ex.name}
            </span>
            <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>
              {ex.weight}kg × {ex.reps}
            </span>
            <span className="text-[10px]" style={{ color: t.textFaint }}>
              {formatDate(ex.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
