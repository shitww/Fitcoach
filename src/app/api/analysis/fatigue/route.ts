import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

interface FatigueData {
  fatigueScore: number;
  status: 'ready' | 'medium' | 'high';
  statusText: string;
  todayVolume: number;
  recentVolume: number;
  recommendation: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: threeDaysAgo,
        },
      },
      include: {
        workoutSets: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let todayVolume = 0;
    let recentVolume = 0;

    recentWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      let workoutVolume = 0;
      workout.workoutSets.forEach(set => {
        workoutVolume += set.weight * set.reps;
      });

      if (workoutDate.getTime() === today.getTime()) {
        todayVolume = workoutVolume;
      }
      recentVolume += workoutVolume;
    });

    const fatigueScore = Math.round((recentVolume * 0.5) + todayVolume);

    let status: 'ready' | 'medium' | 'high';
    let statusText: string;
    let recommendation: string;

    if (fatigueScore < 5000) {
      status = 'ready';
      statusText = 'Ready';
      recommendation = '状态良好，可以进行高强度训练';
    } else if (fatigueScore < 10000) {
      status = 'medium';
      statusText = 'Medium Fatigue';
      recommendation = '状态一般，建议中等强度训练';
    } else {
      status = 'high';
      statusText = 'High Fatigue';
      recommendation = '状态疲劳，建议休息或轻度活动';
    }

    const fatigueData: FatigueData = {
      fatigueScore,
      status,
      statusText,
      todayVolume: Math.round(todayVolume),
      recentVolume: Math.round(recentVolume),
      recommendation,
    };

    return NextResponse.json(fatigueData);
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}