import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// GET /api/body-data?limit=30
export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 200);

    const records = await prisma.bodyData.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ records });
  } catch (error) {
    logger.error('GET /api/body-data error:', error);
    return NextResponse.json({ error: '获取身体数据失败' }, { status: 500 });
  }
}

// POST /api/body-data
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, weight, bodyFat, chest, waist, hip, armLeft, armRight, thighLeft, thighRight, neck, notes } = body;

    if (!date) return NextResponse.json({ error: '日期不能为空' }, { status: 400 });

    const record = await prisma.bodyData.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      update: { weight, bodyFat, chest, waist, hip, armLeft, armRight, thighLeft, thighRight, neck, notes },
      create: { userId, date: new Date(date), weight, bodyFat, chest, waist, hip, armLeft, armRight, thighLeft, thighRight, neck, notes },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/body-data error:', error);
    return NextResponse.json({ error: '保存身体数据失败' }, { status: 500 });
  }
}
