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

    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: {
        workoutSets: true
      },
      orderBy: { date: 'desc' }
    });

    const personalRecords: Record<string, {
      weight: number;
      reps: number;
      estimated1RM: number;
      date: string;
    }> = {};

    workouts.forEach(workout => {
      workout.workoutSets.forEach(set => {
        const estimated1RM = set.weight * (1 + set.reps / 30);
        if (estimated1RM > 0) {
          const current = personalRecords[set.exercise];
          if (!current || estimated1RM > current.estimated1RM) {
            personalRecords[set.exercise] = {
              weight: set.weight,
              reps: set.reps,
              estimated1RM,
              date: workout.date.toISOString().split('T')[0]
            };
          }
        }
      });
    });

    const records = Object.entries(personalRecords)
      .map(([exercise, data]) => ({ exercise, ...data }))
      .sort((a, b) => b.estimated1RM - a.estimated1RM);

    return NextResponse.json({ records });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}