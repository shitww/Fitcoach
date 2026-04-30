import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const getMuscleVolume = async (userId: string, days: number = 7): Promise<Record<string, number>> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const muscleGroupMapping: Record<string, string[]> = {
    chest: ['chest', 'pectoral', 'bench', 'push'],
    back: ['back', 'lat', 'traps', 'rhomboid', 'pull', 'row'],
    legs: ['legs', 'quads', 'hamstrings', 'glutes', 'calves', 'squat', 'leg'],
    shoulders: ['shoulders', 'delts', 'trap', 'press'],
    arms: ['arms', 'biceps', 'triceps', 'forearm', 'curl', 'extension'],
  };

  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      workoutSets: true,
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
      const muscleGroup = set.muscleGroup?.toLowerCase();
      const setVolume = set.weight * set.reps;

      if (muscleGroup) {
        for (const [group, keywords] of Object.entries(muscleGroupMapping)) {
          if (keywords.some(keyword => muscleGroup.includes(keyword))) {
            muscleCounts[group] += setVolume;
            break;
          }
        }
      } else {
        for (const [group, keywords] of Object.entries(muscleGroupMapping)) {
          if (keywords.some(keyword => exerciseName.includes(keyword))) {
            muscleCounts[group] += setVolume;
            break;
          }
        }
      }
    });
  });

  return muscleCounts;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const muscleVolumes = await getMuscleVolume(userId);

    return NextResponse.json(muscleVolumes);
  } catch (error) {
    logger.error('Error fetching muscle volume data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}