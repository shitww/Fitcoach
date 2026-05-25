"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"

interface Props {
  updatedAt: number
}

function formatAge(ms: number): string {
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return "刚刚"
  if (mins < 60) return `${mins} 分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小时前`
  return `${Math.floor(hrs / 24)} 天前`
}

export default function DashboardMeta({ updatedAt }: Props) {
  const { t } = useTheme()
  const [label, setLabel] = useState(() => formatAge(Date.now() - updatedAt))

  useEffect(() => {
    const timer = setInterval(() => {
      setLabel(formatAge(Date.now() - updatedAt))
    }, 60_000)
    return () => clearInterval(timer)
  }, [updatedAt])

  return (
    <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg text-[10px] font-medium w-fit"
      style={{
        color: t.textMuted,
        background: t.surface2,
        border: `1px solid ${t.border}`,
      }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "#F59E0B" }}
      />
      数据已缓存 · {label}
    </div>
  )
}
