import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getPeriodDateRange } from '@/lib/date-range';
import { resolveMuscleGroup } from '@/lib/muscle-keywords';
import type { FreeWorkoutMeta } from '@/app/api/analysis/parse-free-workout/route';

const MUSCLE_LABEL: Record<string, string> = {
  chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂',
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const muscle = request.nextUrl.searchParams.get('muscle') || 'chest';
    const period = request.nextUrl.searchParams.get('period') || 'month';
    const { start, end } = getPeriodDateRange(period);

    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { workoutSets: true },
      orderBy: { date: 'desc' },
    });

    // Filter workouts that contain sets belonging to this muscle
    const relevantWorkouts: {
      id: string;
      date: Date;
      duration: number | null;
      exercises: { name: string; sets: { weight: number; reps: number; setNumber: number }[] }[];
      volume: number;
    }[] = [];

    workouts.forEach(w => {
      // ── Structured strength workouts ──────────────────────────────────────
      if (w.workoutSets.length > 0) {
        const exMap: Record<string, { weight: number; reps: number; setNumber: number }[]> = {};
        let wVol = 0;
        w.workoutSets.filter(s => s.type === 'S').forEach(s => {
          const resolved = resolveMuscleGroup(s.exercise, s.muscleGroup || '');
          if (resolved !== muscle) return;
          if (!exMap[s.exercise]) exMap[s.exercise] = [];
          exMap[s.exercise].push({ weight: s.weight, reps: s.reps, setNumber: s.setNumber });
          wVol += s.weight * s.reps;
        });
        if (Object.keys(exMap).length === 0) return;
        relevantWorkouts.push({
          id: w.id,
          date: w.date,
          duration: w.duration,
          exercises: Object.entries(exMap).map(([name, sets]) => ({ name, sets })),
          volume: wVol,
        });
        return;
      }

      // ── Free records: check AI-parsed metadata ────────────────────────────
      // TODO: remove cast once `npx prisma generate` is re-run (metadata exists in schema)
      const wMeta = (w as unknown as { metadata?: string | null }).metadata;
      if (!wMeta) return;
      try {
        const meta: FreeWorkoutMeta = JSON.parse(wMeta);
        if (!meta.parsed || !meta.muscleGroups.includes(muscle as FreeWorkoutMeta['muscleGroups'][number])) return;
        const durationMin = Math.round((w.duration ?? 0) / 60);
        const estVol = Math.round((durationMin * 10) / meta.muscleGroups.length);
        const freeExercises = meta.keyExercises.length > 0
          ? meta.keyExercises.map(name => ({ name: `📝 ${name}`, sets: [{ weight: 0, reps: 0, setNumber: 1 }] }))
          : [{ name: '📝 自由记录', sets: [{ weight: 0, reps: 0, setNumber: 1 }] }];
        relevantWorkouts.push({
          id: w.id,
          date: w.date,
          duration: w.duration,
          exercises: freeExercises,
          volume: estVol,
        });
      } catch { /* malformed metadata, skip */ }
    });

    const totalVolume = relevantWorkouts.reduce((s, w) => s + w.volume, 0);
    const totalSets = relevantWorkouts.reduce(
      (s, w) => s + w.exercises.reduce((ss, ex) => ss + ex.sets.length, 0), 0
    );

    const lastDate = relevantWorkouts.length > 0 ? relevantWorkouts[0].date : null;
    const daysSinceLast = lastDate
      ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
      : null;

    return NextResponse.json({
      muscle,
      label: MUSCLE_LABEL[muscle] || muscle,
      totalVolume,
      sessions: relevantWorkouts.length,
      totalSets,
      lastTrainedAt: lastDate,
      daysSinceLast,
      recentWorkouts: relevantWorkouts.slice(0, 5).map(w => ({
        id: w.id,
        date: w.date,
        duration: w.duration,
        volume: w.volume,
        exercises: w.exercises,
      })),
    });
  } catch (error) {
    logger.error('[muscle-history]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
