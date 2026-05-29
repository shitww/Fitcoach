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

function getSubheadline(quickEntry: DashboardBootstrap["quickEntry"]) {
  if (quickEntry.todayDone) return "好好休息，明天继续";
  if (quickEntry.isRestDay) return "享受你的休息日";
  if (quickEntry.todayPlanDay) return `今日计划：${quickEntry.todayPlanDay.exercises.length} 个动作`;
  return "开始今天的训练";
}

export default function HomeRuntimeIsland({ bootstrap }: Props) {
  const router = useRouter();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;

  const { quickEntry } = bootstrap;

  return (
    <div className="pb-6">
      <RuntimeHero
        headline={getHeadline(quickEntry)}
        subheadline={getSubheadline(quickEntry)}
        onStart={() => router.push("/workout")}
        isTrainingActive={hasActiveSession}
        onResume={() => router.push("/workout")}
      />
    </div>
  );
}
