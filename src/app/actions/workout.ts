'use server';

import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function getLastExerciseRecord(exerciseName: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: '未登录' };
    }

    const lastWorkout = await prisma.workout.findFirst({
      where: {
        userId,
        workoutSets: {
          some: {
            exercise: exerciseName
          }
        }
      },
      orderBy: { date: 'desc' },
      include: {
        workoutSets: {
          where: {
            exercise: exerciseName
          },
          orderBy: { setNumber: 'desc' },
          take: 1
        }
      }
    });

    if (!lastWorkout || !lastWorkout.workoutSets.length) {
      return { success: true, data: null };
    }

    const lastSet = lastWorkout.workoutSets[0];

    return {
      success: true,
      data: {
        weight: lastSet.weight,
        reps: lastSet.reps,
        date: lastWorkout.date
      }
    };
  } catch (error) {
    logger.error('[getLastExerciseRecord] 失败:', error);
    return { success: false, error: String(error) };
  }
}