"use client"

import TodayProgressRing from "./TodayProgressRing"
import RecoveryStatus from "./RecoveryStatus"
import type { ProgressData, RecoveryData } from "@/lib/dashboard-bootstrap"

interface Props {
  progress: ProgressData
  recovery: RecoveryData
}

/** Secondary metrics row.
 *  Fixed height containers — no CLS, no skeleton, no flash.
 *  Subtle fade-in animation on mount.
 */
export default function HeroMetricsRow({ progress, recovery }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4 opacity-0 animate-[fadeIn_0.5s_ease_0.1s_forwards]">
      <TodayProgressRing
        weeklyWorkouts={progress.weeklyWorkouts}
        todayDone={progress.todayDone}
        currentStreak={progress.currentStreak}
      />
      <RecoveryStatus data={recovery} />
    </div>
  )
}
