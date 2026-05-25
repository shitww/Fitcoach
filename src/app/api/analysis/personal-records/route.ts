import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { calculate1RM } from '@/core/calc';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exercise = searchParams.get('exercise');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    // ── 单动作历史模式 ──────────────────────────────────────────
    if (exercise) {
      const workouts = await prisma.workout.findMany({
        where: { userId },
        include: { workoutSets: { where: { exercise } } },
        orderBy: { date: 'asc' },
      });

      // 每天取最佳组（估算1RM最高的组）
      const byDate: Record<string, { date: string; weight: number; reps: number; estimated1RM: number }> = {};
      workouts.forEach(w => {
        const dateStr = w.date.toISOString().split('T')[0];
        w.workoutSets.filter(s => s.type === 'S').forEach(s => {
          const est = Math.round(calculate1RM(s.weight, s.reps));
          if (est > 0 && (!byDate[dateStr] || est > byDate[dateStr].estimated1RM)) {
            byDate[dateStr] = { date: dateStr, weight: s.weight, reps: s.reps, estimated1RM: est };
          }
        });
      });

      const history = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ history });
    }

    // ── 全部动作最佳模式 ────────────────────────────────────────
    const workouts = await prisma.workout.findMany({
      where: { userId },
      take: limit,
      include: { workoutSets: true },
      orderBy: { date: 'desc' },
    });

    const total = await prisma.workout.count({ where: { userId } });

    const personalRecords: Record<string, {
      weight: number;
      reps: number;
      estimated1RM: number;
      date: string;
    }> = {};

    workouts.forEach(workout => {
      workout.workoutSets.filter(s => s.type === 'S').forEach(set => {
        const estimated1RM = calculate1RM(set.weight, set.reps);
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
      .map(([ex, data]) => ({ exercise: ex, ...data }))
      .sort((a, b) => b.estimated1RM - a.estimated1RM)
      .slice(0, 200);

    return NextResponse.json({ records, meta: { total } });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: '获取PR记录失败，请稍后重试' }, { status: 500 });
  }
}