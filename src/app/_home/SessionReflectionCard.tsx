"use client"

import { useTheme } from "@/contexts/ThemeContext"
import type { SessionSummary } from "@/types/emotional-runtime"

interface Props {
  summary: SessionSummary
  onDismiss?: () => void
}

/** Session Reflection Card — shown after workout completion.
 *  Calm, analytical. No hype. Shows: strength trend, fatigue, recovery estimate.
 */
export default function SessionReflectionCard({ summary, onDismiss }: Props) {
  const { t } = useTheme()

  return (
    <div
      className="rounded-2xl p-4 mb-4 opacity-0 animate-[fadeIn_0.5s_ease_forwards]"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
      }}
    >
      {/* Header label */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold tracking-wider uppercase"
          style={{ color: t.textFaint }}
        >
          训练小结
        </span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[10px] px-2 py-0.5 rounded-full transition-opacity active:opacity-60"
            style={{ color: t.textFaint, background: t.surface2 }}
          >
            关闭
          </button>
        )}
      </div>

      {/* Headline */}
      <p className="text-sm font-semibold mb-2 leading-snug" style={{ color: t.text }}>
        {summary.headline}
      </p>

      {/* Bullet lines */}
      {summary.bullets.length > 0 && (
        <div className="space-y-1 mb-3">
          {summary.bullets.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="mt-1 w-1 h-1 rounded-full shrink-0"
                style={{ background: t.textMuted }}
              />
              <span className="text-xs leading-relaxed" style={{ color: t.textSec }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px mb-3" style={{ background: t.border }} />

      {/* Recovery estimate */}
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: t.textFaint }}>
          {summary.recoveryLine}
        </span>
        {summary.progressLine && (
          <span
            className="text-[11px] font-medium"
            style={{ color: t.accent }}
          >
            {summary.progressLine}
          </span>
        )}
      </div>
    </div>
  )
}
