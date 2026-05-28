import { cache } from "react"
import { prisma } from "./prisma"
import { getNutritionSettings } from "./dashboard"

export interface DietIntake {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DietGoals {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
}

export interface WeeklyDay {
  date: string
  dayLabel: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

export interface DietAnalysisBootstrap {
  intake: DietIntake
  goals: DietGoals
  weeklyDays: WeeklyDay[]
}

export async function getDietAnalysisBootstrap(userId: string): Promise<DietAnalysisBootstrap> {
  const todayStr = new Date().toISOString().split("T")[0]

  // Single query for goals (settings never change per request)
  const goals = await getNutritionSettings(userId)

  // Single 7-day query — today intake derived from this dataset (eliminates duplicate query)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const logs = await prisma.foodLog.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  })

  const dayMap = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split("T")[0]
    dayMap.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  // Aggregate per-day AND today's intake in one pass
  let todayCalories = 0, todayProtein = 0, todayCarbs = 0, todayFat = 0
  for (const log of logs) {
    const key = log.date.toISOString().split("T")[0]
    const cur = dayMap.get(key)
    if (cur) {
      cur.calories += log.calories
      cur.protein += log.protein
      cur.carbs += log.carbs
      cur.fat += log.fat
    }
    if (key === todayStr) {
      todayCalories += log.calories
      todayProtein += log.protein
      todayCarbs += log.carbs
      todayFat += log.fat
    }
  }

  const weeklyDays: WeeklyDay[] = Array.from(dayMap.entries()).map(([date, sums]) => ({
    date,
    dayLabel: new Date(date + "T00:00:00").toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }),
    calories: Math.round(sums.calories),
    protein: Math.round(sums.protein),
    carbs: Math.round(sums.carbs),
    fat: Math.round(sums.fat),
    water: 0, // Client fills from localStorage
  }))

  return {
    intake: {
      calories: Math.round(todayCalories),
      protein: Math.round(todayProtein),
      carbs: Math.round(todayCarbs),
      fat: Math.round(todayFat),
    },
    goals: {
      targetCalories: goals.targetCalories ?? 2000,
      targetProtein: goals.targetProtein ?? 150,
      targetCarbs: goals.targetCarbs ?? 250,
      targetFat: goals.targetFat ?? 65,
    },
    weeklyDays,
  }
}

export const getDietAnalysisBootstrapCached = cache(getDietAnalysisBootstrap)
