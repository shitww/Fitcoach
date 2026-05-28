"use client"

// ── Base pulse ────────────────────────────────────────────────────────────────
function Pulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
  )
}

// ── SkeletonCard — generic stat/info card ─────────────────────────────────────
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-primary p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-4 h-4 rounded-full" />
        <Pulse className="w-24 h-3.5" />
      </div>
      <Pulse className="w-full h-4 mb-2" />
      <Pulse className="w-4/5 h-4 mb-2" />
      <Pulse className="w-3/5 h-4" />
    </div>
  )
}

// ── SkeletonChart ─────────────────────────────────────────────────────────────
export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <div className={`card-primary p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-4 h-4 rounded-full" />
        <Pulse className="w-28 h-3.5" />
      </div>
      <Pulse className="w-full h-52" />
    </div>
  )
}

// ── SkeletonList — row list ───────────────────────────────────────────────────
export function SkeletonList({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`card-primary overflow-hidden ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3.5 ${i < rows - 1 ? 'border-b border-border' : ''}`}
        >
          <Pulse className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="w-32 h-3" />
            <Pulse className="w-20 h-2.5" />
          </div>
          <Pulse className="w-12 h-4 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ── SkeletonScoreCard — large AI score card ────────────────────────────────────
export function SkeletonScoreCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-primary p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <Pulse className="w-4 h-4 rounded-full" />
        <Pulse className="w-24 h-3.5" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Pulse className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <Pulse key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => <Pulse key={i} className="h-10 w-full" />)}
      </div>
      <Pulse className="w-full h-14 mt-4" />
    </div>
  )
}

// ── SkeletonStatGrid — N-column stat grid ─────────────────────────────────────
export function SkeletonStatGrid({ cols = 4, className = "" }: { cols?: number; className?: string }) {
  return (
    <div className={`card-grid-${cols as 2 | 3 | 4} ${className}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="metric-compact">
          <Pulse className="w-10 h-2.5 mb-3" />
          <Pulse className="w-14 h-6 mb-1" />
          <Pulse className="w-8 h-2" />
        </div>
      ))}
    </div>
  )
}

// ── SkeletonRingRow — 4 nutrition rings ──────────────────────────────────────
export function SkeletonRingRow({ className = "" }: { className?: string }) {
  return (
    <div className={`card-secondary p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Pulse className="w-24 h-3.5" />
        <Pulse className="w-6 h-6 rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Pulse className="w-[70px] h-[70px] rounded-full" />
            <Pulse className="w-10 h-2.5" />
          </div>
        ))}
      </div>
    </div>
  )
}
