import { prisma } from '@/lib/prisma';
import { calculate1RM } from '@/core/calc';

/**
 * 批量查询历史的 maxWeight + maxEstimated1RM
 * 一次 DB 查询 + 内存分组，替代 N 次独立查询
 */
export async function batchGetExerciseMaxStats(
  userId: string,
  exerciseNames: string[]
): Promise<{ maxWeight: Map<string, number>; max1RM: Map<string, number> }> {
  const uniqueNames = [...new Set(exerciseNames)];
  const maxWeight = new Map<string, number>();
  const max1RM = new Map<string, number>();

  if (uniqueNames.length === 0) return { maxWeight, max1RM };

  const results = await prisma.workoutSet.findMany({
    where: {
      exercise: { in: uniqueNames },
      type: 'S',
      workout: { userId },
    },
    select: { exercise: true, weight: true, reps: true },
  });

  for (const row of results) {
    // 更新最大重量
    if (row.weight > (maxWeight.get(row.exercise) ?? 0)) {
      maxWeight.set(row.exercise, row.weight);
    }
    // 更新最大预估 1RM
    const e1RM = calculate1RM(row.weight, row.reps);
    if (e1RM > (max1RM.get(row.exercise) ?? 0)) {
      max1RM.set(row.exercise, e1RM);
    }
  }

  return { maxWeight, max1RM };
}


export type ExerciseInputForPR = {
  name: string;
  sets: Array<{ weight: number; reps: number; rir: number }>;
};

export type NewPRRecord = {
  exerciseName: string;
  weight: number;
  reps: number;
  previousMax: number;
};

/**
 * 检测本次训练中的新 PR
 * 使用 estimated1RM (Epley) 判断，与 analytics/analysis.ts 的 getPersonalRecords() 保持一致
 * 同一动作多组超过历史最佳 1RM 时，全部标记为 PR
 */
export async function detectNewPRs(
  userId: string,
  exercises: ExerciseInputForPR[]
): Promise<NewPRRecord[]> {
  if (exercises.length === 0) return [];

  const exerciseNames = exercises.map(e => e.name).filter(Boolean);
  const { maxWeight, max1RM } = await batchGetExerciseMaxStats(userId, exerciseNames);

  const newPRs: NewPRRecord[] = [];

  for (const exercise of exercises) {
    if (!exercise.name) continue;
    const previousMax1RM = max1RM.get(exercise.name) ?? 0;
    const previousMaxWeight = maxWeight.get(exercise.name) ?? 0;

    for (const set of exercise.sets) {
      const current1RM = calculate1RM(set.weight, set.reps);
      if (current1RM > previousMax1RM) {
        newPRs.push({
          exerciseName: exercise.name,
          weight: set.weight,
          reps: set.reps,
          previousMax: previousMaxWeight,
        });
      }
    }
  }

  return newPRs;
}
