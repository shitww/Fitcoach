"use client"

import { useState, useEffect } from "react"
import NutritionCard from "@/components/NutritionCard"
import { getCached, setCached } from "@/lib/client-cache"

interface Props {
  userId: string
}

const GOALS_KEY = '/api/nutrition-goals'

function todayDietKey() {
  return `/api/food-logs?date=${new Date().toISOString().split('T')[0]}`
}

export default function ExtendedWidgets({ userId }: Props) {
  const [nutrition, setNutrition] = useState(() => {
    const cached = getCached<{ targetCalories: number; targetProtein: number }>(GOALS_KEY)
    return cached ?? { targetCalories: 2000, targetProtein: 60 }
  })
  const [dietSummary, setDietSummary] = useState<{ calories: number; protein: number; carbs: number; fat: number } | null>(() => {
    const cached = getCached<any>(todayDietKey())
    if (!cached) return null
    const d = cached?.summary ?? cached
    return { calories: d.calories || 0, protein: d.protein || 0, carbs: d.carbs || 0, fat: d.fat || 0 }
  })

  useEffect(() => {
    if (!userId) return
    const dietKey = todayDietKey()

    const fetchGoals = async () => {
      try {
        const r = await fetch(GOALS_KEY, { credentials: 'include' })
        if (!r.ok) return
        const data = await r.json()
        setCached(GOALS_KEY, data)
        setNutrition(data)
      } catch {}
    }

    const fetchDiet = async () => {
      try {
        const r = await fetch(dietKey, { credentials: 'include' })
        if (!r.ok) return
        const data = await r.json()
        setCached(dietKey, data)
        const d = data?.summary ?? data
        setDietSummary({ calories: d.calories || 0, protein: d.protein || 0, carbs: d.carbs || 0, fat: d.fat || 0 })
      } catch {}
    }

    fetchGoals()
    fetchDiet()
  }, [userId])

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <NutritionCard
          settings={{
            targetCalories: nutrition.targetCalories,
            targetProtein: nutrition.targetProtein,
          }}
          dietSummary={dietSummary}
        />
      </div>
    </div>
  )
}
