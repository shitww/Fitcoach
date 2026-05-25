"use client"

import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

interface NutritionSettings {
  targetCalories: number
  targetProtein: number
}

interface DietSummary {
  calories: number
  protein: number
}

interface Props {
  settings: NutritionSettings
  dietSummary: DietSummary | null
}

export default function NutritionCard({ settings, dietSummary }: Props) {
  const router = useRouter()
  const { t } = useTheme()

  return (
    <div className="mb-5 p-4 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-destructive" />
          <span className="text-sm font-bold" style={{ color: t.text }}>今日营养</span>
        </div>
        <button
          onClick={() => router.push(dietSummary && dietSummary.calories > 0 ? "/diet-analysis" : "/diet")}
          className="text-xs font-semibold"
          style={{ color: t.accent }}
        >
          {dietSummary && dietSummary.calories > 0 ? "详情 →" : "记录 →"}
        </button>
      </div>
      {dietSummary && dietSummary.calories > 0 ? (
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <div className="text-2xl font-black leading-none" style={{ color: t.accent }}>
              {Math.round(dietSummary.calories)}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: t.textFaint }}>
              /{settings.targetCalories} kcal
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full h-1.5 rounded-full" style={{ background: t.surface3 }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${Math.min(100, (dietSummary.calories / settings.targetCalories) * 100)}%`,
                background: t.accent,
              }} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-base font-bold text-success">
              {dietSummary.protein.toFixed(0)}g
            </div>
            <div className="text-[10px]" style={{ color: t.textFaint }}>
              蛋白质 /{settings.targetProtein}g
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: t.textMuted }}>今日还未记录饮食</p>
      )}
    </div>
  )
}
