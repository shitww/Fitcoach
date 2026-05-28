"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/contexts/ThemeContext"

export default function UnauthenticatedContent() {
  const router = useRouter()
  const { t } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg width="72" height="28" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="900"
                fill={t.accent} style={{ filter: `drop-shadow(0 0 6px ${t.accentGlow})` }}>
                <tspan>X</tspan><tspan fill={t.text} letterSpacing="0.05em">FIT</tspan><tspan fill={t.accent}>X</tspan>
              </text>
            </svg>
          </div>
        </header>

        {/* ── CTA ── */}
        <div className="text-center py-24">
          <svg className="mx-auto mb-6" width="140" height="80" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: `drop-shadow(0 0 12px ${t.accentGlow})` }}>
            <text x="0" y="62" fontFamily="Space Grotesk, sans-serif" fontSize="56" fontWeight="900" fill={t.accent}>
              <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="44">FIT</tspan><tspan fill={t.accent}>X</tspan>
            </text>
          </svg>
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            欢迎使用 XFITX
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto leading-relaxed" style={{ color: t.textSec }}>
            智能健身训练记录与 AI 分析系统<br />记录每一次进步，助你达成目标
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={() => router.push("/auth/signup")}
              className="flex-1 px-8 py-3.5 font-bold rounded-xl transition-all"
              style={{ background: t.accent, color: t.accentText, boxShadow: `0 0 20px ${t.accentGlow}` }}
            >
              立即开始
            </button>
            <button
              onClick={() => router.push("/auth/signin")}
              className="flex-1 px-8 py-3.5 font-bold rounded-xl transition-all"
              style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}
            >
              登录账号
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
