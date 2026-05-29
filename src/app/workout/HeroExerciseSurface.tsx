'use client'

import { memo, useState, useCallback } from 'react'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { triggerHaptic, WEIGHT_STEPS } from '@/lib/workout-runtime/mobile/buildOneHandInteractions'

interface CompletedSet {
  weight: number
  reps: number
  isBodyweight: boolean
}

interface HeroExerciseSurfaceProps {
  exerciseName: string
  setNumber: number               // 1-indexed
  predictedWeight: number | null
  predictedReps: number | null
  isBodyweight: boolean
  completedSets: CompletedSet[]
  isLoading: boolean
  prResult?: { type: string; display: string } | null
  progressionHint?: string | null
  onWeightChange: (v: number) => void
  onRepsChange: (v: number) => void
  onLogSet: (weight: number, reps: number) => void
  onChangeExercise: () => void
  onOpenNumberPad?: (target: 'weight' | 'reps', current: number) => void
}

const HeroExerciseSurface = memo(function HeroExerciseSurface({
  exerciseName,
  setNumber,
  predictedWeight,
  predictedReps,
  isBodyweight,
  completedSets,
  isLoading,
  prResult,
  progressionHint,
  onWeightChange,
  onRepsChange,
  onLogSet,
  onChangeExercise,
  onOpenNumberPad,
}: HeroExerciseSurfaceProps) {
  const { t } = useTheme()

  const [weight, setWeightState] = useState<number>(predictedWeight ?? 0)
  const [reps, setRepsState] = useState<number>(predictedReps ?? 8)

  const handleWeightStep = useCallback((delta: number) => {
    const next = Math.max(0, Math.round((weight + delta) * 10) / 10)
    setWeightState(next)
    onWeightChange(next)
    triggerHaptic([5])
  }, [weight, onWeightChange])

  const handleRepsStep = useCallback((delta: number) => {
    const next = Math.max(1, reps + delta)
    setRepsState(next)
    onRepsChange(next)
    triggerHaptic([5])
  }, [reps, onRepsChange])

  const handleConfirm = useCallback(() => {
    if (isLoading) return
    triggerHaptic([10])
    onLogSet(weight, reps)
  }, [weight, reps, isLoading, onLogSet])

  const canLog = (isBodyweight || weight > 0) && reps > 0 && !isLoading
  const displayName = exerciseName.split(' (')[0]

  return (
    <div
      className="flex flex-col"
      style={{ animation: 'rt-name-in 0.38s cubic-bezier(0.34,1.2,0.64,1) both' }}
    >
      {/* ── Exercise Name (focal point) ── */}
      <div className="px-4 mb-5">
        <button
          onClick={onChangeExercise}
          className="flex items-center gap-1 mb-1 active:opacity-70 transition-opacity"
          style={{ touchAction: 'manipulation' }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: t.textFaint }}
          >
            {setNumber > 1 ? `第 ${setNumber} 组` : '开始训练'}
          </span>
          <ChevronRight className="w-3 h-3" style={{ color: t.textFaint }} />
        </button>

        <h1
          className="text-4xl font-black leading-tight tracking-tight"
          style={{ color: t.text }}
          key={exerciseName}
        >
          {displayName}
        </h1>

        {progressionHint && (
          <p
            className="text-xs mt-1 font-medium"
            style={{ color: t.accent, animation: 'rt-name-in 0.3s ease-out 0.15s both' }}
          >
            {progressionHint}
          </p>
        )}

        {prResult && (
          <span
            className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
          >
            {prResult.display}
          </span>
        )}
      </div>

      {/* ── Completed sets timeline ── */}
      {completedSets.length > 0 && (
        <div className="px-4 mb-5 flex gap-2 overflow-x-auto no-scrollbar">
          {completedSets.map((s, i) => (
            <div
              key={i}
              className="flex-none px-3 py-2 rounded-xl text-center"
              style={{
                background: t.surface2,
                border: `1px solid ${t.border}`,
                minWidth: 72,
              }}
            >
              <div
                className="text-sm font-black tabular-nums"
                style={{ color: t.text }}
              >
                {s.isBodyweight ? '自重' : `${s.weight}`}
              </div>
              <div
                className="text-[10px] font-semibold"
                style={{ color: t.textFaint }}
              >
                × {s.reps}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Predictive weight × reps controls ── */}
      <div className="px-4 mb-6">
        <div className="flex gap-3">
          {/* Weight stepper */}
          {!isBodyweight && (
            <div
              className="flex-1 rounded-2xl p-4"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: t.textFaint }}
              >
                重量
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleWeightStep(-WEIGHT_STEPS.normal)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: t.surface2, border: `1px solid ${t.border}`, touchAction: 'manipulation' }}
                >
                  <Minus className="w-4 h-4" style={{ color: t.text }} />
                </button>
                <button
                  onClick={() => onOpenNumberPad?.('weight', weight)}
                  className="flex-1 text-center"
                >
                  <span
                    className="text-3xl font-black tabular-nums leading-none"
                    style={{ color: t.text }}
                  >
                    {weight > 0 ? weight : '—'}
                  </span>
                  <span className="text-sm ml-1" style={{ color: t.textFaint }}>kg</span>
                </button>
                <button
                  onClick={() => handleWeightStep(WEIGHT_STEPS.normal)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: t.surface2, border: `1px solid ${t.border}`, touchAction: 'manipulation' }}
                >
                  <Plus className="w-4 h-4" style={{ color: t.text }} />
                </button>
              </div>
            </div>
          )}

          {/* Reps stepper */}
          <div
            className={`${isBodyweight ? 'flex-1' : 'w-[44%]'} rounded-2xl p-4`}
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: t.textFaint }}
            >
              次数
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => handleRepsStep(-1)}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: t.surface2, border: `1px solid ${t.border}`, touchAction: 'manipulation' }}
              >
                <Minus className="w-4 h-4" style={{ color: t.text }} />
              </button>
              <button
                onClick={() => onOpenNumberPad?.('reps', reps)}
                className="flex-1 text-center"
              >
                <span
                  className="text-3xl font-black tabular-nums leading-none"
                  style={{ color: t.text }}
                >
                  {reps}
                </span>
              </button>
              <button
                onClick={() => handleRepsStep(1)}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: t.surface2, border: `1px solid ${t.border}`, touchAction: 'manipulation' }}
              >
                <Plus className="w-4 h-4" style={{ color: t.text }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Single confirm CTA ── */}
      <div className="px-4">
        <button
          onClick={handleConfirm}
          disabled={!canLog}
          className="w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: canLog
              ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDim} 100%)`
              : t.surface2,
            color: canLog ? t.accentText : t.textFaint,
            boxShadow: canLog ? `0 0 28px ${t.accentGlow}` : 'none',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          {isBodyweight
            ? `完成 × ${reps}`
            : weight > 0
              ? `完成 ${weight}kg × ${reps}`
              : '完成此组'
          }
        </button>
      </div>
    </div>
  )
})

export default HeroExerciseSurface
