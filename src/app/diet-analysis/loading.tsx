export default function DietAnalysisLoading() {
  return (
    <div className="page-shell">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="page-header justify-between">
        <h1 className="text-base font-bold text-foreground truncate leading-tight">饮食分析</h1>
        <div className="h-8 w-16 rounded-xl bg-muted animate-pulse" />
      </header>

      {/* ── Content ────────────────────────────────────────────── */}
      <main className="page-content space-y-4">
        {/* QuickStats skeleton — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 bg-card border border-border space-y-2">
              <div className="h-3 w-10 rounded-md bg-muted animate-pulse" />
              <div className="h-6 w-14 rounded-md bg-muted animate-pulse" />
              <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
              <div className="h-2 w-16 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* DietClient skeleton — large card area */}
        <div className="rounded-2xl p-4 bg-card border border-border space-y-4">
          {/* Score arc row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
          </div>
          <div className="flex justify-around mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                <div className="h-2 w-8 rounded-md bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          {/* AI Gap cards */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
                    <div className="h-2 w-32 rounded-md bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-4 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          ))}

          {/* Weekly trends chart skeleton */}
          <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded-md bg-muted animate-pulse" />
              <div className="h-3 w-28 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="h-44 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </main>

      {/* ── BottomTabBar skeleton ──────────────────────────────── */}
      <nav
        aria-label="底部导航"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 safe-bottom"
        style={{
          background: 'color-mix(in srgb, rgb(var(--background)) 85%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-1">
          <div className="flex items-center justify-around py-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[3.5rem]">
                <div className="w-5 h-5 rounded-md bg-muted animate-pulse" />
                <div className="h-2 w-6 rounded-md bg-muted animate-pulse mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
