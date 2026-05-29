'use client'

import { memo, useEffect } from 'react'
import { ArrowRight, TrendingUp, Clock, Zap } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface StrengthTrend {
  exerciseName: string
  deltaKg: number
  label: string
}

interface ChapterCompletionSurfaceProps {
  visible: boolean
  // Session stats
  durationSec: number
  totalVolume: number
  setCount: number
  exerciseNames: string[]
  // Emotional narrative
  sessionHeadline: string        // e.g. "今天胸部训练完成"
  reflectionLine: string         // e.g. "强度高于近期平均 12%"
  recoveryEstimate: string | null// e.g. "预计恢复：48–72 小时"
  strengthTrends: StrengthTrend[]
  nextRecommendation: string | null
  // Actions
  onDismiss: () => void
  onShare?: () => void
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} 分钟`
}

/** Chapter Completion Surface — replaces the metric-dump completion card.
 *  Calm, cinematic, reflective.
 *  No trophies. No confetti. Just honest narrative.
 */
const ChapterCompletionSurface = memo(function ChapterCompletionSurface({
  visible,
  durationSec,
  totalVolume,
  setCount,
  exerciseNames,
  sessionHeadline,
  reflectionLine,
  recoveryEstimate,
  strengthTrends,
  nextRecommendation,
  onDismiss,
  onShare,
}: ChapterCompletionSurfaceProps) {
  const { t } = useTheme()

  useEffect(() => {
    if (!visible) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center"
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(16px)',
        animation: 'rt-name-in 0.4s ease-out both',
      }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl overflow-y-auto"
        style={{
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderBottom: 'none',
          maxHeight: '92dvh',
          animation: 'rt-slide-up 0.45s cubic-bezier(0.34,1.2,0.64,1) both',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: t.border }} />
        </div>

        <div className="px-5 pb-8 pt-2">
          {/* ── Headline ── */}
          <div className="mb-6">
            <div
              className="text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: t.textFaint }}
            >
              训练完成
            </div>
            <h2
              className="text-2xl font-black leading-snug"
              style={{ color: t.text }}
            >
              {sessionHeadline}
            </h2>
            <p className="text-sm mt-1.5" style={{ color: t.textSec }}>
              {reflectionLine}
            </p>
          </div>

          {/* ── Compact stats row ── */}
          <div
            className="flex gap-3 mb-5 p-3 rounded-2xl"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3 h-3" style={{ color: t.textFaint }} />
                <span className="text-xs" style={{ color: t.textFaint }}>时长</span>
              </div>
              <div className="text-lg font-black" style={{ color: t.text }}>
                {formatDuration(durationSec)}
              </div>
            </div>
            <div className="w-px" style={{ background: t.border }} />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Zap className="w-3 h-3" style={{ color: t.textFaint }} />
                <span className="text-xs" style={{ color: t.textFaint }}>{setCount} 组</span>
              </div>
              <div className="text-lg font-black" style={{ color: t.text }}>
                {totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${totalVolume}kg`}
              </div>
            </div>
          </div>

          {/* ── Exercise chips ── */}
          {exerciseNames.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-1.5">
                {exerciseNames.map(name => (
                  <span
                    key={name}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{ background: t.surface2, color: t.textSec, border: `1px solid ${t.border}` }}
                  >
                    {name.split(' (')[0]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Strength trends ── */}
          {strengthTrends.length > 0 && (
            <div className="mb-5">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: t.textFaint }}
              >
                今日进展
              </div>
              <div className="space-y-2">
                {strengthTrends.slice(0, 3).map(trend => (
                  <div
                    key={trend.exerciseName}
                    className="flex items-center justify-between py-2 px-3 rounded-xl"
                    style={{ background: t.surface, border: `1px solid ${t.border}` }}
                  >
                    <span className="text-sm font-semibold" style={{ color: t.textSec }}>
                      {trend.exerciseName.split(' (')[0]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {trend.deltaKg > 0 && (
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                      )}
                      <span
                        className="text-xs font-bold"
                        style={{ color: trend.deltaKg > 0 ? '#22c55e' : t.textFaint }}
                      >
                        {trend.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recovery estimate ── */}
          {recoveryEstimate && (
            <div
              className="mb-5 px-3 py-3 rounded-xl"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <p className="text-xs" style={{ color: t.textSec }}>
                {recoveryEstimate}
              </p>
            </div>
          )}

          {/* ── Next recommendation ── */}
          {nextRecommendation && (
            <div
              className="mb-5 px-3 py-3 rounded-xl"
              style={{ background: 'rgba(204,255,0,0.04)', border: `1px solid rgba(204,255,0,0.12)` }}
            >
              <p className="text-xs font-medium" style={{ color: t.accent }}>
                {nextRecommendation}
              </p>
            </div>
          )}

          {/* ── CTAs ── */}
          <div className="flex gap-3">
            {onShare && (
              <button
                onClick={onShare}
                className="py-3.5 px-5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]"
                style={{
                  background: t.surface2,
                  color: t.textSec,
                  border: `1px solid ${t.border}`,
                  touchAction: 'manipulation',
                }}
              >
                分享
              </button>
            )}
            <button
              onClick={onDismiss}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
                color: t.accentText,
                boxShadow: `0 0 20px ${t.accentGlow}`,
                touchAction: 'manipulation',
              }}
            >
              完成
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ChapterCompletionSurface
