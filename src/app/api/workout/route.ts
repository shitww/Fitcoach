import { NextRequest, NextResponse } from 'next/server';
import { CACHE_30S } from '@/lib/api-cache';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { emitDashboardEvent } from '@/lib/dashboard/events';
import {
  createWorkout,
  listWorkouts,
  getWorkoutById,
  replaceWorkout,
  WorkoutValidationError,
} from '@/lib/workout-service';

export async function POST(request: NextRequest) {
  const userId = await getDbUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const result = await createWorkout(userId, {
      exercises: data.exercises,
      totalVolume: data.totalVolume,
      duration: data.duration,
      notes: data.notes,
    });

    emitDashboardEvent("WORKOUT_LOGGED", userId);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof WorkoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error('Workout POST error:', error);
    return NextResponse.json({ error: '保存训练记录失败，请稍后重试' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = await getDbUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (id) {
      const summary = await getWorkoutById(userId, id);
      if (!summary) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
      return NextResponse.json({ data: summary }, { headers: CACHE_30S });
    }

    const result = await listWorkouts(userId, { limit, offset });
    return NextResponse.json(result, { headers: CACHE_30S });
  } catch (error) {
    logger.error('Workout GET error:', error);
    return NextResponse.json({ error: '获取训练记录失败，请稍后重试' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getDbUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await request.json();
    const result = await replaceWorkout(userId, id, {
      date: body.date,
      duration: body.duration,
      notes: body.notes,
      exercises: body.exercises || [],
    });
    emitDashboardEvent("WORKOUT_LOGGED", userId);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Workout not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error('Workout PUT error:', error);
    return NextResponse.json({ error: '更新训练记录失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getDbUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const deleted = await prisma.workout.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    emitDashboardEvent("WORKOUT_LOGGED", userId);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    logger.error('Workout DELETE error:', error);
    return NextResponse.json({ error: '删除训练记录失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await getDbUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Verify ownership
    const workout = await prisma.workout.findFirst({ where: { id, userId } });
    if (!workout) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const { notes, sets } = body as {
      notes?: string;
      sets?: { id: string; weight: number; reps: number; rir: number; isFailure: boolean }[];
    };

    // Update each modified set
    if (sets && sets.length > 0) {
      for (const s of sets) {
        await prisma.workoutSet.updateMany({
          where: { id: s.id, workoutId: id },
          data: { weight: s.weight, reps: s.reps, rir: s.rir, isFailure: s.isFailure },
        });
      }
    }

    // Recalculate totalVolume from all current sets
    const allSets = await prisma.workoutSet.findMany({ where: { workoutId: id } });
    const newVolume = allSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

    // Update workout record
    await prisma.workout.update({
      where: { id },
      data: { ...(notes !== undefined && { notes }), totalVolume: newVolume },
    });

    // Invalidate AI feedback cache so user can regenerate
    await prisma.feedback.deleteMany({ where: { workoutId: id, userId, type: 'summary' } });

    emitDashboardEvent("WORKOUT_LOGGED", userId);
    const updated = await getWorkoutById(userId, id);
    return NextResponse.json({ data: updated });
  } catch (error) {
    logger.error('Workout PATCH error:', error);
    return NextResponse.json({ error: '更新训练记录失败' }, { status: 500 });
  }
}
