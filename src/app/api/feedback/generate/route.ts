import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutId, type } = await request.json();

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId, userId },
      include: { workoutSets: true }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    let totalSets = 0;
    let totalVolume = 0;
    const exercises = new Set<string>();
    workout.workoutSets.forEach(set => {
      totalSets++;
      totalVolume += set.weight * set.reps;
      exercises.add(set.exercise);
    });

    const exercisesText = Array.from(exercises).join(', ');
    const feedbackText = `训练完成！今天完成了 ${exercises.size} 个动作，${totalSets} 组，总训练量 ${totalVolume}kg。主要训练了${exercisesText}。建议下次训练注意充分热身，保持训练节奏。`;

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        workoutId,
        type: type || 'summary',
        content: feedbackText
      }
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
