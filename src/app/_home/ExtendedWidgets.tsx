import { getExtendedDashboardDataCached } from "@/lib/dashboard"
import NutritionCard from "@/components/NutritionCard"

interface Props {
  userId: string
}

export default async function ExtendedWidgets({ userId }: Props) {
  const data = await getExtendedDashboardDataCached(userId)

  return (
    <div className="staged-reveal">
      <div className="reveal-item" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <NutritionCard
          settings={{
            targetCalories: data.nutrition.targetCalories,
            targetProtein: data.nutrition.targetProtein,
          }}
          dietSummary={data.dietSummary}
        />
      </div>
    </div>
  )
}
