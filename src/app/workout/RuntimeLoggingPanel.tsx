'use client'

import { memo } from 'react'
import { Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface RuntimeLoggingPanelProps {
  /** Show prediction label: "82.5 × 8 ?" */
  predictedWeight: number | null
  predictedReps: number | null
  predictedSource: 'session' | 'history' | 'none'
  isBodyweight: boolean
  isLoading: boolean
  onConfirm: () => void
  onAdjust: () => void   // opens fine-tune view
}

/** Predictive confirmation panel — the new logging model.
 *  System shows prediction. User confirms or adjusts.
 *  One tap to log. No form filling.
 */
const RuntimeLoggingPanel = memo(function RuntimeLoggingPanel({
  predictedWeight,
  predictedReps,
  predictedSource,
  isBodyweight,
  isLoading,
  onConfirm,
  onAdjust,
}: RuntimeLoggingPanelProps) {
  const { t } = useTheme()

  const hasPrediction = (isBodyweight || (predictedWeight && predictedWeight > 0)) && predictedReps

  const predictionLabel = isBodyweight
    ? `自重 × ${predictedReps}`
    : predictedWeight && predictedReps
      ? `${predictedWeight}kg × ${predictedReps}`
      : null

  const sourceLabel =
    predictedSource === 'session' ? '延续上一组'  :
    predictedSource === 'history' ? '基于历史记录' :
    '首次训练'

  return (
    <div
      className="px-4 py-4 rounded-2xl mx-4 mb-4"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        animation: 'rt-name-in 0.3s ease-out both',
      }}
    >
      {hasPrediction ? (
        <>
          {/* Prediction display */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: t.textFaint }}
              >
                {sourceLabel}
              </div>
              <div
                className="text-2xl font-black tabular-nums"
                style={{ color: t.text }}
              >
                {predictionLabel}
              </div>
            </div>
            <button
              onClick={onAdjust}
              className="px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
              style={{
                background: t.surface2,
                color: t.textSec,
                border: `1px solid ${t.border}`,
                touchAction: 'manipulation',
              }}
            >
              调整
            </button>
          </div>

          {/* One-tap confirm */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`,
              color: t.accentText,
              boxShadow: `0 0 20px ${t.accentGlow}`,
              opacity: isLoading ? 0.6 : 1,
              touchAction: 'manipulation',
            }}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
            确认完成
          </button>
        </>
      ) : (
        /* No prediction — prompt to set values */
        <button
          onClick={onAdjust}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: t.surface2,
            color: t.textSec,
            border: `1px solid ${t.border}`,
            touchAction: 'manipulation',
          }}
        >
          输入重量和次数
        </button>
      )}
    </div>
  )
})

export default RuntimeLoggingPanel
