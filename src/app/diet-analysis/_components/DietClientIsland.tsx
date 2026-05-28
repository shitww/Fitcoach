import { auth } from "@/lib/auth"
import { getDietAnalysisBootstrapCached } from "@/lib/diet-analysis"
import DietClient from "./DietClient"

export default async function DietClientIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  const bootstrap = await getDietAnalysisBootstrapCached(userId)
  return (
    <DietClient
      initialIntake={bootstrap.intake}
      initialGoals={bootstrap.goals}
      initialWeeklyDays={bootstrap.weeklyDays}
    />
  )
}
