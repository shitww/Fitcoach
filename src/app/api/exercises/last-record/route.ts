import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    const userId = dbUser.id;

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