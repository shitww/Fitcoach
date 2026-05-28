import { auth } from "@/lib/auth"
import { getNutritionSettings, getTodayFoodLogs } from "@/lib/dashboard"
import NutritionCard from "@/components/NutritionCard"

export default async function HomeDeferredIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  const [{ summary: dietSummary }, goals] = await Promise.all([
    getTodayFoodLogs(userId).catch(() => ({ logs: [], summary: { calories: 0, protein: 0, carbs: 0, fat: 0 } })),
    getNutritionSettings(userId).catch(() => ({ targetCalories: 2000, targetProtein: 60, targetCarbs: 250, targetFat: 65, waterGoal: 2000 })),
  ])

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <NutritionCard
          settings={{
            targetCalories: goals.targetCalories,
            targetProtein: goals.targetProtein,
          }}
          dietSummary={dietSummary ?? null}
        />
      </div>
    </div>
  )
}
