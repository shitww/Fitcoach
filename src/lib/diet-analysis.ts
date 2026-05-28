import { cache } from "react"
import { prisma } from "./prisma"
import { getTodayFoodLogs, getNutritionSettings } from "./dashboard"

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

  const [{ summary: intake }, goals] = await Promise.all([
    getTodayFoodLogs(userId),
    getNutritionSettings(userId),
  ])

  // Fetch weekly data (last 7 days including today)
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

  for (const log of logs) {
    const key = log.date.toISOString().split("T")[0]
    const cur = dayMap.get(key)
    if (cur) {
      cur.calories += log.calories
      cur.protein += log.protein
      cur.carbs += log.carbs
      cur.fat += log.fat
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
      calories: intake?.calories ?? 0,
      protein: intake?.protein ?? 0,
      carbs: intake?.carbs ?? 0,
      fat: intake?.fat ?? 0,
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
