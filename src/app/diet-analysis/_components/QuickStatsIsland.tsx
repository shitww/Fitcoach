import { auth } from "@/lib/auth"
import { getDietAnalysisBootstrapCached } from "@/lib/diet-analysis"
import QuickStats from "./QuickStats"

export default async function QuickStatsIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  const bootstrap = await getDietAnalysisBootstrapCached(userId)
  return <QuickStats intake={bootstrap.intake} goals={bootstrap.goals} />
}
