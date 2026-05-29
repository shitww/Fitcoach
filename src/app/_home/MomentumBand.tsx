"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { buildMomentumSurface } from "@/lib/emotional-runtime/momentum/buildMomentumSurface"
import type { ProgressData, RecoveryData } from "@/lib/dashboard-bootstrap"

interface Props {
  progress: ProgressData
  recovery: RecoveryData
}

/** Momentum Band — the emotional intelligence strip on the home hero.
 *  Subtle, premium, non-intrusive. One line of meaningful insight.
 *  Only renders when there is something meaningful to show.
 */
export default function MomentumBand({ progress, recovery }: Props) {
  const { t } = useTheme()
  const { momentum, badge } = buildMomentumSurface(progress, recovery)

  // Don't show for brand-new users with no data
  if (momentum.twoWeekFrequency === 0 && momentum.phase !== 're_entry') return null

  return (
    <div
      className="rounded-xl px-3.5 py-2.5 mb-3 flex items-center gap-2.5 opacity-0 animate-[fadeIn_0.4s_ease_0.15s_forwards]"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      {/* Phase indicator dot */}
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: badge?.color ?? t.textMuted }}
      />

      {/* Main insight text */}
      <div className="flex-1 min-w-0">
        <span
          className="text-xs leading-snug"
          style={{ color: t.textSec }}
        >
          {momentum.headline}
        </span>
        {momentum.insightLine && (
          <span
            className="text-xs ml-1.5"
            style={{ color: t.textFaint }}
          >
            · {momentum.insightLine}
          </span>
        )}
      </div>

      {/* Badge — only when meaningful */}
      {badge && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      )}
    </div>
  )
}
