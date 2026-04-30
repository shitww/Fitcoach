'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function createCustomExercise(
  name: string,
  muscleGroup: string,
  extras?: {
    description?: string;
    instructions?: string;
    equipment?: string;
    difficulty?: string;
    tips?: string[];
    commonMistakes?: string[];
  }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: '未登录', id: 'local-' + Date.now(), name, muscleGroup, isCustom: true };
    }

    // 检查是否已存在同名动作
    const existing = await prisma.exercise.findFirst({
      where: { name, userId, isCustom: true }
    });
    if (existing) return { success: true, ...existing };

    const newExercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        category: '力量',
        description: extras?.description || null,
        instructions: extras?.instructions || null,
        equipment: extras?.equipment || null,
        difficulty: extras?.difficulty || null,
        tips: extras?.tips ? JSON.stringify(extras.tips) : null,
        commonMistakes: extras?.commonMistakes ? JSON.stringify(extras.commonMistakes) : null,
        userId,
        isCustom: true
      }
    });

    revalidatePath('/workout');
    revalidatePath('/exercises');
    return { success: true, ...newExercise };
  } catch (error) {
    logger.error('[createCustomExercise] 失败:', error);
    return { success: false, error: String(error), id: 'local-' + Date.now(), name, muscleGroup, isCustom: true };
  }
}

export async function getUserCustomExercises() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    const exercises = await prisma.exercise.findMany({
      where: { userId, isCustom: true },
      orderBy: { createdAt: 'desc' }
    });
    return exercises.map(ex => ({
      ...ex,
      tips: ex.tips ? JSON.parse(ex.tips) : [],
      commonMistakes: ex.commonMistakes ? JSON.parse(ex.commonMistakes) : []
    }));
  } catch (error) {
    logger.warn('[getUserCustomExercises] 失败:', error);
    return [];
  }
}

export async function updateCustomExercise(
  id: string,
  data: {
    name?: string;
    muscleGroup?: string;
    description?: string;
    instructions?: string;
    equipment?: string;
    difficulty?: string;
    tips?: string[];
    commonMistakes?: string[];
  }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: '未登录' };

    const exercise = await prisma.exercise.findFirst({
      where: { id, userId, isCustom: true }
    });
    if (!exercise) return { success: false, error: '动作不存在或无权限' };

    const updated = await prisma.exercise.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.muscleGroup && { muscleGroup: data.muscleGroup }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.instructions !== undefined && { instructions: data.instructions || null }),
        ...(data.equipment !== undefined && { equipment: data.equipment || null }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty || null }),
        ...(data.tips !== undefined && { tips: data.tips.length > 0 ? JSON.stringify(data.tips) : null }),
        ...(data.commonMistakes !== undefined && { commonMistakes: data.commonMistakes.length > 0 ? JSON.stringify(data.commonMistakes) : null })
      }
    });

    revalidatePath('/exercises');
    revalidatePath('/workout');
    return { success: true, ...updated };
  } catch (error) {
    logger.error('[updateCustomExercise] 失败:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCustomExercise(id: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: '未登录' };

    const exercise = await prisma.exercise.findFirst({
      where: { id, userId, isCustom: true }
    });
    if (!exercise) return { success: false, error: '动作不存在或无权限' };

    await prisma.exercise.delete({ where: { id } });
    revalidatePath('/exercises');
    revalidatePath('/workout');
    return { success: true };
  } catch (error) {
    logger.error('[deleteCustomExercise] 失败:', error);
    return { success: false, error: String(error) };
  }
}
