// ── Generate Repeat Set ──────────────────────────────────────────────────────
// Creates an identical repeat of the previous set — the most common action.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickSetAction, CompletedSetRecord } from '@/types/frictionless-runtime';

/** Generate the "Repeat Previous Set" action.
 *  The #1 most common action in any training session.
 */
export function generateRepeatSet(
  previousSet: CompletedSetRecord,
  setNumber: number,
  exerciseId: string
): QuickSetAction {
  return {
    id: `repeat_${exerciseId}_${setNumber}`,
    type: 'repeat_last',
    label: `✓ Repeat ${previousSet.weight}kg × ${previousSet.reps}`,
    displayWeight: `${previousSet.weight} kg`,
    displayReps: `${previousSet.reps}`,
    weight: previousSet.weight,
    reps: previousSet.reps,
    rir: previousSet.rir,
    isOneTap: true,
    confidence: 0.98,
    reasoning: 'Repeat previous set',
  };
}

/** Generate "Repeat Last Session" action.
 *  Used as the hero action when starting a new session for an exercise.
 */
export function generateRepeatLastSession(
  lastSessionRepresentativeSet: CompletedSetRecord,
  setNumber: number,
  exerciseId: string
): QuickSetAction {
  const { weight, reps } = lastSessionRepresentativeSet;

  return {
    id: `repeat_session_${exerciseId}_${setNumber}`,
    type: 'repeat_last',
    label: `✓ ${weight}kg × ${reps}  (last session)`,
    displayWeight: `${weight} kg`,
    displayReps: `${reps}`,
    weight,
    reps,
    rir: lastSessionRepresentativeSet.rir,
    isOneTap: true,
    confidence: 0.92,
    reasoning: 'Same as last session',
  };
}
