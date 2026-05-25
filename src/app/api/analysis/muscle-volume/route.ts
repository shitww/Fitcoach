import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getPeriodDateRange } from '@/lib/date-range';
import { CN_TO_EN, CN_NAME_KEYWORDS, EN_KEYWORDS } from '@/lib/muscle-keywords';
import type { FreeWorkoutMeta } from '@/app/api/analysis/parse-free-workout/route';

const getMuscleVolume = async (userId: string, period: string = 'month'): Promise<Record<string, number>> => {
  const { start: startDate, end: endDate } = getPeriodDateRange(period);

  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      workoutSets: { where: { type: 'S' } },
    },
  });

  const muscleCounts: Record<string, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
  };

  workouts.forEach(workout => {
    workout.workoutSets.forEach(set => {
      const exerciseName = set.exercise.toLowerCase();
      const rawMuscleGroup = (set.muscleGroup || '').trim();
      const setVolume = set.weight * set.reps;

      let matchedGroup: string | null = null;

      // 1. 优先使用 muscleGroup 字段
      if (rawMuscleGroup) {
        // 1a. 尝试中文映射
        matchedGroup = CN_TO_EN[rawMuscleGroup] || null;
        // 1b. 尝试英文关键词匹配
        if (!matchedGroup) {
          const mg = rawMuscleGroup.toLowerCase();
          for (const [group, keywords] of Object.entries(EN_KEYWORDS)) {
            if (keywords.some(keyword => mg.includes(keyword))) {
              matchedGroup = group;
              break;
            }
          }
        }
      }

      // 2. 如果 muscleGroup 为空，用动作名推断
      if (!matchedGroup) {
        // 2a. 尝试中文关键词
        for (const [keyword, group] of Object.entries(CN_NAME_KEYWORDS)) {
          if (exerciseName.includes(keyword)) {
            matchedGroup = group;
            break;
          }
        }
        // 2b. 尝试英文关键词
        if (!matchedGroup) {
          for (const [group, keywords] of Object.entries(EN_KEYWORDS)) {
            if (keywords.some(keyword => exerciseName.includes(keyword))) {
              matchedGroup = group;
              break;
            }
          }
        }
      }

      if (matchedGroup && matchedGroup in muscleCounts) {
        muscleCounts[matchedGroup] += setVolume;
      }
    });

    // Free records: use AI-parsed metadata for muscle volume estimation
    // (no weight×reps data, so use duration as proxy: 10 kg-equiv per minute, split across muscle groups)
    if (workout.workoutSets.length === 0 && workout.metadata) {
      try {
        const meta: FreeWorkoutMeta = JSON.parse(workout.metadata);
        if (meta.parsed && meta.muscleGroups.length > 0) {
          const durationMin = Math.round((workout.duration ?? 0) / 60);
          const volPerMuscle = Math.round((durationMin * 10) / meta.muscleGroups.length);
          for (const mg of meta.muscleGroups) {
            if (mg in muscleCounts) {
              muscleCounts[mg as keyof typeof muscleCounts] += volPerMuscle;
            }
          }
        }
      } catch { /* malformed metadata, skip */ }
    }
  });

  return muscleCounts;
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const period = request.nextUrl.searchParams.get('period') || 'month';
    const muscleVolumes = await getMuscleVolume(userId, period);

    return NextResponse.json(muscleVolumes);
  } catch (error) {
    logger.error('Error fetching muscle volume data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}