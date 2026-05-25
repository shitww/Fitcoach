import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

async function getOwnedCustomExercise(id: string, userId: string) {
  return prisma.exercise.findFirst({
    where: { id, userId, isCustom: true },
  });
}

// PATCH /api/exercises/[id] — 编辑自定义动作
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedCustomExercise(id, userId);
    if (!existing) return NextResponse.json({ error: '动作不存在或无权编辑' }, { status: 404 });

    const body = await request.json();
    const { name, alias, muscleGroup, category, equipment, description, instructions, tips, commonMistakes } = body;

    // If renaming, check for conflicts with other exercises
    if (name && name !== existing.name) {
      const conflict = await prisma.exercise.findUnique({ where: { name } });
      if (conflict) {
        return NextResponse.json({ error: '该动作名称已存在' }, { status: 409 });
      }
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(alias !== undefined && { alias }),
        ...(muscleGroup !== undefined && { muscleGroup }),
        ...(category !== undefined && { category }),
        ...(equipment !== undefined && { equipment }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(tips !== undefined && { tips }),
        ...(commonMistakes !== undefined && { commonMistakes }),
      },
    });

    return NextResponse.json({ exercise: updated });
  } catch (error) {
    logger.error('PATCH /api/exercises/[id] error:', error);
    return NextResponse.json({ error: '编辑动作失败，请稍后重试' }, { status: 500 });
  }
}

// DELETE /api/exercises/[id] — 删除自定义动作
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedCustomExercise(id, userId);
    if (!existing) return NextResponse.json({ error: '动作不存在或无权删除' }, { status: 404 });

    // Nullify FK in WorkoutSets before deleting to avoid constraint errors
    await prisma.workoutSet.updateMany({
      where: { exerciseId: id },
      data: { exerciseId: null },
    });

    await prisma.exercise.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/exercises/[id] error:', error);
    return NextResponse.json({ error: '删除动作失败，请稍后重试' }, { status: 500 });
  }
}
