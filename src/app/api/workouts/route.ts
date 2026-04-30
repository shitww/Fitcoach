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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
      include: {
        workoutSets: true
      }
    });

    const total = await prisma.workout.count({ where: { userId } });

    return NextResponse.json({ workouts, pagination: { total, limit, offset } });
  } catch (error: any) {
    logger.error('GET /api/workouts error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized - no email in session' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
    }
    userId = dbUser.id;

    const body = await request.json();

    const { date, duration, notes, exercises } = body;

    let totalVolume = 0;
    let setNumber = 1;
    const workoutSetsData = (exercises || []).flatMap((ex: any) => {
      const sets = ex.sets || [];
      return sets.map((set: any, idx: number) => {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        totalVolume += w * r;
        return {
          exercise: ex.exerciseName || ex.name || '',
          muscleGroup: ex.muscleGroup || '',
          type: set.isWarmup ? "W" : "S",
          setNumber: setNumber++,
          weight: w,
          reps: r,
          rir: set.rir ?? 0,
          isFailure: !!set.isFailure,
          isPR: !!set.isPR,
        };
      });
    });

    logger.info('[POST /api/workouts] Creating workout with', workoutSetsData.length, 'sets, totalVolume:', totalVolume);

    const workout = await prisma.workout.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        duration: Number(duration) || 0,
        notes: notes || '',
        totalVolume,
        workoutSets: { create: workoutSetsData }
      },
      include: {
        workoutSets: true
      }
    });

    logger.info('[POST /api/workouts] SUCCESS, workout id:', workout.id);
    return NextResponse.json(workout, { status: 201 });
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    logger.error('[POST /api/workouts] ERROR:', errMsg, error?.stack);
    return NextResponse.json({
      error: errMsg || 'Unknown error',
      at: 'POST catch block',
      userIdFound: !!userId
    }, { status: 500 });
  }
}