"use client";

import { memo } from "react";
import { Timer, Minimize2, ArrowUp } from "lucide-react";
import { useRestTimerProjection } from "../../hooks/useRestTimerProjection";

interface FloatingRestTimerProps {
  onMinimize: () => void;
}

/**
 * FloatingRestTimer — rest timer as part of the training flow, NOT a modal.
 *
 * Structure:
 * ┌─────────────────┐
 * │ Rest 01:12      │
 * │ Next: 80 × 8    │
 * └─────────────────┘
 *
 * Requirements:
 * - Floats bottom (above dock)
 * - Non-blocking
 * - Minimizable
 * - Ambient breathing via surface glow
 * - States: normal / warning / overtime via surface+glow+motion
 */
const FloatingRestTimer = memo(function FloatingRestTimer({ onMinimize }: FloatingRestTimerProps) {
  const { formatted, phase, progress } = useRestTimerProjection();

  const isWarning = phase === "warning";
  const isOvertime = phase === "overtime";

  const surfaceColor = isOvertime
    ? "var(--state-fatigued-surface)"
    : isWarning
    ? "var(--state-resting-surface)"
    : "var(--rvl-surface-2)";

  const borderColor = isOvertime
    ? "var(--state-fatigued-border)"
    : isWarning
    ? "var(--state-resting-border)"
    : "var(--rvl-border-subtle)";

  const textColor = isOvertime
    ? "var(--rvl-fatigue)"
    : isWarning
    ? "var(--rvl-rest)"
    : "var(--rvl-text-high)";

  const glow = isOvertime
    ? "0 0 24px var(--rvl-fatigue-glow)"
    : isWarning
    ? "0 0 24px var(--rvl-rest-glow)"
    : "0 0 16px var(--rvl-rest-glow)";

  return (
    <div
      className="mx-5 mb-2 rounded-2xl px-4 py-3 flex items-center justify-between runtime-tap"
      style={{
        background: surfaceColor,
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
        animation: isWarning ? "rvl-pulse-rest 2s infinite" : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Progress ring placeholder */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center relative"
          style={{ background: "var(--rvl-surface-1)" }}
        >
          <Timer className="w-4 h-4" style={{ color: textColor }} />
          {/* Simple radial progress via conic gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${textColor} ${progress * 360}deg, transparent 0deg)`,
              opacity: 0.25,
              mask: "radial-gradient(transparent 55%, black 56%)",
              WebkitMask: "radial-gradient(transparent 55%, black 56%)",
            }}
          />
        </div>

        <div>
          <div
            className="text-xs font-bold tabular-nums leading-tight"
            style={{ color: textColor }}
          >
            Rest {formatted}
          </div>
          <div className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "var(--rvl-text-faint)" }}>
            <ArrowUp className="w-3 h-3" />
            下一组准备中…
          </div>
        </div>
      </div>

      <button
        onClick={onMinimize}
        className="p-2 rounded-lg runtime-tap"
        style={{ background: "var(--rvl-surface-1)" }}
        aria-label="最小化"
      >
        <Minimize2 className="w-4 h-4" style={{ color: "var(--rvl-text-faint)" }} />
      </button>
    </div>
  );
});

export default FloatingRestTimer;
