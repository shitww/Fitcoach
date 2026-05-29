// ── Build Queue Preview ───────────────────────────────────────────────────────
// Generates next-exercise preview for rest and transition surfaces.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeQueue, RuntimeQueueItem } from './buildRuntimeQueue'

export interface QueuePreview {
  nextExercise: RuntimeQueueItem | null
  exerciseAfterNext: RuntimeQueueItem | null
  remainingAfter: number
  transitionMessage: string | null
}

/** Build a preview for what's coming next in the queue. */
export function buildQueuePreview(queue: RuntimeQueue): QueuePreview {
  const upcoming = queue.items.filter(i => i.status === 'upcoming')
  const nextExercise = upcoming[0] ?? null
  const exerciseAfterNext = upcoming[1] ?? null
  const remainingAfter = Math.max(0, upcoming.length - 1)

  const transitionMessage = buildTransitionMessage(nextExercise, queue)

  return { nextExercise, exerciseAfterNext, remainingAfter, transitionMessage }
}

function buildTransitionMessage(
  next: RuntimeQueueItem | null,
  queue: RuntimeQueue
): string | null {
  if (!next) {
    if (queue.completedCount > 0) return '最后一个动作完成后训练结束'
    return null
  }

  if (next.lastWeight && next.lastReps) {
    return `下一个：${next.displayName} · 上次 ${next.lastWeight}kg × ${next.lastReps}`
  }

  return `下一个：${next.displayName}`
}

/** Get a short progress summary line for the queue header. */
export function getQueueProgressLine(queue: RuntimeQueue): string {
  if (queue.totalItems === 0) return ''
  if (queue.completedCount === 0) return `${queue.totalItems} 个动作`
  if (queue.remainingCount === 0) return `全部 ${queue.totalItems} 个动作完成`
  return `${queue.completedCount}/${queue.totalItems} 完成`
}
