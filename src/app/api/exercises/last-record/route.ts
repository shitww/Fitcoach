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
    const exerciseName = searchParams.get('name');
    if (!exerciseName) {
      return NextResponse.json({ error: 'Exercise name is required' }, { status: 400 });
    }

    const lastWorkout = await prisma.workout.findFirst({
      where: {
        userId,
        workoutSets: {
          some: {
            exercise: {
              contains: exerciseName
            }
          }
        }
      },
      orderBy: { date: 'desc' },
      include: {
        workoutSets: {
          where: {
            exercise: {
              contains: exerciseName
            }
          },
          orderBy: { setNumber: 'desc' },
          take: 1
        }
      }
    });

    if (!lastWorkout || !lastWorkout.workoutSets.length) {
      return NextResponse.json({ data: null });
    }

    const lastSet = lastWorkout.workoutSets[0];

    return NextResponse.json({
      data: {
        weight: lastSet.weight,
        reps: lastSet.reps,
        date: lastWorkout.date
      }
    });
  } catch (error: any) {
    logger.error('GET /api/exercises/last-record error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}