import { auth } from "@/lib/auth"
import { getDashboardSnapshot } from "@/lib/kv/dashboard"
import { createDefaultDashboardStatus } from "@/lib/dashboard"
import HomeShell from "./_home/HomeShell"
import CriticalBWidgets from "./_home/CriticalBWidgets"
import ExtendedWidgets from "./_home/ExtendedWidgets"
import UnauthenticatedContent from "./_home/UnauthenticatedContent"
import DashboardMeta from "@/components/DashboardMeta"
import StreakCard from "@/components/StreakCard"

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  if (!userId) return <UnauthenticatedContent />

  // Critical-A: instant paint, zero Prisma (cached or safe defaults)
  const snapshot = await getDashboardSnapshot(userId)
  const instantStatus = snapshot?.data ?? createDefaultDashboardStatus()

  return (
    <HomeShell>
      {/* Critical-A: instant — server-rendered streak, no skeleton */}
      <div className="staged-reveal">
        <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
          {snapshot?.stale && (
            <DashboardMeta updatedAt={snapshot.updatedAt} />
          )}
          <StreakCard data={instantStatus} loading={false} />
        </div>
      </div>

      {/* Critical-B: plans + status — client-side offline-first cache */}
      <CriticalBWidgets userId={userId} />

      {/* Extended: nutrition — client-side offline-first cache */}
      <ExtendedWidgets userId={userId} />
    </HomeShell>
  )
}
