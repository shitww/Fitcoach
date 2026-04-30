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

    const feedback = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    logger.warn('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
