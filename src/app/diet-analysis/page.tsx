import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import BottomTabBar from "@/components/BottomTabBar"
import QuickStatsIsland from "./_components/QuickStatsIsland"
import DietClientIsland from "./_components/DietClientIsland"
import { Utensils } from "lucide-react"
import Link from "next/link"

function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 bg-card border border-border space-y-2 animate-pulse">
          <div className="h-3 w-10 rounded-md bg-muted" />
          <div className="h-6 w-14 rounded-md bg-muted" />
          <div className="h-1.5 w-full rounded-full bg-muted" />
          <div className="h-2 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  )
}

function DietClientSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-around mb-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-20 h-20 rounded-full bg-muted" />
            <div className="h-2 w-8 rounded-md bg-muted" />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 rounded-md bg-muted" />
                <div className="h-2 w-32 rounded-md bg-muted" />
              </div>
            </div>
            <div className="h-4 w-4 rounded-md bg-muted" />
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded-md bg-muted" />
          <div className="h-3 w-28 rounded-md bg-muted" />
        </div>
        <div className="h-44 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

export default async function DietAnalysisPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) redirect("/auth/signin")

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
        <Suspense fallback={<QuickStatsSkeleton />}>
          <QuickStatsIsland />
        </Suspense>
        <Suspense fallback={<DietClientSkeleton />}>
          <DietClientIsland />
        </Suspense>
      </PageContent>
      <BottomTabBar active="diet" />
    </PageShell>
  )
}
