'use client'

import { memo, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { RuntimeQueue } from '@/lib/workout-runtime/queue/buildRuntimeQueue'

interface RuntimeQueueRailProps {
  queue: RuntimeQueue
  onSelectExercise?: (name: string) => void
}

/** Horizontal animated queue rail showing session exercise progression. */
const RuntimeQueueRail = memo(function RuntimeQueueRail({
  queue,
  onSelectExercise,
}: RuntimeQueueRailProps) {
  const { t } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to keep active item in view
  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [queue.currentIndex])

  if (queue.items.length === 0) return null

  return (
    <div className="relative">
      {/* Progress line */}
      <div
        className="absolute left-4 right-4 top-[22px] h-px pointer-events-none"
        style={{ background: t.border }}
      />
      <div
        className="absolute left-4 top-[22px] h-px pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: t.accent,
          width: `calc((100% - 2rem) * ${queue.progressPct / 100})`,
          boxShadow: `0 0 6px ${t.accentGlow}`,
        }}
      />

      {/* Items */}
      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto no-scrollbar px-4 pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {queue.items.map((item, i) => {
          const isActive = item.status === 'active'
          const isDone = item.status === 'completed'
          const isSkipped = item.status === 'skipped'

          return (
            <button
              key={item.id}
              data-active={isActive}
              onClick={() => !isDone && onSelectExercise?.(item.exerciseName)}
              className="flex flex-col items-center gap-1.5 px-3 py-1 flex-none transition-all duration-300"
              style={{
                scrollSnapAlign: 'center',
                touchAction: 'manipulation',
                opacity: isSkipped ? 0.3 : isDone ? 0.55 : 1,
              }}
            >
              {/* Node circle */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center relative transition-all duration-300"
                style={{
                  background: isActive
                    ? t.accent
                    : isDone
                      ? 'rgba(34,197,94,0.12)'
                      : t.surface2,
                  border: isActive
                    ? `2px solid ${t.accent}`
                    : isDone
                      ? '2px solid rgba(34,197,94,0.4)'
                      : `1px solid ${t.border}`,
                  boxShadow: isActive ? `0 0 16px ${t.accentGlow}` : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {isDone ? (
                  <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                ) : (
                  <span
                    className="text-xs font-black tabular-nums"
                    style={{ color: isActive ? t.accentText : t.textFaint }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-semibold leading-tight text-center max-w-[60px] truncate"
                style={{ color: isActive ? t.text : isDone ? t.textFaint : t.textSec }}
              >
                {item.displayName}
              </span>

              {/* Sets indicator */}
              {(isActive || isDone) && item.setsLogged > 0 && (
                <span
                  className="text-[9px] font-bold"
                  style={{ color: isDone ? '#22c55e' : t.accent }}
                >
                  {item.setsLogged} 组
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})

export default RuntimeQueueRail
