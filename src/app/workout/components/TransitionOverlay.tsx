"use client";

/**
 * TransitionOverlay — Phase 5 Continuous Experience Transition Layer
 *
 * Rules:
 * - Zero AI / store logic
 * - Zero loading spinner
 * - Zero skeleton
 * - Semantic state text only
 * - CSS fade + blur + scale animations
 */

export type TransitionPhase = "entering" | "preparing" | "restoring" | "ready";

const PHASE_META: Record<TransitionPhase, { emoji: string; text: string }> = {
  entering: { emoji: "🔥", text: "正在进入训练模式…" },
  preparing: { emoji: "⚡", text: "准备训练系统…" },
  restoring: { emoji: "💾", text: "恢复训练数据…" },
  ready: { emoji: "✅", text: "就绪" },
};

interface TransitionOverlayProps {
  phase: TransitionPhase;
  visible: boolean; // controlled by parent for exit animation
}

export default function TransitionOverlay({ phase, visible }: TransitionOverlayProps) {
  const meta = PHASE_META[phase];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500"
      style={{
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="text-center px-8 transition-all duration-500"
        style={{
          transform: visible ? "scale(1)" : "scale(0.94)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Emoji with gentle pulse */}
        <div
          className="text-6xl mb-5"
          style={{
            animation: "trans-pulse 2s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          {meta.emoji}
        </div>

        {/* Semantic state text */}
        <p className="text-xl font-black text-white mb-3 tracking-tight">
          {meta.text}
        </p>

        {/* Three-dot breathing indicator (not a spinner) */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full bg-white/70"
              style={{
                width: 6,
                height: 6,
                animation: `trans-breathe 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes trans-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes trans-breathe {
          0%, 100% { transform: scale(0.6); opacity: 0.3; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
