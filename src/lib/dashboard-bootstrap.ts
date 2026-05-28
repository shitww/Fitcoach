import { cache } from "react"
import { prisma } from "./prisma"
import type { DashboardStatus, UserStatus, FatigueLevel } from "@/app/api/dashboard/status/route"
import type { Plan } from "./dashboard"
import {
  getDashboardStatusCached,
  getUserPlansCached,
  createDefaultDashboardStatus,
} from "./dashboard"

// ── Types ───────────────────────────────────────────────────────────────────

export interface QuickEntryData {
  todayDone: boolean
  userStatus: UserStatus
  coachInsight: string
  activePlan: { id: string; name: string } | null
  todayPlanDay: { dayName: string; exercises: string[] } | null
  hasTodayExercises: boolean
  isRestDay: boolean
  dayLabel: string
}

export interface ProgressData {
  currentStreak: number
  weeklyWorkouts: number
  totalWorkouts: number
  todayDone: boolean
  last14Days: { date: string; done: boolean }[]
}

export interface RecoveryData {
  userStatus: UserStatus
  fatigueScore: number
  fatigueLevel: FatigueLevel
  daysSinceLastWorkout: number
}

export interface RecentExercise {
  name: string
  weight: number
  reps: number
  date: string
}

export interface DashboardBootstrap {
  quickEntry: QuickEntryData
  progress: ProgressData
  recovery: RecoveryData
  recentExercises: RecentExercise[]
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getTodayLabel(): string {
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date().getDay()]
}

function safeParseExercises(raw: string): string[] {
  try {
    return JSON.parse(raw || "[]")
  } catch {
    return []
  }
}

async function getRecentExercises(userId: string, limit = 5): Promise<RecentExercise[]> {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 3,
    include: { workoutSets: true },
  })

  const seen = new Set<string>()
  const results: RecentExercise[] = []

  for (const workout of workouts) {
    // Sort sets by setNumber to get the "best" set per exercise (or just first)
    const sets = [...workout.workoutSets].sort((a, b) => a.setNumber - b.setNumber)
    for (const set of sets) {
      if (set.type === "W") continue // skip warmup
      const name = set.exercise
      if (seen.has(name)) continue
      seen.add(name)
      results.push({
        name,
        weight: set.weight,
        reps: set.reps,
        date: workout.date.toISOString().split("T")[0],
      })
      if (results.length >= limit) break
    }
    if (results.length >= limit) break
  }

  return results
}

// ── Bootstrap fetch ───────────────────────────────────────────────────────────

export async function getDashboardBootstrap(userId: string): Promise<DashboardBootstrap> {
  const [status, plans] = await Promise.all([
    getDashboardStatusCached(userId).catch(() => createDefaultDashboardStatus()),
    getUserPlansCached(userId).catch(() => [] as Plan[]),
  ])

  const todayDow = new Date().getDay()
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1
  const dayLabel = getTodayLabel()

  const activePlan = plans[0] ?? null
  const todayPlanDay = activePlan?.days?.[todayIdx] ?? null
  const todayExercises = todayPlanDay ? safeParseExercises(todayPlanDay.exercises) : []
  const hasTodayExercises = todayExercises.length > 0
  const isRestDay = !!activePlan && !hasTodayExercises

  const recentExercises = await getRecentExercises(userId, 5)

  return {
    quickEntry: {
      todayDone: status.todayDone,
      userStatus: status.userStatus,
      coachInsight: status.coachInsight,
      activePlan: activePlan ? { id: activePlan.id, name: activePlan.name } : null,
      todayPlanDay: todayPlanDay
        ? { dayName: todayPlanDay.dayName, exercises: todayExercises }
        : null,
      hasTodayExercises,
      isRestDay,
      dayLabel,
    },
    progress: {
      currentStreak: status.currentStreak,
      weeklyWorkouts: status.weeklyWorkouts,
      totalWorkouts: status.totalWorkouts,
      todayDone: status.todayDone,
      last14Days: status.last14Days,
    },
    recovery: {
      userStatus: status.userStatus,
      fatigueScore: status.fatigueScore,
      fatigueLevel: status.fatigueLevel,
      daysSinceLastWorkout: status.daysSinceLastWorkout,
    },
    recentExercises,
  }
}

export const getDashboardBootstrapCached = cache(getDashboardBootstrap)
