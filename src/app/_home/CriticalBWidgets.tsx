"use client"

import { useState, useEffect } from "react"
import TodayWorkoutCard from "@/components/TodayWorkoutCard"

interface Props {
  userId: string
}

export default function CriticalBWidgets({ userId }: Props) {
  const [status, setStatus] = useState<any>(undefined)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    Promise.allSettled([
      fetch('/api/dashboard/status', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch('/api/plans', { credentials: 'include' }).then(r => r.ok ? r.json() : { plans: [] }),
    ]).then(([statusRes, plansRes]) => {
      if (statusRes.status === 'fulfilled' && statusRes.value) setStatus(statusRes.value)
      if (plansRes.status === 'fulfilled' && plansRes.value?.plans) setPlans(plansRes.value.plans)
    })
  }, [userId])

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <TodayWorkoutCard
          plans={plans}
          loading={status === undefined}
          todayDone={status?.todayDone ?? false}
          userStatus={status?.userStatus}
          coachInsight={status?.coachInsight}
        />
      </div>
    </div>
  )
}
