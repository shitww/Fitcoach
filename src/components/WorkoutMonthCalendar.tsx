"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────
export interface WorkoutDayInfo {
  workoutId?: string
  duration?: number      // seconds
  totalVolume?: number   // grams
  muscleGroups?: string[]
  isCardio?: boolean
  exercises?: string[]
}

interface Props {
  /** key = "YYYY-MM-DD" */
  dayMap: Map<string, WorkoutDayInfo>
  /** Optional: override starting year (default: current) */
  initialYear?: number
  /** Optional: override starting month 1-12 (default: current) */
  initialMonth?: number
}

// ── Constants ──────────────────────────────────────────────────────────────
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"]

const MUSCLE_COLOR: Record<string, string> = {
  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399",
  shoulders: "#FBBF24", arms: "#F87171",
}
const MUSCLE_LABEL: Record<string, string> = {
  chest: "胸", back: "背", legs: "腿", shoulders: "肩", arms: "臂",
}
const CARDIO_COLOR = "#FB923C"

const LEGEND: [string, string][] = [
  [CARDIO_COLOR, "有氧"],
  ["#60A5FA", "胸"], ["#A78BFA", "背"], ["#34D399", "腿"],
  ["#FBBF24", "肩"], ["#F87171", "臂"],
]

function pad2(n: number) { return String(n).padStart(2, "0") }
function mkDateStr(y: number, m: number, d: number) { return `${y}-${pad2(m)}-${pad2(d)}` }

// ── Component ──────────────────────────────────────────────────────────────
export function WorkoutMonthCalendar({ dayMap, initialYear, initialMonth }: Props) {
  const now = new Date()
  const [year, setYear] = useState(initialYear ?? now.getFullYear())
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1)
  const [selected, setSelected] = useState<string | null>(null)

  const todayStr = mkDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const isAtPresent = year === now.getFullYear() && month === now.getMonth() + 1

  const prevMonth = () => {
    setSelected(null)
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (isAtPresent) return
    setSelected(null)
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
  }

  // Build grid (Monday-start)
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  let offset = firstDay.getDay() - 1; if (offset < 0) offset = 6
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthPrefix = `${year}-${pad2(month)}`
  const monthCount = [...dayMap.keys()].filter(k => k.startsWith(monthPrefix)).length

  const selInfo = selected ? dayMap.get(selected) : undefined

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--surface-2)" }}>
          <ChevronLeft className="w-3.5 h-3.5" style={{ color: "var(--text-med)" }} />
        </button>

        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black">{year}年{month}月</span>
          {monthCount > 0 && (
            <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{monthCount}次训练</span>
          )}
        </div>

        <button onClick={nextMonth} disabled={isAtPresent}
          className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: isAtPresent ? "transparent" : "var(--surface-2)", opacity: isAtPresent ? 0.25 : 1 }}>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-med)" }} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-1 pt-2">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className="text-center pb-1"
            style={{ fontSize: 10, fontWeight: 500, color: i >= 5 ? "var(--text-faint)" : "var(--text-low)" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-1 pb-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="py-1" />
          const ds = mkDateStr(year, month, day)
          const dd = dayMap.get(ds)
          const isToday = ds === todayStr
          const isFuture = ds > todayStr
          const isSel = selected === ds

          const dots: string[] = []
          if (dd) {
            if (dd.isCardio) dots.push(CARDIO_COLOR)
            dd.muscleGroups?.slice(0, 2).forEach(mg => dots.push(MUSCLE_COLOR[mg] || "#888"))
          }

          return (
            <button key={ds}
              onClick={() => { if (!isFuture) setSelected(p => p === ds ? null : ds) }}
              disabled={isFuture}
              className="flex flex-col items-center gap-0.5 py-1 transition-all active:scale-90"
              style={{ opacity: isFuture ? 0.3 : 1 }}>

              {/* Circle */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: isToday ? "var(--accent)" : isSel ? "var(--accent-dim)" : dd ? "var(--surface-2)" : "transparent",
                  border: isSel && !isToday ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: isToday || !!dd ? 700 : 400,
                  lineHeight: 1,
                  color: isToday ? "var(--accent-text)" : isSel ? "var(--accent)" : !!dd ? "var(--foreground)" : "var(--text-low)",
                }}>
                  {day}
                </span>
              </div>

              {/* Dots */}
              <div className="flex gap-0.5 items-center" style={{ height: 6 }}>
                {dots.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: c }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-3 pb-2.5">
        {LEGEND.map(([c, l]) => (
          <div key={l} className="flex items-center gap-1" style={{ fontSize: 10, color: "var(--text-faint)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, flexShrink: 0 }} />
            {l}
          </div>
        ))}
      </div>

      {/* Selected day inline detail */}
      {selected && (
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-xs font-bold">
              {new Date(selected + "T12:00:00").toLocaleDateString("zh-CN", {
                month: "long", day: "numeric", weekday: "short",
              })}
            </span>
            <button onClick={() => setSelected(null)}
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface-3)" }}>
              <X className="w-2.5 h-2.5" style={{ color: "var(--text-low)" }} />
            </button>
          </div>

          {selInfo ? (
            <>
              <div className="flex items-center gap-2 mb-1.5" style={{ fontSize: 11, color: "var(--text-low)" }}>
                {selInfo.duration != null && selInfo.duration > 0 && (
                  <span>{Math.round(selInfo.duration / 60)}分钟</span>
                )}
                {(selInfo.totalVolume ?? 0) > 0 && (
                  <span>· {((selInfo.totalVolume ?? 0) / 1000).toFixed(1)}t</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-1.5">
                {selInfo.isCardio && (
                  <span className="px-2 py-0.5 rounded-full font-semibold"
                    style={{ fontSize: 10, background: "rgba(251,146,60,0.15)", color: CARDIO_COLOR }}>
                    有氧
                  </span>
                )}
                {selInfo.muscleGroups?.map(mg => (
                  <span key={mg} className="px-2 py-0.5 rounded-full font-semibold"
                    style={{ fontSize: 10, background: MUSCLE_COLOR[mg] + "22", color: MUSCLE_COLOR[mg] }}>
                    {MUSCLE_LABEL[mg]}
                  </span>
                ))}
              </div>

              {selInfo.exercises && selInfo.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selInfo.exercises.slice(0, 5).map(ex => (
                    <span key={ex} className="px-1.5 py-0.5 rounded"
                      style={{ fontSize: 10, background: "var(--surface-3)", color: "var(--text-med)" }}>
                      {ex}
                    </span>
                  ))}
                  {selInfo.exercises.length > 5 && (
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                      +{selInfo.exercises.length - 5}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 11, color: "var(--text-faint)" }}>休息日</p>
          )}
        </div>
      )}
    </div>
  )
}
