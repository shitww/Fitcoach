import { NextResponse } from 'next/server'
import { getDbUserId } from '@/lib/get-db-user'
import { getDashboardStatus } from '@/lib/dashboard'
import { logger } from '@/lib/logger'

export type UserStatus = 'READY_TO_TRAIN' | 'FATIGUED' | 'RECOVERED' | 'REST_DAY'
export type FatigueLevel = 'low' | 'medium' | 'high'

export interface DashboardStatus {
  userStatus: UserStatus
  coachInsight: string
  todayDone: boolean
  currentStreak: number
  longestStreak: number
  totalWorkouts: number
  last14Days: { date: string; done: boolean }[]
  daysSinceLastWorkout: number
  weeklyWorkouts: number
  fatigueScore: number
  fatigueLevel: FatigueLevel
}

function deriveCoachInsight(
  status: UserStatus,
  streak: number,
  daysSince: number,
  todayDone: boolean,
  fatigueLevel: FatigueLevel,
): string {
  switch (status) {
    case 'FATIGUED':
      if (streak >= 5) return `连续 ${streak} 天，今日建议主动恢复`
      if (fatigueLevel === 'high') return '近期训练量偏大，建议降低强度'
      return '保持训练节奏，适当控制今日强度'
    case 'REST_DAY':
      return '计划休息日，充分恢复，明天更强'
    case 'RECOVERED':
      if (daysSince >= 3) return `休息 ${daysSince} 天后，今天状态最佳`
      return '恢复良好，今天适合全力训练'
    case 'READY_TO_TRAIN':
      if (todayDone) return streak > 1 ? `连续 ${streak} 天完成，保持！` : '今日任务完成 ✓'
      if (streak >= 3) return `已坚持 ${streak} 天，继续保持！`
      if (streak > 0) return `${streak} 天连续，今天继续加油`
      return '准备好了，开始今天的训练吧'
  }
}

export async function GET() {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await getDashboardStatus(userId)
    return NextResponse.json(data)
  } catch (e) {
    logger.error('DashboardStatus GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
