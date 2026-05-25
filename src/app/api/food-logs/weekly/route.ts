import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// GET /api/food-logs/weekly — 返回最近 7 天的摄入汇总
export async function GET() {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 最近 7 天（含今天）
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    // 按天分组汇总
    const dayMap = new Map<string, { calories: number; protein: number; carbs: number; fat: number; water: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    }

    for (const log of logs) {
      const key = log.date.toISOString().split('T')[0];
      const cur = dayMap.get(key);
      if (cur) {
        cur.calories += log.calories;
        cur.protein += log.protein;
        cur.carbs += log.carbs;
        cur.fat += log.fat;
      }
    }

    // 读取本地存储的每日补水（客户端没有 localStorage，这里简单返回 0，前端自己补）
    const days = Array.from(dayMap.entries()).map(([date, sums]) => ({
      date,
      dayLabel: new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }),
      calories: Math.round(sums.calories),
      protein: Math.round(sums.protein),
      carbs: Math.round(sums.carbs),
      fat: Math.round(sums.fat),
      water: 0, // 前端根据 localStorage 自行填充
    }));

    // 计算周均值
    const totals = days.reduce((acc, d) => {
      acc.calories += d.calories;
      acc.protein += d.protein;
      acc.carbs += d.carbs;
      acc.fat += d.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return NextResponse.json({
      days,
      average: {
        calories: Math.round(totals.calories / 7),
        protein: Math.round(totals.protein / 7),
        carbs: Math.round(totals.carbs / 7),
        fat: Math.round(totals.fat / 7),
      },
    });
  } catch (error) {
    logger.error('GET /api/food-logs/weekly error:', error);
    return NextResponse.json({ error: '获取周饮食记录失败' }, { status: 500 });
  }
}
