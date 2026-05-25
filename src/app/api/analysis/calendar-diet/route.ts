import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const year = parseInt(request.nextUrl.searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(request.nextUrl.searchParams.get('month') || String(new Date().getMonth() + 1));

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const logs = await prisma.foodLog.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true, calories: true, protein: true, carbs: true, fat: true },
    });

    // Group by date string
    const map = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
    for (const log of logs) {
      const ds = log.date.toISOString().slice(0, 10);
      const cur = map.get(ds) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
      map.set(ds, {
        calories: cur.calories + log.calories,
        protein: cur.protein + log.protein,
        carbs: cur.carbs + log.carbs,
        fat: cur.fat + log.fat,
      });
    }

    const days = Array.from(map.entries()).map(([date, v]) => ({
      date,
      calories: Math.round(v.calories),
      protein: Math.round(v.protein),
      carbs: Math.round(v.carbs),
      fat: Math.round(v.fat),
    }));

    const totalDays = days.length;
    const avgCalories = totalDays > 0 ? Math.round(days.reduce((s, d) => s + d.calories, 0) / totalDays) : 0;
    const avgProtein = totalDays > 0 ? Math.round(days.reduce((s, d) => s + d.protein, 0) / totalDays) : 0;
    const avgCarbs = totalDays > 0 ? Math.round(days.reduce((s, d) => s + d.carbs, 0) / totalDays) : 0;

    return NextResponse.json({ days, monthStats: { totalDays, avgCalories, avgProtein, avgCarbs } });
  } catch (err) {
    logger.error('[calendar-diet]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
