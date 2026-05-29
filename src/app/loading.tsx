export default function HomeLoading() {
  return (
    <div className="page-shell">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="page-header justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[26px] w-[68px] rounded-md bg-muted animate-pulse" />
          <div className="w-px h-4 bg-border" />
          <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
      </header>

      {/* ── Content ────────────────────────────────────────────── */}
      <main className="page-content space-y-4">
        {/* RuntimeHero skeleton */}
        <div className="rounded-3xl p-6 space-y-4 bg-card border border-border animate-pulse">
          <div className="space-y-3">
            <div className="h-6 w-40 rounded-md bg-muted" />
            <div className="h-4 w-56 rounded-md bg-muted" />
          </div>
          <div className="h-12 rounded-2xl bg-muted" />
        </div>
      </main>
    </div>
  )
}
