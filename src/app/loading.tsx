export default function HomeLoading() {
  return (
    <div className="page-shell">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="page-header justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[26px] w-[68px] rounded-md bg-muted animate-pulse" />
          <div className="w-px h-4 bg-border" />
          <div className="h-3 w-12 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
      </header>

      {/* ── Content ────────────────────────────────────────────── */}
      <main className="page-content space-y-4">
        {/* StreakCard skeleton */}
        <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-28 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* QuickWorkoutEntry skeleton */}
        <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-24 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>

        {/* HeroMetricsRow skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
            <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-12 rounded-md bg-muted animate-pulse" />
            <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
            <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-12 rounded-md bg-muted animate-pulse" />
            <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
          </div>
        </div>

        {/* RecentExercisesStrip skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 rounded-xl px-4 py-2 bg-card border border-border">
                <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* NutritionCard skeleton */}
        <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
          <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
          <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
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
