import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { stream } from '@/lib/ai/orchestrator';
import { buildCoachSystemPrompt } from '@/lib/ai/prompts/coach-system';
import type { CoachPersonality, HealthSnapshotContext } from '@/lib/ai/types';
import { getHealthSnapshot } from '@/lib/health';
import type { WorkoutDay, FoodLogDay, UserNutritionSettings } from '@/lib/health';
import { TTLCache } from '@/lib/server-cache';

const USER_CTX_TTL_MS = 5 * 60 * 1000; // 5 minutes
type UserCtxResult = Awaited<ReturnType<typeof fetchUserContext>>;
const userCtxCache = new TTLCache<UserCtxResult>();

async function fetchUserContext(userId: string): Promise<{
  recentWorkouts: string[];
  recentFoodLogs: string[];
  personality?: CoachPersonality;
  userSettings?: { fitnessGoal?: string; weight?: number; height?: number };
  healthSnapshot?: HealthSnapshotContext;
}> {
  const since28 = new Date(Date.now() - 28 * 86_400_000);

  const [workouts, foodLogs, settings] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, date: { gte: since28 } },
      include: { workoutSets: { where: { type: 'S' }, select: { weight: true, reps: true, muscleGroup: true, exercise: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.foodLog.findMany({
      where: { userId, date: { gte: new Date(Date.now() - 14 * 86_400_000) } },
      select: { date: true, calories: true, protein: true, carbs: true, fat: true },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
  ]);

  // ── Display strings (last 15 workouts) ───────────────────────────────────
  const recentWorkouts = workouts.slice(0, 15).map(w => {
    const exercises = [...new Set(w.workoutSets.map(s => s.exercise))];
    const isFree = w.workoutSets.length === 0 && (w as { notes?: string | null }).notes;
    if (isFree) return `- ${w.date.toISOString().slice(0, 10)}: 自由记录`;
    return `- ${w.date.toISOString().slice(0, 10)}: ${exercises.join('、')} | 总量${w.totalVolume ?? 0}kg | ${Math.round((w.duration ?? 0) / 60)}min`;
  });

  // ── Food logs aggregated by day ───────────────────────────────────────────
  const dietMap = new Map<string, { cal: number; p: number; c: number; f: number }>();
  for (const log of foodLogs) {
    const ds = log.date.toISOString().slice(0, 10);
    const cur = dietMap.get(ds) ?? { cal: 0, p: 0, c: 0, f: 0 };
    dietMap.set(ds, { cal: cur.cal + log.calories, p: cur.p + log.protein, c: cur.c + log.carbs, f: cur.f + log.fat });
  }
  const recentFoodLogs = Array.from(dietMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, v]) => `- ${date}: ${Math.round(v.cal)}kcal | 蛋白${Math.round(v.p)}g | 碳水${Math.round(v.c)}g | 脂${Math.round(v.f)}g`);

  const goalLine = settings
    ? `热量目标${settings.targetCalories}kcal，蛋白质${settings.targetProtein}g，碳水${settings.targetCarbs}g，脂肪${settings.targetFat}g`
    : undefined;

  // ── Health Snapshot ───────────────────────────────────────────────────────
  let healthSnapshot: HealthSnapshotContext | undefined;
  try {
    const workoutDays: WorkoutDay[] = workouts.map(w => ({
      date: w.date,
      volume: w.workoutSets.reduce((s, set) => s + set.weight * set.reps, 0),
      durationSec: w.duration ?? 0,
      setCount: w.workoutSets.length,
      muscleGroups: [...new Set(w.workoutSets.map(s => s.muscleGroup?.toLowerCase() ?? '').filter(Boolean))],
    }));

    const foodLogDays: FoodLogDay[] = Array.from(dietMap.entries()).map(([date, v]) => ({
      date, calories: v.cal, protein: v.p, carbs: v.c, fat: v.f,
    }));

    const nutritionSettings: UserNutritionSettings = settings ? {
      targetCalories: settings.targetCalories ?? undefined,
      targetProtein:  settings.targetProtein  ?? undefined,
      weightKg: (settings as { weightKg?: number }).weightKg ?? undefined,
      heightCm: (settings as { heightCm?: number }).heightCm ?? undefined,
      age:      (settings as { age?: number }).age      ?? undefined,
      sex:      (settings as { sex?: 'male' | 'female' }).sex ?? undefined,
    } : {};

    const snap = getHealthSnapshot(workoutDays, foodLogDays, nutritionSettings);

    healthSnapshot = {
      fatigueLevel:        snap.fatigue.level,
      fatigueScore:        snap.fatigue.score,
      acwr:                snap.fatigue.acwr,
      daysSinceLastWorkout: snap.fatigue.daysSinceLastWorkout,
      injuryRiskLevel:     snap.injuryRisk.level,
      injuryRiskScore:     snap.injuryRisk.score,
      triggeredFactorNames: snap.injuryRisk.triggeredFactors.map(f => f.name),
      calorieBalance:      snap.nutrition.calorieBalance,
      proteinAdequacy:     snap.nutrition.proteinAdequacy,
      macroBalance:        snap.nutrition.macroBalance,
      nutritionIssues:     snap.nutrition.issues,
    };
  } catch (e) {
    logger.warn('[chat] health snapshot failed, skipping', e);
  }

  return {
    recentWorkouts,
    recentFoodLogs,
    personality: (settings as { coachPersonality?: CoachPersonality } | null)?.coachPersonality ?? 'direct',
    userSettings: goalLine ? { fitnessGoal: goalLine } : undefined,
    healthSnapshot,
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages: rawMessages, userName: rawUserName = '用户' } = await request.json();

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }
    const messages = rawMessages.slice(-40);
    const totalChars = messages.reduce((s: number, m: { content?: string }) => s + (m.content?.length ?? 0), 0);
    if (totalChars > 20_000) {
      return NextResponse.json({ error: '消息内容过长' }, { status: 400 });
    }
    const userName = String(rawUserName).replace(/[\r\n\t]/g, ' ').slice(0, 50);

    let userCtx = userCtxCache.get(userId);
    if (!userCtx) {
      userCtx = await fetchUserContext(userId);
      userCtxCache.set(userId, userCtx, USER_CTX_TTL_MS);
    }
    const lastUserMsg = messages.findLast((m: { role: string; content?: string }) => m.role === 'user')?.content ?? '';
    const systemPrompt = buildCoachSystemPrompt({ ...userCtx, userName }, lastUserMsg);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await stream(
        [{ role: 'system', content: systemPrompt }, ...messages],
        { model: 'qwen-plus', temperature: 0.8, maxTokens: 800, signal: controller.signal },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const err = await res.text();
      logger.error('[chat]', err);
      return NextResponse.json({ error: 'AI调用失败' }, { status: 500 });
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    logger.error('[chat]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
