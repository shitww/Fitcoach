import { cache } from "react"
import { prisma } from "./prisma"
import type { DashboardStatus, UserStatus, FatigueLevel } from "@/app/api/dashboard/status/route"
import {
  getDashboardSnapshot,
  writeDashboardSnapshot,
  getDashboardSnapshotSync,
  writeDashboardSnapshotSync,
} from "./kv/dashboard"

export interface PlanDay {
  id: string
  dayIndex: number
  dayName: string
  exercises: string
}

export interface Plan {
  id: string
  name: string
  days: PlanDay[]
}

export interface NutritionSettings {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  waterGoal: number
}

export interface DietSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export async function getUserPlans(userId: string): Promise<Plan[]> {
  const rows = await prisma.trainingPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      days: { orderBy: { dayIndex: "asc" } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    days: r.days.map((d) => ({
      id: d.id,
      dayIndex: d.dayIndex,
      dayName: d.dayName,
      exercises: d.exercises,
    })),
  }))
}

export async function getDashboardStatus(userId: string): Promise<DashboardStatus> {
  const now = new Date()
  const todayUTC = now.toISOString().split("T")[0]
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14)

  const [recent14, allDates] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, date: { gte: fourteenDaysAgo } },
      include: { workoutSets: true },
      orderBy: { date: "desc" },
    }),
    prisma.workout.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
  ])

  // Streak
  const doneDates = new Set<string>()
  for (const w of allDates) doneDates.add(w.date.toISOString().split("T")[0])

  const todayDone = doneDates.has(todayUTC)
  let currentStreak = 0
  const cursor = new Date(now)
  if (!todayDone) cursor.setUTCDate(cursor.getUTCDate() - 1)
  for (let i = 0; i < 366; i++) {
    if (!doneDates.has(cursor.toISOString().split("T")[0])) break
    currentStreak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  const ascDates = Array.from(doneDates).sort()
  let longestStreak = currentStreak
  let run = 0
  for (let i = 0; i < ascDates.length; i++) {
    run = i === 0 ? 1
      : Math.round(
          (new Date(ascDates[i] + "T12:00:00Z").getTime() -
            new Date(ascDates[i - 1] + "T12:00:00Z").getTime()) / 86_400_000
        ) === 1
        ? run + 1 : 1
    if (run > longestStreak) longestStreak = run
  }

  const last14Days: DashboardStatus["last14Days"] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    const s = d.toISOString().split("T")[0]
    last14Days.push({ date: s, done: doneDates.has(s) })
  }

  const sortedDesc = Array.from(doneDates).sort().reverse()
  const daysSinceLastWorkout = sortedDesc.length === 0 ? 999
    : Math.round(
        (new Date(todayUTC + "T12:00:00Z").getTime() -
          new Date(sortedDesc[0] + "T12:00:00Z").getTime()) / 86_400_000
      )

  const weekStart = new Date(now)
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
  const weekStartStr = weekStart.toISOString().split("T")[0]
  const weeklyWorkouts = Array.from(doneDates).filter((d) => d >= weekStartStr).length

  // Fatigue
  let todayVolume = 0, recentVolume = 0, totalHist = 0, histDays = 0
  for (let i = 0; i < 14; i++) {
    const d = new Date(todayUTC + "T00:00:00Z")
    d.setUTCDate(d.getUTCDate() - i)
    const ds = d.toISOString().split("T")[0]
    const day = recent14.filter((w) => w.date.toISOString().split("T")[0] === ds)
    if (day.length > 0) {
      const vol = day.reduce(
        (s, w) => s + w.workoutSets.reduce((ss, set) => (set.type === "W" ? ss : ss + set.weight * set.reps), 0),
        0
      )
      totalHist += vol
      histDays++
      if (i === 0) todayVolume = vol
      if (i < 3) recentVolume += vol
    }
  }
  const avgDaily = histDays > (todayVolume > 0 ? 1 : 0)
    ? (totalHist - todayVolume) / Math.max(histDays - (todayVolume > 0 ? 1 : 0), 1)
    : 0
  const todayRatio = avgDaily > 0 ? todayVolume / avgDaily : 0
  const recentRatio = avgDaily > 0 ? recentVolume / (avgDaily * 3) : 0
  const fatigueScore = Math.min(100, Math.round(todayRatio * 40 + recentRatio * 60))
  const fatigueLevel: FatigueLevel = fatigueScore <= 30 ? "low" : fatigueScore <= 60 ? "medium" : "high"

  const isFatigued =
    currentStreak >= 5 || fatigueLevel === "high" || (currentStreak >= 4 && fatigueLevel === "medium")
  const isRecovered = daysSinceLastWorkout >= 2 && fatigueLevel === "low" && !todayDone
  const userStatus: UserStatus = isFatigued ? "FATIGUED" : isRecovered ? "RECOVERED" : "READY_TO_TRAIN"

  const coachInsight = deriveCoachInsight(userStatus, currentStreak, daysSinceLastWorkout, todayDone, fatigueLevel)

  const result: DashboardStatus = {
    userStatus,
    coachInsight,
    todayDone,
    currentStreak,
    longestStreak,
    totalWorkouts: doneDates.size,
    last14Days,
    daysSinceLastWorkout,
    weeklyWorkouts,
    fatigueScore,
    fatigueLevel,
  }

  void setDashboardCache(userId, result)
  return result
}

