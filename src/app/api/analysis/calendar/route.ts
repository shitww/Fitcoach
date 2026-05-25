import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

const CN_TO_EN: Record<string, string> = {
  '胸部': 'chest', '背部': 'back', '腿部': 'legs', '肩部': 'shoulders', '手臂': 'arms',
};
const CN_KW: Record<string, string> = {
  '臂弯举': 'arms', '二头': 'arms', '三头': 'arms', '臂屈伸': 'arms', '臂': 'arms',
  '深蹲': 'legs', '腿举': 'legs', '腿屈伸': 'legs', '提踵': 'legs', '弓步': 'legs', '腿': 'legs',
  '推举': 'shoulders', '侧平': 'shoulders', '前平': 'shoulders', '肩': 'shoulders',
  '划船': 'back', '引体': 'back', '下拉': 'back', '硬拉': 'back', '背': 'back',
  '卧推': 'chest', '胸推': 'chest', '飞鸟': 'chest', '俯卧撑': 'chest', '胸': 'chest',
};
const EN_KW: Record<string, string[]> = {
  chest: ['chest', 'pectoral', 'bench', 'push', 'fly'],
  back: ['back', 'lat', 'traps', 'pull', 'row', 'deadlift'],
  legs: ['legs', 'quads', 'hamstrings', 'glutes', 'calves', 'squat', 'leg', 'lunge'],
  shoulders: ['shoulders', 'delts', 'press', 'lateral', 'front raise'],
  arms: ['arms', 'biceps', 'triceps', 'forearm', 'curl', 'extension'],
};

function resolveMuscle(name: string, mg: string): string | null {
  const raw = (mg || '').trim();
  if (raw) {
    const byCN = CN_TO_EN[raw];
    if (byCN) return byCN;
    const lc = raw.toLowerCase();
    for (const [g, kws] of Object.entries(EN_KW)) if (kws.some(k => lc.includes(k))) return g;
  }
  const lc = name.toLowerCase();
  for (const [kw, g] of Object.entries(CN_KW)) if (lc.includes(kw)) return g;
  for (const [g, kws] of Object.entries(EN_KW)) if (kws.some(k => lc.includes(k))) return g;
  return null;
}

function calcStreaks(dates: Date[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(dates.map(d => {
    const dd = new Date(d); dd.setHours(0, 0, 0, 0); return dd.getTime();
  }))].sort((a, b) => a - b);

  let longest = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === 86400000) { cur++; longest = Math.max(longest, cur); }
    else cur = 1;
  }
  // current streak (from today backwards)
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  let streak = 0;
  let check = todayMs;
  const set = new Set(sorted);
  while (set.has(check) || set.has(check - 86400000)) {
    if (set.has(check)) { streak++; check -= 86400000; }
    else break;
  }
  return { current: streak, longest };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const year = parseInt(request.nextUrl.searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(request.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1));

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch this month's workouts
    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { workoutSets: true },
      orderBy: { date: 'desc' },
    });

    // Also fetch all dates for streak calculation (last 400 days)
    const streakStart = new Date(); streakStart.setDate(streakStart.getDate() - 400);
    const allDates = await prisma.workout.findMany({
      where: { userId, date: { gte: streakStart } },
      select: { date: true },
    });

    const days = workouts.map(w => {
      const muscleSet = new Set<string>();
      const exNames: string[] = [];
      let isCardio = false;
      let isFree = false;

      if (w.workoutSets.length === 0 && w.notes?.trim()) {
        isFree = true;
      }

      w.workoutSets.forEach(s => {
        if (s.type === 'C' || s.exercise?.toLowerCase().includes('cardio')) isCardio = true;
        const m = resolveMuscle(s.exercise, s.muscleGroup || '');
        if (m) muscleSet.add(m);
        if (s.exercise && !exNames.includes(s.exercise)) exNames.push(s.exercise);
      });

      const dateStr = w.date.toISOString().slice(0, 10);
      return {
        date: dateStr,
        workoutId: w.id,
        duration: w.duration ?? 0,
        totalVolume: w.totalVolume ?? 0,
        muscleGroups: Array.from(muscleSet),
        isCardio,
        isFreeRecord: isFree,
        exercises: exNames.slice(0, 5),
      };
    });

    // Month stats
    const totalVolume = workouts.reduce((s, w) => s + (w.totalVolume ?? 0), 0);
    const totalDuration = workouts.reduce((s, w) => s + (w.duration ?? 0), 0);
    const streaks = calcStreaks(allDates.map(d => d.date));

    return NextResponse.json({
      days,
      streak: streaks,
      monthStats: {
        workouts: workouts.length,
        totalVolume,
        totalDuration,
      },
    });
  } catch (error) {
    logger.error('[calendar]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
