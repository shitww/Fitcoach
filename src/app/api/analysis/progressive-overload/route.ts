import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const calculateWeeklyVolume = async (userId: string, days: number): Promise<number> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

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

  let totalVolume = 0;
  workouts.forEach(workout => {
    workout.workoutSets.forEach(set => {
      totalVolume += set.weight * set.reps;
    });
  });

  return totalVolume;
};

const getVolumeTrend = async (userId: string, lastDays: number = 7): Promise<Array<{ date: string; volume: number }>> => {
  const endDate = new Date();
  const data = [];

  for (let i = lastDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        workoutSets: true,
      },
    });

    let dailyVolume = 0;
    workouts.forEach(workout => {
      workout.workoutSets.forEach(set => {
        dailyVolume += set.weight * set.reps;
      });
    });

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: dailyVolume,
    });
  }

  return data;
};

const detectPR = async (userId: string): Promise<Array<{ exerciseId: string; exerciseName: string; maxWeight: number; currentWeight: number }>> => {
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
    },
    include: {
      workoutSets: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  const exercisePRs: Record<string, { maxWeight: number; currentWeight: number; exerciseName: string }> = {};

  workouts.forEach(workout => {
    workout.workoutSets.forEach(set => {
      const exerciseName = set.exercise;
      if (!exercisePRs[exerciseName] || set.weight > exercisePRs[exerciseName].maxWeight) {
        exercisePRs[exerciseName] = {
          maxWeight: set.weight,
          currentWeight: 0,
          exerciseName: exerciseName,
        };
      }
    });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWorkouts = workouts.filter(workout => new Date(workout.date) >= today);

  todayWorkouts.forEach(workout => {
    workout.workoutSets.forEach(set => {
      const exerciseName = set.exercise;
      if (set.weight === exercisePRs[exerciseName]?.maxWeight) {
        exercisePRs[exerciseName].currentWeight = set.weight;
      }
    });
  });

  return Object.entries(exercisePRs)
    .filter(([_, pr]) => pr.currentWeight > 0)
    .map(([exerciseName, pr]) => ({
      exerciseId: exerciseName,
      exerciseName: pr.exerciseName,
      maxWeight: pr.maxWeight,
      currentWeight: pr.currentWeight,
    }));
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const thisWeek = await calculateWeeklyVolume(userId, 7);
    const lastWeek = await calculateWeeklyVolume(userId, 14) - thisWeek;

    const trend = await getVolumeTrend(userId);

    const prs = await detectPR(userId);

    return NextResponse.json({
      thisWeekVolume: thisWeek,
      lastWeekVolume: lastWeek,
      volumeTrend: trend,
      newPRs: prs,
    });
  } catch (error) {
    logger.error('Error fetching progressive overload data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}