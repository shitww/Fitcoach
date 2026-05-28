"use client";

/**
 * InstantShell — The ONLY first-render content for /workout
 *
 * Strict rules:
 * - No React hooks (useState, useEffect, etc.)
 * - No Zustand stores
 * - No AI / intelligence imports
 * - No fetch / network calls
 * - No loading states
 * - No hydration logic
 *
 * This component must render pure static JSX instantly.
 * Goal: 0ms JS blocking on first paint.
 */

interface InstantShellProps {
  onStart: () => void;
}

export default function InstantShell({ onStart }: InstantShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Ambient glow — CSS only, no JS calc */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(204,255,0,0.08), transparent)",
        }}
      />

      <div className="relative flex flex-col flex-1 px-4 pt-5 pb-8 sm:max-w-sm md:max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black">今天练什么？</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-low)" }}>
              选择训练模式开始记录
            </p>
          </div>
        </div>

        {/* Entry cards — fully interactive, no loading */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Strength */}
          <button
            onClick={onStart}
            className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: "var(--accent-dim)" }}
              >
                💪
              </div>
              <div className="flex-1">
                <p className="text-lg font-black">力量训练</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-low)" }}>
                  组数 · 次数 · 重量 · RIR
                </p>
              </div>
              <svg className="w-5 h-5 shrink-0" style={{ color: "var(--accent-glow)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {["胸部", "背部", "腿部", "肩膀", "手臂"].map((g) => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                >
                  {g}
                </span>
              ))}
            </div>
          </button>

          {/* Cardio */}
          <button
            onClick={onStart}
            className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(96,165,250,0.06)",
              border: "1px solid rgba(96,165,250,0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: "rgba(96,165,250,0.1)" }}
              >
                🏃
              </div>
              <div className="flex-1">
                <p className="text-lg font-black">有氧训练</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-low)" }}>
                  自动计算距离与卡路里消耗
                </p>
              </div>
              <svg className="w-5 h-5 shrink-0" style={{ color: "rgba(96,165,250,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="mt-4 flex gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(96,165,250,0.1)",
                  color: "rgba(96,165,250,0.8)",
                }}
              >
                🏃 跑步机
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(96,165,250,0.1)",
                  color: "rgba(96,165,250,0.8)",
                }}
              >
                🧗 爬楼机
              </span>
            </div>
          </button>

          {/* Free */}
          <button
            onClick={onStart}
            className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(168,85,247,0.06)",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: "rgba(168,85,247,0.1)" }}
              >
                📝
              </div>
              <div className="flex-1">
                <p className="text-lg font-black">自由记录</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-low)" }}>
                  自由填写内容，灵活记录
                </p>
              </div>
              <svg className="w-5 h-5 shrink-0" style={{ color: "rgba(168,85,247,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {["拉伸", "康复训练", "体能测试", "其他运动"].map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    color: "rgba(168,85,247,0.8)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
