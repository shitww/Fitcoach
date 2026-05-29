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
        <div className="space-y-3">
          <div className="h-6 w-40 rounded-md" style={{ background: "var(--surface-3)" }} />
          <div className="h-4 w-56 rounded-md" style={{ background: "var(--surface-3)" }} />
        </div>
        <div className="h-12 rounded-2xl" style={{ background: "var(--surface-3)" }} />
      </div>
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
