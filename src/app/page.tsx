import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getDashboardBootstrapCached } from "@/lib/dashboard-bootstrap"
import HomeShell from "./_home/HomeShell"
import HomeRuntimeIsland from "./_home/HomeRuntimeIsland"
import UnauthenticatedContent from "./_home/UnauthenticatedContent"

function RuntimeSkeleton() {
  return (
    <div className="space-y-4 animate-pulse px-5">
      <div className="rounded-3xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[120px] rounded-full" style={{ background: "var(--surface-3)" }} />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 rounded-md" style={{ background: "var(--surface-3)" }} />
            <div className="h-3 w-40 rounded-md" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>
        <div className="h-12 rounded-2xl" style={{ background: "var(--surface-3)" }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-4 h-20" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
        <div className="rounded-2xl p-4 h-20" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
      </div>
      <div className="rounded-2xl p-4 h-32" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
    </div>
  )
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return <UnauthenticatedContent />

  const bootstrap = await getDashboardBootstrapCached(userId).catch(() => null)

  return (
    <HomeShell>
      {bootstrap ? (
        <HomeRuntimeIsland bootstrap={bootstrap} userId={userId} />
      ) : (
        <RuntimeSkeleton />
      )}
    </HomeShell>
  )
}
