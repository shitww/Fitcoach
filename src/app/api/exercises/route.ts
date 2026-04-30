import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const search = searchParams.get('search');

    const where: any = {};
    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { alias: { contains: search } }
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    logger.warn('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
