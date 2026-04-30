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
    const period = searchParams.get('period') || 'month';
    const exercise = searchParams.get('exercise') || 'all';

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: startDate } },
      include: { workoutSets: true },
      orderBy: { date: 'asc' }
    });

    const trends = workouts.map(w => {
      let volume = 0;
      let sets = 0;
      w.workoutSets.forEach(set => {
        volume += set.weight * set.reps;
        sets++;
      });
      return {
        date: w.date.toISOString().split('T')[0],
        volume,
        sets,
        exercises: [...new Set(w.workoutSets.map(s => s.exercise))]
      };
    });

    return NextResponse.json({ trends });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}