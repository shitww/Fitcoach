import QuickWorkoutEntry from "./QuickWorkoutEntry"
import HeroMetricsRow from "./HeroMetricsRow"
import RecentExercisesStrip from "./RecentExercisesStrip"
import LiveWorkoutResume from "./LiveWorkoutResume"
import type { DashboardBootstrap } from "@/lib/dashboard-bootstrap"

interface Props {
  bootstrap: DashboardBootstrap
  userId: string
}

/** Homepage Hero — Progressive Stable Rendering Architecture.
 *
 *  Server-rendered shell with stable placeholders.
 *  Client islands hydrate independently:
 *    - QuickWorkoutEntry  (instant, no fetch)
 *    - HeroMetricsRow     (progressive fade-in)
 *    - RecentExercisesStrip (cache-first SWR)
 *    - LiveWorkoutResume  (isolated, mounts only when session active)
 */
export default function HomeHero({ bootstrap, userId }: Props) {
  return (
    <section className="mb-2">
      {/* Critical CTA — always rendered server-side, 0ms clickable */}
      <QuickWorkoutEntry data={bootstrap.quickEntry} />

      {/* Live session overlay — client island, isolated refresh */}
      <LiveWorkoutResume />

      {/* Secondary metrics — stable height, progressive enhancement */}
      <HeroMetricsRow progress={bootstrap.progress} recovery={bootstrap.recovery} />

      {/* Recent exercises — cache-first, background refresh */}
      <RecentExercisesStrip initial={bootstrap.recentExercises} userId={userId} />
    </section>
  )
}
