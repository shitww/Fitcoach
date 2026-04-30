import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const workout = await prisma.workout.findUnique({
      where: { id, userId },
      include: {
        workoutSets: true
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ workout });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { date, duration, notes, exercises } = data;

    if (!date || !exercises?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let totalVolume = 0;
    let setNumber = 1;
    const workoutSetsData = exercises.flatMap((ex: any) => {
      const sets = ex.sets || [];
      return sets.map((set: any, idx: number) => {
        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        totalVolume += weight * reps;
        return {
          exercise: ex.exerciseName || ex.name,
          muscleGroup: ex.muscleGroup || '',
          type: set.isWarmup ? "W" : "S",
          setNumber: setNumber++,
          weight,
          reps,
          rir: set.rir ?? 0,
          isFailure: !!set.isFailure,
          isPR: !!set.isPR,
        };
      });
    });

    await prisma.workoutSet.deleteMany({
      where: { workoutId: id }
    });

    const workout = await prisma.workout.update({
      where: { id, userId },
      data: {
        date: new Date(date),
        duration: Number(duration) || 0,
        notes,
        totalVolume,
        workoutSets: { create: workoutSetsData }
      },
      include: { workoutSets: true }
    });

    return NextResponse.json({ workout });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.workout.delete({
      where: { id, userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}