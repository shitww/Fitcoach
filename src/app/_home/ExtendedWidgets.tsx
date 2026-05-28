"use client"

import { useState, useEffect } from "react"
import NutritionCard from "@/components/NutritionCard"

interface Props {
  userId: string
}

export default function ExtendedWidgets({ userId }: Props) {
  const [nutrition, setNutrition] = useState({ targetCalories: 2000, targetProtein: 60 })
  const [dietSummary, setDietSummary] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(null)

  useEffect(() => {
    if (!userId) return
    Promise.allSettled([
      fetch('/api/settings', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch('/api/food-logs/today', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([nutritionRes, dietRes]) => {
      if (nutritionRes.status === 'fulfilled' && nutritionRes.value) setNutrition(nutritionRes.value)
      if (dietRes.status === 'fulfilled' && dietRes.value) {
        const d = dietRes.value
        setDietSummary({ calories: d.calories || 0, protein: d.protein || 0, carbs: d.carbs || 0, fat: d.fat || 0 })
      }
    })
  }, [userId])

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <NutritionCard
          settings={{
            targetCalories: nutrition.targetCalories,
            targetProtein: nutrition.targetProtein,
          }}
          dietSummary={dietSummary ?? null}
        />
      </div>
    </div>
  )
}
