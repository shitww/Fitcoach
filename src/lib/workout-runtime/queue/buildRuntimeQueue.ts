// ── Build Runtime Queue ───────────────────────────────────────────────────────
// Constructs the ordered exercise queue for the current session.
// Drives the Runtime Queue Rail UI.
// ─────────────────────────────────────────────────────────────────────────────

export type QueueItemStatus =
  | 'completed'    // sets done, moved on
  | 'active'       // currently performing
  | 'upcoming'     // in queue, not started
  | 'skipped'      // user skipped

export interface RuntimeQueueItem {
  id: string
  exerciseName: string
  displayName: string          // truncated for rail display
  status: QueueItemStatus
  setsLogged: number
  targetSets: number
  lastWeight: number | null    // preview for upcoming items
  lastReps: number | null
}

export interface RuntimeQueue {
  items: RuntimeQueueItem[]
  currentIndex: number
  totalItems: number
  completedCount: number
  remainingCount: number
  progressPct: number          // 0–100
}

/** Build the runtime queue from session exercise data. */
export function buildRuntimeQueue(params: {
  exerciseNames: string[]
  currentExercise: string | null
  setsPerExercise: Record<string, number>       // name → sets logged
  targetSetsPerExercise: Record<string, number> // name → target sets
  lastWeights: Record<string, number | null>
  lastReps: Record<string, number | null>
  skipped?: Set<string>
}): RuntimeQueue {
  const {
    exerciseNames, currentExercise,
    setsPerExercise, targetSetsPerExercise,
    lastWeights, lastReps, skipped = new Set(),
  } = params

  const items: RuntimeQueueItem[] = exerciseNames.map((name, i) => {
    const setsLogged = setsPerExercise[name] ?? 0
    const targetSets = targetSetsPerExercise[name] ?? 3
    const isActive = name === currentExercise
    const isSkipped = skipped.has(name)
    const isCompleted = !isActive && !isSkipped && setsLogged >= targetSets && setsLogged > 0

    let status: QueueItemStatus
    if (isSkipped) status = 'skipped'
    else if (isCompleted) status = 'completed'
    else if (isActive) status = 'active'
    else status = 'upcoming'

    return {
      id: `${name}-${i}`,
      exerciseName: name,
      displayName: truncateExerciseName(name),
      status,
      setsLogged,
      targetSets,
      lastWeight: lastWeights[name] ?? null,
      lastReps: lastReps[name] ?? null,
    }
  })

  const completedCount = items.filter(i => i.status === 'completed').length
  const currentIndex = items.findIndex(i => i.status === 'active')
  const remainingCount = items.filter(i => i.status === 'upcoming').length
  const totalItems = items.length
  const progressPct = totalItems > 0
    ? Math.round((completedCount / totalItems) * 100)
    : 0

  return {
    items,
    currentIndex: Math.max(0, currentIndex),
    totalItems,
    completedCount,
    remainingCount,
    progressPct,
  }
}

function truncateExerciseName(name: string): string {
  // Remove parenthetical suffixes e.g. "卧推 (哑铃)" → "卧推"
  const base = name.split(' (')[0]
  // Truncate long names for rail display
  if (base.length > 6) return base.slice(0, 6) + '…'
  return base
}
