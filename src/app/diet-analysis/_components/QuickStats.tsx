"use client"

interface Props {
  intake: { calories: number; protein: number; carbs: number; fat: number }
  goals: { targetCalories: number; targetProtein: number; targetCarbs: number; targetFat: number }
}

/** Instant-render stats grid — zero fetch, zero skeleton, zero loading gate.
 *  Fixed container sizing, no CLS.
 */
export default function QuickStats({ intake, goals }: Props) {
  const items = [
    { label: "热量", value: Math.round(intake.calories), goal: goals.targetCalories, unit: "kcal", colorClass: "text-primary", barClass: "bg-primary" },
    { label: "碳水", value: Math.round(intake.carbs), goal: goals.targetCarbs, unit: "g", colorClass: "text-recovery", barClass: "bg-recovery" },
    { label: "蛋白质", value: Math.round(intake.protein), goal: goals.targetProtein, unit: "g", colorClass: "text-success", barClass: "bg-success" },
    { label: "脂肪", value: Math.round(intake.fat), goal: goals.targetFat, unit: "g", colorClass: "text-warning", barClass: "bg-warning" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 bg-card border border-border transition-opacity duration-300"
        >
          <div className="text-xs mb-1 text-muted-foreground">{s.label}</div>
          <div className={`text-xl font-black ${s.colorClass}`}>
            {s.value}
            <span className="text-xs ml-0.5 text-muted-foreground/50">{s.unit}</span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${s.barClass}`}
              style={{ width: `${Math.min(100, s.goal > 0 ? (s.value / s.goal) * 100 : 0)}%` }}
            />
          </div>
          <div className="text-[10px] mt-1 text-right text-muted-foreground">
            /{s.goal}{s.unit}
          </div>
        </div>
      ))}
    </div>
  )
}
