"use client";

import { useRouter } from "next/navigation";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import {
  RuntimeHero,
  ReadinessSurface,
  RecoveryProjection,
  TodayMomentum,
  RuntimeFeed,
} from "@/components/runtime-home";
import type { DashboardBootstrap } from "@/lib/dashboard-bootstrap";

interface Props {
  bootstrap: DashboardBootstrap;
  userId: string;
}

function getHeadline(quickEntry: DashboardBootstrap["quickEntry"]) {
  if (quickEntry.isRestDay) return "今天休息日";
  if (quickEntry.todayDone) return "今日训练完成";
  if (quickEntry.todayPlanDay) return quickEntry.todayPlanDay.dayName;
  return "准备好训练了吗";
}

function getSubheadline(quickEntry: DashboardBootstrap["quickEntry"], recovery: DashboardBootstrap["recovery"]) {
  if (quickEntry.todayDone) return quickEntry.coachInsight || "恢复中，明天继续";
  if (recovery.fatigueLevel === "high") return "疲劳较高，建议轻量恢复";
  if (recovery.fatigueLevel === "medium") return "状态良好，可以训练";
  if (recovery.daysSinceLastWorkout > 3) return "几天没练了，动起来吧";
  return quickEntry.coachInsight || "保持节奏，继续进步";
}

export default function HomeRuntimeIsland({ bootstrap, userId }: Props) {
  const router = useRouter();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;

  const { quickEntry, progress, recovery } = bootstrap;

  // Readiness: inverse of fatigue + recency bonus
  const readiness = Math.max(0.1, 1 - recovery.fatigueScore / 100 + (recovery.daysSinceLastWorkout > 2 ? 0.1 : 0));

  // Muscle group readiness projection
  const muscleGroups = [
    { name: "胸部", readiness: Math.max(0.2, 1 - recovery.fatigueScore / 120), status: recovery.fatigueScore > 60 ? "fatigued" as const : "ready" as const },
    { name: "背部", readiness: Math.max(0.2, 1 - recovery.fatigueScore / 110), status: recovery.fatigueScore > 55 ? "recovering" as const : "ready" as const },
    { name: "腿部", readiness: Math.max(0.2, 1 - recovery.fatigueScore / 130), status: recovery.fatigueScore > 65 ? "fatigued" as const : "ready" as const },
    { name: "肩部", readiness: Math.max(0.2, 1 - recovery.fatigueScore / 100), status: recovery.fatigueScore > 50 ? "recovering" as const : "ready" as const },
  ];

  // Runtime feed items
  const feedItems = [
    {
      id: "1",
      type: "recommendation" as const,
      message: quickEntry.todayPlanDay
        ? `今日计划：${quickEntry.todayPlanDay.exercises.slice(0, 3).join("、")}`
        : "自由训练，选择你喜欢的动作",
      detail: quickEntry.coachInsight,
      timestamp: "现在",
    },
    {
      id: "2",
      type: "insight" as const,
      message: recovery.fatigueLevel === "high"
        ? "疲劳累积，建议降低强度"
        : "恢复良好，可以尝试突破",
      timestamp: "",
    },
    {
      id: "3",
      type: "recovery" as const,
      message: recovery.daysSinceLastWorkout === 0
        ? "今天已训练"
        : recovery.daysSinceLastWorkout === 1
        ? "昨天训练过，恢复中"
        : `上次训练 ${recovery.daysSinceLastWorkout} 天前`,
      timestamp: "",
    },
  ];

  const recentExercise = bootstrap.recentExercises[0];

  return (
    <div className="pb-6">
      <RuntimeHero
        headline={getHeadline(quickEntry)}
        subheadline={getSubheadline(quickEntry, recovery)}
        readinessPct={readiness}
        onStart={() => router.push("/workout")}
        isTrainingActive={hasActiveSession}
        onResume={() => router.push("/workout")}
      />

      <ReadinessSurface
        readiness={readiness}
        recovery={1 - recovery.fatigueScore / 100}
        fatigue={recovery.fatigueScore / 100}
        lastWorkoutDays={recovery.daysSinceLastWorkout}
      />

      <RecoveryProjection muscleGroups={muscleGroups} />

      <TodayMomentum
        streak={progress.currentStreak}
        totalSetsThisWeek={progress.weeklyWorkouts * 5}
        weeklyGoal={15}
        lastPr={recentExercise ? `${recentExercise.weight > 0 ? recentExercise.weight + "kg" : "自重"} × ${recentExercise.reps}` : undefined}
      />

      <RuntimeFeed items={feedItems} />
    </div>
  );
}
