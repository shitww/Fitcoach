                       "use client";

import { useRouter } from "next/navigation";
import { useWorkoutTimer } from "@/stores/workoutTimer";
import { RuntimeHero } from "@/components/runtime-home";
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

export default function HomeRuntimeIsland({ bootstrap }: Props) {
  const router = useRouter();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;

  const { quickEntry, recovery } = bootstrap;

  return (
    <div className="pb-6">
      <RuntimeHero
        headline={getHeadline(quickEntry)}
        subheadline={getSubheadline(quickEntry, recovery)}
        onStart={() => router.push("/workout")}
        isTrainingActive={hasActiveSession}
        onResume={() => router.push("/workout")}
      />
    </div>
  );
}