function deriveCoachInsight(
  status: UserStatus,
  streak: number,
  daysSince: number,
  todayDone: boolean,
  fatigueLevel: FatigueLevel
): string {
  switch (status) {
    case "FATIGUED":
      if (streak >= 5) return `连续 ${streak} 天，今日建议主动恢复`
      if (fatigueLevel === "high") return "近期训练量偏大，建议降低强度"
      return "保持训练节奏，适当控制今日强度"
    case "REST_DAY":
      return "计划休息日，充分恢复，明天更强"
    case "RECOVERED":
      if (daysSince >= 3) return `休息 ${daysSince} 天后，今天状态最佳`
      return "恢复良好，今天适合全力训练"
    case "READY_TO_TRAIN":
      if (todayDone) return streak > 1 ? `连续 ${streak} 天完成，保持！` : "今日任务完成 ✓"
      if (streak >= 3) return `已坚持 ${streak} 天，继续保持！`
      if (streak > 0) return `${streak} 天连续，今天继续加油`
      return "准备好了，开始今天的训练吧"
  }
}

export async function getNutritionSettings(userId: string): Promise<NutritionSettings> {
  let settings = await prisma.userSettings.findUnique({ where: { userId } })
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        waterGoal: 2500,
        targetCalories: 2000,
        targetProtein: 60,
        targetCarbs: 250,
        targetFat: 65,
      },
    })
  }
  return {
    waterGoal: settings.waterGoal,
    targetCalories: settings.targetCalories ?? 2000,
    targetProtein: settings.targetProtein ?? 60,
    targetCarbs: settings.targetCarbs ?? 250,
    targetFat: settings.targetFat ?? 65,
  }
}

export async function getTodayFoodLogs(userId: string): Promise<{ logs: unknown[]; summary: DietSummary }> {
  const date = new Date().toISOString().split("T")[0]
  const logs = await prisma.foodLog.findMany({
    where: {
      userId,
      date: { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) },
    },
    include: { food: true },
    orderBy: { createdAt: "desc" },
  })
  const summary = logs.reduce(
    (acc, log) => {
      acc.calories += log.calories
      acc.protein += log.protein
      acc.carbs += log.carbs
      acc.fat += log.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
  return { logs, summary }
}

export interface CriticalDashboardData {
  status: DashboardStatus
  plans: Plan[]
}

export interface ExtendedDashboardData {
  nutrition: NutritionSettings
  dietSummary: DietSummary | null
}

export async function getCriticalDashboardData(userId: string): Promise<CriticalDashboardData> {
  const [statusRes, plansRes] = await Promise.allSettled([
    getDashboardStatus(userId),
    getUserPlans(userId),
  ])
  return {
    status: statusRes.status === "fulfilled" ? statusRes.value : createDefaultDashboardStatus(),
    plans: plansRes.status === "fulfilled" ? plansRes.value : [],
  }
}

export async function getExtendedDashboardData(userId: string): Promise<ExtendedDashboardData> {
  const [nutritionRes, logsRes] = await Promise.allSettled([
    getNutritionSettings(userId),
    getTodayFoodLogs(userId),
  ])
  return {
    nutrition: nutritionRes.status === "fulfilled"
      ? nutritionRes.value
      : { targetCalories: 2000, targetProtein: 60, targetCarbs: 250, targetFat: 65, waterGoal: 2500 },
    dietSummary: logsRes.status === "fulfilled" ? logsRes.value.summary : null,
  }
}

// Legacy aggregator — kept for API route compatibility
export interface HomeDashboardData {
  status: DashboardStatus
  plans: Plan[]
  nutrition: NutritionSettings
  dietSummary: DietSummary | null
}

export async function getHomeDashboardData(userId: string): Promise<HomeDashboardData> {
  const [critical, extended] = await Promise.all([
    getCriticalDashboardData(userId),
    getExtendedDashboardData(userId),
  ])
  return { ...critical, ...extended }
}

export function createDefaultDashboardStatus(): DashboardStatus {
  const now = new Date()
  const last14Days: { date: string; done: boolean }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    last14Days.push({ date: d.toISOString().split("T")[0], done: false })
  }
  return {
    userStatus: "READY_TO_TRAIN",
    coachInsight: "准备好了，开始今天的训练吧",
    todayDone: false,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    last14Days,
    daysSinceLastWorkout: 999,
    weeklyWorkouts: 0,
    fatigueScore: 0,
    fatigueLevel: "low",
  }
}

// ── Instant Dashboard Cache — backed by KV layer (edge-safe) ──
export async function getInstantDashboardCache(userId: string): Promise<DashboardStatus | null> {
  const snap = await getDashboardSnapshot(userId)
  return snap?.data ?? null
}

export async function setDashboardCache(userId: string, data: DashboardStatus): Promise<void> {
  await writeDashboardSnapshot(userId, data)
}

/** Sync fallback for paths that cannot await (SSR edge case). */
export function getInstantDashboardCacheSync(userId: string): DashboardStatus | null {
  return getDashboardSnapshotSync(userId)?.data ?? null
}

/** Sync fallback for hot-paths that cannot await. */
export function setDashboardCacheSync(userId: string, data: DashboardStatus): void {
  writeDashboardSnapshotSync(userId, data)
}

// ── React cache wrappers: deduplicates across Server Components in same request ──
export const getUserPlansCached = cache(getUserPlans)
export const getDashboardStatusCached = cache(getDashboardStatus)
export const getNutritionSettingsCached = cache(getNutritionSettings)
export const getTodayFoodLogsCached = cache(getTodayFoodLogs)
export const getHomeDashboardDataCached = cache(getHomeDashboardData)
export const getCriticalDashboardDataCached = cache(getCriticalDashboardData)
export const getExtendedDashboardDataCached = cache(getExtendedDashboardData)
