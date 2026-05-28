import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // id may be URL-encoded exercise name (e.g. "卧推")
    const exerciseName = decodeURIComponent(id);

    // Find all workout sets for this exercise in the last 90 days
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const workoutSets = await prisma.workoutSet.findMany({
      where: {
        exercise: { contains: exerciseName },
        type: 'S',
        workout: { userId, date: { gte: since } },
      },
      include: {
        workout: { select: { date: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Aggregate per workout
    const workoutMap = new Map<string, {
      date: Date;
      sets: { weight: number; reps: number; setNumber: number }[];
    }>();

    for (const s of workoutSets) {
      const wid = s.workoutId;
      if (!workoutMap.has(wid)) {
        workoutMap.set(wid, {
          date: s.workout.date,
          sets: [],
        });
      }
      workoutMap.get(wid)!.sets.push({
        weight: s.weight,
        reps: s.reps,
        setNumber: s.setNumber,
      });
    }

    const history = Array.from(workoutMap.entries())
      .map(([wid, data]) => ({
        workoutId: wid,
        date: data.date.toISOString().slice(0, 10),
        sets: data.sets.sort((a, b) => a.setNumber - b.setNumber),
        volume: data.sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
        maxWeight: Math.max(...data.sets.map(s => s.weight)),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // PRs
    const allSets = workoutSets;
    const maxWeight = allSets.length > 0 ? Math.max(...allSets.map(s => s.weight)) : 0;
    const maxReps = allSets.length > 0 ? Math.max(...allSets.map(s => s.reps)) : 0;
    const maxVolume = allSets.length > 0
      ? Math.max(...allSets.map(s => s.weight * s.reps))
      : 0;

    return NextResponse.json({
      data: {
        history: history.slice(0, 20),
        prs: {
          maxWeight: maxWeight > 0 ? maxWeight : null,
          maxReps: maxReps > 0 ? maxReps : null,
          maxVolume: maxVolume > 0 ? maxVolume : null,
        },
        totalSessions: history.length,
      },
    });
  } catch (error: any) {
    logger.error('GET /api/exercises/[id]/history error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
