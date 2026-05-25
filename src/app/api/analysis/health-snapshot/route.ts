import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getHealthSnapshot } from '@/lib/health';
import type { WorkoutDay, FoodLogDay, UserNutritionSettings } from '@/lib/health';

/**
 * GET /api/analysis/health-snapshot
 *
 * Returns a full health assessment:
 *   - Fatigue (ACWR + Training Monotony)
 *   - Injury Risk (7 multi-factor rules)
 *   - Nutrition Balance (TDEE, calorie deficit, macro adequacy)
 *
 * Looks back 28 days for training data and 14 days for food logs.
 */
export async function GET() {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const since28 = new Date(Date.now() - 28 * 86_400_000);
    const since14 = new Date(Date.now() - 14 * 86_400_000);

    const [workoutsRaw, foodLogsRaw, settings] = await Promise.all([
      prisma.workout.findMany({
        where: { userId, date: { gte: since28 } },
        include: {
          workoutSets: {
            where: { type: 'S' },   // working sets only
            select: { weight: true, reps: true, muscleGroup: true, exercise: true },
          },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.foodLog.findMany({
        where: { userId, date: { gte: since14 } },
        select: { date: true, calories: true, protein: true, carbs: true, fat: true },
      }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    // ── Build WorkoutDay array ─────────────────────────────────────────────
    const workoutDays: WorkoutDay[] = workoutsRaw.map(w => {
      const volume = w.workoutSets.reduce((s, set) => s + set.weight * set.reps, 0);
      const muscleGroups = [...new Set(
        w.workoutSets
          .map(s => s.muscleGroup?.toLowerCase() ?? '')
          .filter(Boolean)
      )];
      return {
        date: w.date,
        volume,
        durationSec: w.duration ?? 0,
        setCount: w.workoutSets.length,
        muscleGroups,
      };
    });

    // ── Aggregate food logs by day ─────────────────────────────────────────
    const dailyMap = new Map<string, { cal: number; p: number; c: number; f: number }>();
    for (const log of foodLogsRaw) {
      const key = log.date.toISOString().slice(0, 10);
      const cur = dailyMap.get(key) ?? { cal: 0, p: 0, c: 0, f: 0 };
      dailyMap.set(key, {
        cal: cur.cal + log.calories,
        p: cur.p + log.protein,
        c: cur.c + log.carbs,
        f: cur.f + log.fat,
      });
    }
    const foodLogs: FoodLogDay[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
      date,
      calories: v.cal,
      protein: v.p,
      carbs: v.c,
      fat: v.f,
    }));

    // ── User settings ──────────────────────────────────────────────────────
    const nutritionSettings: UserNutritionSettings = settings
      ? {
          targetCalories: settings.targetCalories ?? undefined,
          targetProtein:  settings.targetProtein  ?? undefined,
          targetCarbs:    settings.targetCarbs    ?? undefined,
          targetFat:      settings.targetFat      ?? undefined,
          weightKg:       (settings as { weightKg?: number }).weightKg  ?? undefined,
          heightCm:       (settings as { heightCm?: number }).heightCm  ?? undefined,
          age:            (settings as { age?: number }).age            ?? undefined,
          sex:            (settings as { sex?: 'male' | 'female' }).sex ?? undefined,
        }
      : {};

    // Derive training days/week from actual recent data
    const recentDays = new Set(
      workoutsRaw
        .filter(w => Date.now() - w.date.getTime() < 7 * 86_400_000)
        .map(w => w.date.toISOString().slice(0, 10))
    ).size;

    const snapshot = getHealthSnapshot(workoutDays, foodLogs, nutritionSettings, recentDays);

    return NextResponse.json({ data: snapshot });
  } catch (err) {
    logger.error('[health-snapshot]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
