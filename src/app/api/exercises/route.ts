import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 只返回系统动作（userId=null）+ 当前用户的自定义动作
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      AND: [
        {
          OR: [
            { userId: null },
            { userId }
          ]
        }
      ]
    };

    if (muscleGroup) {
      where.AND.push({ muscleGroup });
    }
    if (category) {
      where.AND.push({ category });
    }
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search } },
          { alias: { contains: search } }
        ]
      });
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    logger.error('GET /api/exercises error:', error);
    return NextResponse.json({ error: '获取动作列表失败，请稍后重试' }, { status: 500 });
  }
}

// POST /api/exercises — 创建自定义动作
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, muscleGroup, category, description, instructions, equipment, difficulty, alias } = body;

    if (!name || !muscleGroup || !category) {
      return NextResponse.json({ error: '动作名称、肌群和类别不能为空' }, { status: 400 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        category,
        description,
        instructions,
        equipment,
        difficulty,
        alias,
        userId,
        isCustom: true,
      },
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error: any) {
    logger.error('POST /api/exercises error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: '该动作名称已存在' }, { status: 409 });
    }
    return NextResponse.json({ error: '创建动作失败，请稍后重试' }, { status: 500 });
  }
}
