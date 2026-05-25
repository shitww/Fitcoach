import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// POST /api/water-logs — 记录饮水
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, ml } = body;

    if (!date || ml === undefined) {
      return NextResponse.json({ error: '缺少参数 date, ml' }, { status: 400 });
    }

    // 查找今日是否已有记录，有则累加，无则创建
    const todayStart = new Date(`${date}T00:00:00.000Z`);
    const todayEnd = new Date(`${date}T23:59:59.999Z`);

    const existing = await prisma.waterLog.findFirst({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd }
      }
    });

    let waterLog;
    if (existing) {
      waterLog = await prisma.waterLog.update({
        where: { id: existing.id },
        data: { amount: existing.amount + ml }
      });
    } else {
      waterLog = await prisma.waterLog.create({
        data: {
          userId,
          date: todayStart,
          amount: ml
        }
      });
    }

    return NextResponse.json({ waterLog }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/water-logs error:', error);
    return NextResponse.json({ error: '记录饮水失败' }, { status: 500 });
  }
}

// GET /api/water-logs — 获取饮水记录
export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (date) {
      where.date = { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) };
    }

    const logs = await prisma.waterLog.findMany({ where, orderBy: { date: 'desc' } });
    return NextResponse.json({ logs });
  } catch (error) {
    logger.error('GET /api/water-logs error:', error);
    return NextResponse.json({ error: '获取饮水记录失败' }, { status: 500 });
  }
}