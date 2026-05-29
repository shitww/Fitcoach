"use client"

import { useTheme } from "@/contexts/ThemeContext"
import type { IdentitySurface } from "@/types/emotional-runtime"

interface Props {
  surface: IdentitySurface
}

/** Training Identity Card — subtle observational identity panel.
 *  Observational, not labeling. Shows what the system has noticed.
 *  Used on profile page.
 */
export default function TrainingIdentityCard({ surface }: Props) {
  const { t } = useTheme()
  const { identity, traitChips } = surface

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: t.textFaint }}>
        训练风格
      </div>

      <p className="text-sm mb-3 leading-relaxed" style={{ color: t.textSec }}>
        {identity.observationNote}
      </p>

      {/* Trait chips — subtle, no gamification */}
      {traitChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {traitChips.map((chip) => (
            <span
              key={chip.label}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: chip.color, color: t.textSec }}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {/* Session length and intensity */}
      <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
        <div>
          <div className="text-[10px]" style={{ color: t.textFaint }}>训练时长</div>
          <div className="text-xs font-medium mt-0.5" style={{ color: t.textSec }}>
            {identity.sessionLengthProfile === 'short' ? '短时高效' :
             identity.sessionLengthProfile === 'long'  ? '长时深度' :
             '中等时长'}
          </div>
        </div>
        <div>
          <div className="text-[10px]" style={{ color: t.textFaint }}>训练强度</div>
          <div className="text-xs font-medium mt-0.5" style={{ color: t.textSec }}>
            {identity.intensityProfile === 'high'     ? '高强度' :
             identity.intensityProfile === 'moderate' ? '中等强度' :
             '轻量训练'}
          </div>
        </div>
      </div>
    </div>
  )
}
