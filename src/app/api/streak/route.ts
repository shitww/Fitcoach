import { NextResponse } from 'next/server'
import { getDbUserId } from '@/lib/get-db-user'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export interface StreakData {
  currentStreak: number
  todayDone: boolean
  longestStreak: number
  totalWorkouts: number
  last14Days: { date: string; done: boolean }[]
}

export async function GET() {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    })

    // Deduplicate by calendar day (UTC)
    const doneDates = new Set<string>()
    for (const w of workouts) {
      doneDates.add(w.date.toISOString().split('T')[0])
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const todayDone = doneDates.has(todayStr)

    // Current streak: count consecutive days backward from today (or yesterday if today not done)
    let currentStreak = 0
    const cursor = new Date()
    if (!todayDone) cursor.setUTCDate(cursor.getUTCDate() - 1)
    for (let i = 0; i < 366; i++) {
      const ds = cursor.toISOString().split('T')[0]
      if (!doneDates.has(ds)) break
      currentStreak++
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    // Longest streak: walk ascending sorted dates
    const asc = Array.from(doneDates).sort()
    let longestStreak = currentStreak
    let run = 0
    for (let i = 0; i < asc.length; i++) {
      if (i === 0) {
        run = 1
      } else {
        const prev = new Date(asc[i - 1] + 'T12:00:00Z')
        const curr = new Date(asc[i] + 'T12:00:00Z')
        run = Math.round((curr.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1
      }
      if (run > longestStreak) longestStreak = run
    }

    // Last 14 calendar days (oldest → newest)
    const last14Days: StreakData['last14Days'] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      const s = d.toISOString().split('T')[0]
      last14Days.push({ date: s, done: doneDates.has(s) })
    }

    return NextResponse.json({
      currentStreak,
      todayDone,
      longestStreak,
      totalWorkouts: doneDates.size,
      last14Days,
    } satisfies StreakData)
  } catch (e) {
    logger.error('Streak GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
