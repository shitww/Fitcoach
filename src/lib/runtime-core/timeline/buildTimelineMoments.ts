// ── Build Timeline Moments ────────────────────────────────────────────────────
// Semantic moment detection: peaks, fatigue signals, chapters.
// Used for Training Story surface and emotional feedback.
// ─────────────────────────────────────────────────────────────────────────────

import type { TimelineMoment } from './buildWorkoutTimeline'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import { getWorkingSets } from '../reducers/reduceExerciseRuntime'

export interface SemanticMoment {
  type: 'pr' | 'peak_volume' | 'consistency' | 'fatigue' | 'comeback'
  exerciseName: string
  label: string
  detail: string
}

/** Detect semantic narrative moments from a session snapshot. */
export function detectSemanticMoments(
  snapshot: WorkoutRuntimeSnapshot
): SemanticMoment[] {
  const moments: SemanticMoment[] = []

  for (const ex of snapshot.exercises) {
    const working = getWorkingSets(ex)
    if (working.length === 0) continue

    const maxWeight = Math.max(...working.map(s => s.weight))
    const maxVolume = Math.max(...working.map(s => s.weight * s.reps))

    // PR detection
    if (snapshot.prResults.some(pr => pr.exerciseName === ex.name)) {
      const pr = snapshot.prResults.find(pr => pr.exerciseName === ex.name)!
      moments.push({
        type: 'pr',
        exerciseName: ex.name,
        label: `${ex.name.split(' (')[0]} — 新纪录`,
        detail: pr.display,
      })
    }

    // Consistency: same weight/reps all sets
    if (working.length >= 3) {
      const allSame = working.every(s => s.weight === working[0].weight && s.reps === working[0].reps)
      if (allSame) {
        moments.push({
          type: 'consistency',
          exerciseName: ex.name,
          label: `${ex.name.split(' (')[0]} — 稳定输出`,
          detail: `${working.length} 组 ${maxWeight > 0 ? maxWeight + 'kg' : '自重'} × ${working[0].reps}`,
        })
      }
    }

    // Fatigue signal: RIR 0 or failure
    const failureSets = working.filter(s => s.isFailure || s.rir === 0)
    if (failureSets.length > 0) {
      moments.push({
        type: 'fatigue',
        exerciseName: ex.name,
        label: `${ex.name.split(' (')[0]} — 力竭组`,
        detail: `第 ${working.indexOf(failureSets[0]) + 1} 组达到力竭`,
      })
    }
  }

  return moments
}

/** Compute chapter summaries per exercise from moments. */
export function buildExerciseChapters(
  moments: TimelineMoment[]
): Array<{ exerciseName: string; sets: TimelineMoment[]; restTotal: number }> {
  const byExercise = new Map<string, { sets: TimelineMoment[]; restTotal: number }>()

  for (const m of moments) {
    if (!m.exerciseName || m.type === 'rest') continue
    if (!byExercise.has(m.exerciseName)) {
      byExercise.set(m.exerciseName, { sets: [], restTotal: 0 })
    }
    if (m.type === 'work_set') {
      byExercise.get(m.exerciseName)!.sets.push(m)
    }
  }

  // Tally rest periods
  for (const m of moments) {
    if (m.type !== 'rest' || !m.endMs) continue
    const restDur = m.endMs - m.startMs
    // Attribute rest to the exercise that preceded it
    const prevSet = [...moments]
      .reverse()
      .find(mm => mm.startMs < m.startMs && mm.type === 'work_set')
    if (prevSet?.exerciseName) {
      const chapter = byExercise.get(prevSet.exerciseName)
      if (chapter) chapter.restTotal += restDur
    }
  }

  return [...byExercise.entries()].map(([name, data]) => ({
    exerciseName: name,
    ...data,
  }))
}
