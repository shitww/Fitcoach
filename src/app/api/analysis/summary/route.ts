import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getPeriodDateRange } from '@/lib/date-range';
import { CACHE_30S } from '@/lib/api-cache';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const customStart = searchParams.get('start') ?? undefined;
    const customEnd = searchParams.get('end') ?? undefined;
    const { start: startDate, end: endDate } = getPeriodDateRange(period, customStart, customEnd);

    // 并行查询：周期内数据 + 全局计数 + 唯一训练天数
    const [periodWorkouts, allCount] = await Promise.all([
      prisma.workout.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        include: { workoutSets: true },
      }),
      prisma.workout.count({ where: { userId } }),
    ]);

    const totalWorkouts = periodWorkouts.length;
    let totalVolume = 0;
    let totalSets = 0;

    periodWorkouts.forEach(w => {
      w.workoutSets.forEach(set => {
        // 只计入正式组（type !== 'W'），排除热身组
        if (set.type !== 'W') {
          totalVolume += set.weight * set.reps;
          totalSets++;
        }
      });
    });

    const avgDuration = totalWorkouts > 0
      ? Math.round(periodWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts / 60)
      : 0;

    // 全局训练量：使用周期内数据若 period=year 已覆盖大部分，否则单独查询
    let allTotalVolume = 0;
    let allTotalSets = 0;

    if (period === 'year') {
      // year 期间的数据已经足够覆盖绝大部分
      allTotalVolume = totalVolume;
      allTotalSets = totalSets;
    } else {
      // 只查一年内的全局数据，限制查询范围避免无限膨胀
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const allWorkouts = await prisma.workout.findMany({
        where: { userId, date: { gte: oneYearAgo } },
        include: { workoutSets: true },
      });
      allWorkouts.forEach(w => {
        w.workoutSets.forEach(set => {
          if (set.type !== 'W') {
            allTotalVolume += set.weight * set.reps;
            allTotalSets++;
          }
        });
      });
    }

    // Count unique training days within the selected period
    const uniqueDays = new Set(
      periodWorkouts.map(w => w.date.toISOString().split('T')[0])
    );

    return NextResponse.json({
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      totalSets,
      avgDuration,
      totalCount: allCount,
      trainingDays: uniqueDays.size,
      allTotalVolume: Math.round(allTotalVolume),
      allTotalSets,
    }, { headers: CACHE_30S });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: '获取摘要失败，请稍后重试' }, { status: 500 });
  }
}