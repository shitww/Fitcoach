export default function CriticalBSkeleton() {
  return (
    <div className="staged-reveal">
      <div className="reveal-item mb-5 p-5 rounded-2xl animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 rounded" style={{ background: "var(--surface-2)" }} />
          <div className="h-5 w-14 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
        <div className="h-5 w-40 rounded mb-1" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-28 rounded mb-4" style={{ background: "var(--surface-3)" }} />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 rounded-full" style={{ background: "var(--surface-2)" }} />
          ))}
        </div>
        <div className="h-12 w-full rounded-xl" style={{ background: "var(--surface-2)" }} />
      </div>
    </div>
  )
}
