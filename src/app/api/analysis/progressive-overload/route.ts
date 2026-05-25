import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { batchGetExerciseMaxStats } from '@/lib/workout-pr';

/**
 * 一次查询获取双周训练量
 * 替代原来的两次 calculateWeeklyVolume 调用（原来 0-7 天被查了两次）
 */
const getBiWeeklyVolume = async (userId: string): Promise<{ week1: number; week2: number }> => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const workouts = await prisma.workout.findMany({
    where: { userId, date: { gte: twoWeeksAgo } },
    include: { workoutSets: true },
  });

  let week1 = 0, week2 = 0;
  for (const w of workouts) {
    const vol = w.workoutSets
      .filter(s => s.type !== 'W')
      .reduce((sum, s) => sum + s.weight * s.reps, 0);
    if (w.date >= oneWeekAgo) { week1 += vol; } else { week2 += vol; }
  }
  return { week1, week2 };
};

const getVolumeTrend = async (userId: string, lastDays: number = 7): Promise<Array<{ date: string; volume: number }>> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - lastDays);
  startDate.setHours(0, 0, 0, 0);

  // 一次性获取所有数据，避免 N+1 查询
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    include: { workoutSets: true },
    orderBy: { date: 'asc' },
  });

  const data: Array<{ date: string; volume: number }> = [];

  for (let i = lastDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);   dayEnd.setHours(23, 59, 59, 999);

    const dailyVolume = workouts
      .filter(w => w.date >= dayStart && w.date <= dayEnd)
      .reduce((sum, w) => sum + w.workoutSets.reduce((s, set) => {
        if (set.type === 'W') return s; // 排除热身组
        return s + set.weight * set.reps;
      }, 0), 0);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: dailyVolume,
    });
  }

  return data;
};

/** 检测今日训练中匹配历史 PR 的动作。使用 batchGetExerciseMaxStats 避免加载全部记录 */
const detectPR = async (userId: string): Promise<Array<{ exerciseId: string; exerciseName: string; maxWeight: number; currentWeight: number }>> => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayWorkouts = await prisma.workout.findMany({
    where: { userId, date: { gte: today } },
    include: { workoutSets: true },
  });

  const exerciseNames = [...new Set(
    todayWorkouts.flatMap(w => w.workoutSets.filter(s => s.type !== 'W').map(s => s.exercise))
  )];

  if (exerciseNames.length === 0) return [];

  // 复用 workout-pr.ts 的批量查询
  const { maxWeight } = await batchGetExerciseMaxStats(userId, exerciseNames);

  const matchedPRs: Array<{ exerciseId: string; exerciseName: string; maxWeight: number; currentWeight: number }> = [];
  const seen = new Set<string>();

  todayWorkouts.forEach(w => {
    w.workoutSets.forEach(s => {
      if (s.type === 'W') return;
      const hist = maxWeight.get(s.exercise) ?? 0;
      if (s.weight >= hist && s.weight > 0 && !seen.has(s.exercise)) {
        seen.add(s.exercise);
        matchedPRs.push({
          exerciseId: s.exercise,
          exerciseName: s.exercise,
          maxWeight: hist,
          currentWeight: s.weight,
        });
      }
    });
  });

  return matchedPRs;
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week1, week2 } = await getBiWeeklyVolume(userId);

    const trend = await getVolumeTrend(userId);

    const prs = await detectPR(userId);

    return NextResponse.json({
      thisWeekVolume: week1,
      lastWeekVolume: week2,
      volumeTrend: trend,
      newPRs: prs,
    });
  } catch (error) {
    logger.error('Error fetching progressive overload data:', error);
    return NextResponse.json({ error: '获取训练数据失败，请稍后重试' }, { status: 500 });
  }
}