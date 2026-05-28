import { auth } from "@/lib/auth"
import { getDashboardSnapshot } from "@/lib/kv/dashboard"
import { createDefaultDashboardStatus } from "@/lib/dashboard"
import StreakCard from "@/components/StreakCard"
import DashboardMeta from "@/components/DashboardMeta"

export default async function StreakCardIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  const snapshot = await getDashboardSnapshot(userId)
  const data = snapshot?.data ?? createDefaultDashboardStatus()

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        {snapshot?.stale && <DashboardMeta updatedAt={snapshot.updatedAt} />}
        <StreakCard data={data} loading={false} />
      </div>
    </div>
  )
}
