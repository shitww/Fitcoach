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

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // 一次性获取 14 天数据，避免两次数据库查询
    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        date: { gte: fourteenDaysAgo },
      },
      include: { workoutSets: true },
      orderBy: { date: 'desc' },
    });

    // 计算今日训练量、近3日训练量、历史日均量
    let todayVolume = 0;
    let recentVolume = 0;
    let totalHistoricalVolume = 0;
    let historicalDays = 0;
    const dailyVolumes: number[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayWorkouts = recentWorkouts.filter(w => {
        const wd = new Date(w.date);
        wd.setHours(0, 0, 0, 0);
        return wd.getTime() === d.getTime();
      });

      if (dayWorkouts.length > 0) {
        const dayVol = dayWorkouts.reduce((sum, w) =>
          sum + w.workoutSets.reduce((s, set) =>
            set.type === 'W' ? s : s + set.weight * set.reps, 0), 0);
        dailyVolumes.push(dayVol);
        totalHistoricalVolume += dayVol;
        historicalDays++;

        if (i === 0) todayVolume = dayVol;
        if (i < 3) recentVolume += dayVol;
      }
    }

    // 历史均值排除今日（i=0），避免今日数据自我压制疲劳得分
    const historicalVolumeExcludingToday = totalHistoricalVolume - todayVolume;
    const historicalDaysExcludingToday = todayVolume > 0 ? Math.max(historicalDays - 1, 0) : historicalDays;
    const avgDailyVolume = historicalDaysExcludingToday > 0
      ? historicalVolumeExcludingToday / historicalDaysExcludingToday
      : 0;

    // 新注册用户无历史数据时，默认状态良好（不误报疲劳）
    const todayRatio = avgDailyVolume > 0 ? todayVolume / avgDailyVolume : 0;
    const recentRatio = avgDailyVolume > 0 ? recentVolume / (avgDailyVolume * 3) : 0;

    // 疲劳度评分：0-100，基于相对偏离度
    const fatigueScore = Math.min(100, Math.round(todayRatio * 40 + recentRatio * 60));

    let status: 'ready' | 'medium' | 'high';
    let statusText: string;
    let recommendation: string;

    // 动态阈值：基于用户历史数据计算，而非硬编码
    if (fatigueScore <= 30) {
      status = 'ready';
      statusText = 'Ready';
      recommendation = avgDailyVolume > 0
        ? `状态良好（今日相当于平均水平的${Math.round(todayRatio * 100)}%），可以进行高强度训练`
        : '状态良好，可以进行高强度训练';
    } else if (fatigueScore <= 60) {
      status = 'medium';
      statusText = 'Medium Fatigue';
      recommendation = `状态一般（近3日训练量相当于${Math.round(recentRatio)}倍日均量），建议中等强度训练`;
    } else {
      status = 'high';
      statusText = 'High Fatigue';
      recommendation = `疲劳度较高（近3日训练量相当于${Math.round(recentRatio)}倍日均量），建议休息或轻度活动`;
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
    return NextResponse.json({ error: '获取疲劳度失败，请稍后重试' }, { status: 500 });
  }
}