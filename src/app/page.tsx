import { Suspense } from "react"
import { auth } from "@/lib/auth"
import HomeShell from "./_home/HomeShell"
import HomeCriticalIsland from "./_home/HomeCriticalIsland"
import HomeDeferredIsland from "./_home/HomeDeferredIsland"
import UnauthenticatedContent from "./_home/UnauthenticatedContent"

function CriticalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Streak */}
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-28 rounded-lg bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-muted" />
          ))}
        </div>
      </div>
      {/* Hero */}
      <section className="mb-2 space-y-3">
        <div className="rounded-2xl p-4 bg-card border border-border space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded-md bg-muted" />
              <div className="h-3 w-32 rounded-md bg-muted" />
            </div>
            <div className="h-10 w-24 rounded-xl bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-border space-y-2 animate-pulse">
            <div className="h-3 w-16 rounded-md bg-muted" />
            <div className="h-8 w-12 rounded-md bg-muted" />
            <div className="h-1.5 w-full rounded-full bg-muted" />
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border space-y-2 animate-pulse">
            <div className="h-3 w-16 rounded-md bg-muted" />
            <div className="h-8 w-12 rounded-md bg-muted" />
            <div className="h-1.5 w-full rounded-full bg-muted" />
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 rounded-xl px-4 py-2 bg-card border border-border animate-pulse">
              <div className="h-3 w-16 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function DeferredSkeleton() {
  return (
    <div className="rounded-2xl p-4 bg-card border border-border space-y-3 animate-pulse">
      <div className="h-4 w-20 rounded-md bg-muted" />
      <div className="h-8 w-16 rounded-md bg-muted" />
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="h-3 w-24 rounded-md bg-muted" />
    </div>
  )
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return <UnauthenticatedContent />

  return (
    <HomeShell>
      {/* Layer A — Critical Instant: streak + hero grouped into one streaming unit */}
      <Suspense fallback={<CriticalSkeleton />}>
        <HomeCriticalIsland />
      </Suspense>

      {/* Layer B — Deferred: nutrition data streams after critical paint */}
      <Suspense fallback={<DeferredSkeleton />}>
        <HomeDeferredIsland />
      </Suspense>
    </HomeShell>
  )
}
