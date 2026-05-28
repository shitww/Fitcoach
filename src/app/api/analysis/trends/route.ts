import { NextRequest, NextResponse } from 'next/server';
import { CACHE_2MIN } from '@/lib/api-cache';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getPeriodDateRange } from '@/lib/date-range';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const exercise = searchParams.get('exercise') || 'all';
    const customStart = searchParams.get('start') ?? undefined;
    const customEnd = searchParams.get('end') ?? undefined;
    const { start: startDate, end: endDate } = getPeriodDateRange(period, customStart, customEnd);

    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { workoutSets: true },
      orderBy: { date: 'asc' }
    });

    const trends = workouts.map(w => {
      let volume = 0;
      let sets = 0;
      const workSets = w.workoutSets.filter(s => s.type === 'S');
      workSets.forEach(set => {
        volume += set.weight * set.reps;
        sets++;
      });
      return {
        date: w.date.toISOString().split('T')[0],
        volume,
        sets,
        exercises: [...new Set(workSets.map(s => s.exercise))]
      };
    });

    return NextResponse.json({ trends }, { headers: CACHE_2MIN });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}