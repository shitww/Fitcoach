import { auth } from "@/lib/auth"
import { getDashboardSnapshot } from "@/lib/kv/dashboard"
import { createDefaultDashboardStatus } from "@/lib/dashboard"
import { getDashboardBootstrapCached } from "@/lib/dashboard-bootstrap"
import StreakCard from "@/components/StreakCard"
import DashboardMeta from "@/components/DashboardMeta"
import HomeHero from "./HomeHero"
import ConsistencyRhythmCard from "./ConsistencyRhythmCard"

export default async function HomeCriticalIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  // Layer A — Critical Instant: fetch in parallel, render as one streaming unit
  const [snapshot, bootstrap] = await Promise.all([
    getDashboardSnapshot(userId).catch(() => null),
    getDashboardBootstrapCached(userId).catch(() => null),
  ])

  const instantStatus = snapshot?.data ?? createDefaultDashboardStatus()

  return (
    <>
      {/* Streak — above the fold, instant */}
      <div className="staged-reveal">
        <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
          {snapshot?.stale && <DashboardMeta updatedAt={snapshot.updatedAt} />}
          <StreakCard data={instantStatus} loading={false} />
          {bootstrap && (
            <ConsistencyRhythmCard
              progress={bootstrap.progress}
              recovery={bootstrap.recovery}
            />
          )}
        </div>
      </div>

      {/* Hero — CTA + metrics + recent exercises */}
      {bootstrap && <HomeHero bootstrap={bootstrap} userId={userId} />}
    </>
  )
}
