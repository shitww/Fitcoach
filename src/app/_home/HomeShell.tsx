"use client"

import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

interface Props {
  children: React.ReactNode
}

export default function HomeShell({ children }: Props) {
  const router = useRouter()

  return (
    <div className="page-shell">
      {/* Home page header — brand logo + profile shortcut */}
      <header className="page-header justify-between">
        <div className="flex items-center gap-3">
          <svg width="68" height="26" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="26" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="900">
              <tspan className="fill-primary">X</tspan>
              <tspan className="fill-foreground" letterSpacing="0.05em">FIT</tspan>
              <tspan className="fill-primary">X</tspan>
            </text>
          </svg>
          <div className="w-px h-4 bg-border" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
            AI Coach
          </span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          title="我的"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:bg-muted transition-colors"
        >
          <Users className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <main className="page-content">
        {children}
      </main>

    </div>
  )
}
