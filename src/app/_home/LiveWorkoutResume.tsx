"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Play, Timer, Dumbbell } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useWorkoutTimer, selectTrainingSeconds } from "@/stores/workoutTimer"

/** Client island: only renders when a live session exists.
 *  Uses mounted-guard to avoid hydration mismatch.
 *  Isolated state — does NOT trigger parent rerenders.
 */
export default function LiveWorkoutResume() {
  const { t } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Subscribe to minimal slice to keep re-renders cheap
  const phase = useWorkoutTimer((s) => s.sessionPhase)
  const totalSets = useWorkoutTimer((s) => s.totalSets)
  const currentExercise = useWorkoutTimer((s) => s.currentExercise)
  const seconds = useWorkoutTimer(selectTrainingSeconds)

  const isLive = phase === "active" || phase === "paused"

  // Prevent hydration mismatch: never render on server / initial client paint
  if (!mounted || !isLive) return null

  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const ss = (seconds % 60).toString().padStart(2, "0")

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{
        background: t.surface,
        border: `1px solid ${t.borderAccent}`,
        boxShadow: `0 0 20px ${t.accentDim}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: t.accent }}>
            训练中
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono" style={{ color: t.textMuted }}>
          <Timer className="w-3 h-3" />
          {mm}:{ss}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: t.surface2 }}
        >
          <Dumbbell className="w-4 h-4" style={{ color: t.accent }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: t.text }}>
            {currentExercise || "自由训练"}
          </div>
          <div className="text-xs" style={{ color: t.textMuted }}>
            已完成 {totalSets} 组
          </div>
        </div>
      </div>

      <Link
        href="/workout"
        className="block w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
          color: t.accentText,
          boxShadow: `0 0 16px ${t.accentGlow}`,
        }}
      >
        <Play className="w-4 h-4" />
        继续训练
      </Link>
    </div>
  )
}
