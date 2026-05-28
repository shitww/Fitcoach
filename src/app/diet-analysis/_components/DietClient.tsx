"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Minus, Droplets } from "lucide-react"
import type { DietIntake, DietGoals, WeeklyDay } from "@/lib/diet-analysis"

const DietAiHeavy = dynamic(() => import('./DietAiHeavy'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-56 rounded-2xl bg-secondary" />
      <div className="h-96 rounded-2xl bg-secondary" />
    </div>
  ),
})

interface Props {
  initialIntake: DietIntake
  initialGoals: DietGoals
  initialWeeklyDays: WeeklyDay[]
}

export default function DietClient({ initialIntake, initialGoals, initialWeeklyDays }: Props) {
  const [intake] = useState(initialIntake)
  const [goals] = useState(initialGoals)
  const [weeklyDays] = useState<WeeklyDay[]>(initialWeeklyDays)
  const [waterMl, setWaterMl] = useState(() => {
    if (typeof window === 'undefined') return 0
    const key = `water_ml_${new Date().toISOString().split('T')[0]}`
    return parseInt(localStorage.getItem(key) || '0', 10)
  })

  const adjustWater = (delta: number) => {
    setWaterMl(prev => {
      const next = Math.max(0, prev + delta)
      localStorage.setItem(`water_ml_${new Date().toISOString().split('T')[0]}`, String(next))
      return next
    })
  }

  return (
    <>
      {/* ── 补水记录 (lightweight core, always interactive) ── */}
      <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">今日补水</span>
          </div>
          <span className="text-lg font-black text-primary">
            {waterMl}<span className="text-xs font-normal text-foreground/30 ml-0.5">/ 2000 ml</span>
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full mb-4 bg-muted">
          <div className="h-full rounded-full transition-all duration-500 bg-primary"
            style={{ width: `${Math.min(100, (waterMl / 2000) * 100)}%` }} />
        </div>
        <div className="flex items-center gap-2">
          {[200, 350, 500].map(ml => (
            <button key={ml} onClick={() => adjustWater(ml)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 bg-secondary border border-border text-foreground">
              +{ml}ml
            </button>
          ))}
          <button onClick={() => adjustWater(-200)}
            className="p-2.5 rounded-xl transition-all active:scale-95 bg-secondary border border-border">
            <Minus className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* ── Heavy AI Panel (lazy loaded, ssr: false) ── */}
      <DietAiHeavy intake={intake} goals={goals} waterMl={waterMl} weeklyDays={weeklyDays} />
    </>
  )
}
