import { NextResponse } from "next/server"
import { getDbUserId } from "@/lib/get-db-user"
import { prisma } from "@/lib/prisma"

export interface RecentExerciseItem {
  name: string
  weight: number
  reps: number
  date: string
}

export async function GET() {
  const userId = await getDbUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 3,
    include: { workoutSets: true },
  })

  const seen = new Set<string>()
  const results: RecentExerciseItem[] = []

  for (const workout of workouts) {
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
      if (results.length >= 5) break
    }
    if (results.length >= 5) break
  }

  return NextResponse.json(results)
}
