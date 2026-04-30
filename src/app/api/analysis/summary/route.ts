import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    const allWorkouts = await prisma.workout.findMany({
      where: { userId },
      include: { workoutSets: true }
    });

    const uniqueDays = new Set(
      allWorkouts.map(w => w.date.toISOString().split('T')[0])
    );

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const periodWorkouts = allWorkouts.filter(w => w.date >= startDate);

    const totalWorkouts = periodWorkouts.length;
    let totalVolume = 0;
    let totalSets = 0;

    periodWorkouts.forEach(w => {
      w.workoutSets.forEach(set => {
        totalVolume += set.weight * set.reps;
        totalSets++;
      });
    });

    const avgDuration = totalWorkouts > 0
      ? Math.round(periodWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts)
      : 0;

    let allTotalVolume = 0;
    let allTotalSets = 0;
    allWorkouts.forEach(w => {
      w.workoutSets.forEach(set => {
        allTotalVolume += set.weight * set.reps;
        allTotalSets++;
      });
    });

    return NextResponse.json({
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      totalSets,
      avgDuration,
      totalCount: allWorkouts.length,
      trainingDays: uniqueDays.size,
      allTotalVolume: Math.round(allTotalVolume),
      allTotalSets,
    });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}