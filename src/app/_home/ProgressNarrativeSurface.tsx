"use client"

import { useTheme } from "@/contexts/ThemeContext"
import type { ProgressNarrative, StrengthTrend } from "@/types/emotional-runtime"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Props {
  narrative: ProgressNarrative
}

/** Progress Narrative Surface — long-term growth story.
 *  Trend + explanation, not raw data tables.
 *  For home or profile page.
 */
export default function ProgressNarrativeSurface({ narrative }: Props) {
  const { t } = useTheme()

  const headlineColor = narrative.tone === 'positive' ? '#22c55e' :
                        narrative.tone === 'analytical' ? t.textSec : t.text

  return (
    <div
      className="rounded-2xl p-4 mb-4 opacity-0 animate-[fadeIn_0.5s_ease_0.1s_forwards]"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      {/* Section label */}
      <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: t.textFaint }}>
        过去 {narrative.periodWeeks} 周成长
      </div>

      {/* Headline */}
      <p className="text-sm font-semibold mb-3 leading-snug" style={{ color: headlineColor }}>
        {narrative.headline}
      </p>

      {/* Story lines */}
      {narrative.storyLines.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {narrative.storyLines.map((line, i) => (
            <p key={i} className="text-xs leading-relaxed" style={{ color: t.textSec }}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Strength trends */}
      {narrative.strengthTrends.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {narrative.strengthTrends.slice(0, 2).map((trend) => (
            <StrengthTrendRow key={trend.exerciseName} trend={trend} t={t} />
          ))}
        </div>
      )}

      {/* Recovery note */}
      {narrative.recoveryImprovement && (
        <div
          className="rounded-lg px-3 py-2 mt-2"
          style={{ background: t.surface2 }}
        >
          <p className="text-[11px]" style={{ color: t.textFaint }}>
            {narrative.recoveryImprovement}
          </p>
        </div>
      )}
    </div>
  )
}

function StrengthTrendRow({
  trend,
  t,
}: {
  trend: StrengthTrend
  t: ReturnType<typeof useTheme>['t']
}) {
  const Icon =
    trend.trend === 'up' ? TrendingUp :
    trend.trend === 'down' ? TrendingDown :
    Minus

  const color =
    trend.trend === 'up' ? '#22c55e' :
    trend.trend === 'down' ? '#F59E0B' :
    t.textMuted

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="text-xs flex-1" style={{ color: t.textSec }}>
        {trend.exerciseName}
      </span>
      <span className="text-xs font-medium tabular-nums" style={{ color }}>
        {trend.trend === 'up' && '+'}
        {trend.deltaKg !== 0 ? `${trend.deltaKg}kg` : trend.trendLabel}
      </span>
    </div>
  )
}
