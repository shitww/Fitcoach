import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// PATCH /api/body-data/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.bodyData.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });

    const record = await prisma.bodyData.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ record });
  } catch (error) {
    logger.error('PATCH /api/body-data/[id] error:', error);
    return NextResponse.json({ error: '更新身体数据失败' }, { status: 500 });
  }
}

// DELETE /api/body-data/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.bodyData.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });

    await prisma.bodyData.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/body-data/[id] error:', error);
    return NextResponse.json({ error: '删除身体数据失败' }, { status: 500 });
  }
}
