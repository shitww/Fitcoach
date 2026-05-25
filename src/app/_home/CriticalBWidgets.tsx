import { getDashboardStatusCached, getUserPlansCached } from "@/lib/dashboard"
import TodayWorkoutCard from "@/components/TodayWorkoutCard"

interface Props {
  userId: string
}

export default async function CriticalBWidgets({ userId }: Props) {
  const [status, plans] = await Promise.all([
    getDashboardStatusCached(userId),
    getUserPlansCached(userId),
  ])

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <TodayWorkoutCard
          plans={plans}
          loading={false}
          todayDone={status.todayDone}
          userStatus={status.userStatus}
          coachInsight={status.coachInsight}
        />
      </div>
    </div>
  )
}
