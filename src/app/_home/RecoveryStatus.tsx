"use client"

import { Activity } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import type { RecoveryData } from "@/lib/dashboard-bootstrap"

interface Props {
  data: RecoveryData
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  READY_TO_TRAIN: { label: "状态良好", color: "#CCFF00", bg: "rgba(204,255,0,0.12)" },
  FATIGUED:       { label: "注意疲劳", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  RECOVERED:      { label: "充分恢复", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  REST_DAY:       { label: "今日休息", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
}

export default function RecoveryStatus({ data }: Props) {
  const { t } = useTheme()
  const meta = STATUS_META[data.userStatus] ?? STATUS_META.READY_TO_TRAIN

  const fatigueLabel =
    data.fatigueLevel === "high" ? "疲劳度高"
      : data.fatigueLevel === "medium" ? "轻度疲劳"
      : "状态轻松"

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: t.surface2, border: `1px solid ${t.border}` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: meta.bg }}
      >
        <Activity className="w-4 h-4" style={{ color: meta.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold leading-tight" style={{ color: t.text }}>
            {meta.label}
          </span>
        </div>
        <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: t.textMuted }}>
          <span>{fatigueLabel}</span>
          {data.daysSinceLastWorkout < 999 && (
            <>
              <span style={{ color: t.textFaint }}>·</span>
              <span>
                {data.daysSinceLastWorkout === 0
                  ? "今天练过"
                  : `${data.daysSinceLastWorkout} 天未练`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
