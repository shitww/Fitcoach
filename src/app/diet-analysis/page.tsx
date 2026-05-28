import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDietAnalysisBootstrapCached } from "@/lib/diet-analysis"
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import BottomTabBar from "@/components/BottomTabBar"
import QuickStats from "./_components/QuickStats"
import DietClient from "./_components/DietClient"
import { Utensils } from "lucide-react"
import Link from "next/link"

export default async function DietAnalysisPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  if (!userId) {
    redirect("/auth/signin")
  }

  const bootstrap = await getDietAnalysisBootstrapCached(userId)

  return (
    <PageShell>
      <PageHeader
        title="饮食分析"
        action={
          <Link
            href="/diet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm text-primary-foreground bg-primary hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Utensils className="w-3.5 h-3.5" />
            记录
          </Link>
        }
      />
      <PageContent>
        <QuickStats intake={bootstrap.intake} goals={bootstrap.goals} />
        <DietClient
          initialIntake={bootstrap.intake}
          initialGoals={bootstrap.goals}
          initialWeeklyDays={bootstrap.weeklyDays}
        />
      </PageContent>
      <BottomTabBar active="diet" />
    </PageShell>
  )
}
