"use client"

import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { AmbientGlow } from "@/components/AmbientGlow"
import BottomTabBar from "@/components/BottomTabBar"

interface Props {
  children: React.ReactNode
}

export default function HomeShell({ children }: Props) {
  const router = useRouter()
  const { t } = useTheme()

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.text, fontFamily: "Inter, Space Grotesk, sans-serif" }}>
      {/* Ambient top glow */}
      <AmbientGlow />

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
            <div className="w-px h-5" style={{ background: t.borderAccent }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold tracking-widest" style={{ color: t.textFaint, letterSpacing: "0.3em", fontFamily: "Space Grotesk, sans-serif" }}>
                AI FITNESS COACH
              </span>
            </div>
          </div>
          <button onClick={() => router.push("/profile")}
            title="我的"
            className="p-2 rounded-xl transition-all hover:bg-white/5 active:scale-95"
            style={{ background: t.surface2, border: `1px solid ${t.border}` }}
          >
            <Users className="w-5 h-5" style={{ color: t.textMuted }} />
          </button>
        </header>

        {/* ── Streaming widgets ── */}
        {children}
      </div>

      <BottomTabBar active="home" />
    </div>
  )
}
