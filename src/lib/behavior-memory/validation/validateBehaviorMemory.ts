// ── Behavior Memory Validation ──────────────────────────────────────────────
// Runtime validation of the complete behavior memory snapshot.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

export interface MemoryValidationError {
  field: string;
  message: string;
}

export interface MemoryValidationResult {
  valid: boolean;
  errors: MemoryValidationError[];
}

/** Validate the complete behavior memory snapshot. */
export function validateBehaviorMemory(
  snapshot: BehaviorMemorySnapshot
): MemoryValidationResult {
  const errors: MemoryValidationError[] = [];

  // Top-level fields
  if (typeof snapshot.version !== 'number' || snapshot.version < 1) {
    errors.push({ field: 'version', message: 'Invalid version number' });
  }
  if (!snapshot.userId || typeof snapshot.userId !== 'string') {
    errors.push({ field: 'userId', message: 'Missing userId' });
  }
  if (!snapshot.createdAt || isNaN(Date.parse(snapshot.createdAt))) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt' });
  }
  if (!snapshot.updatedAt || isNaN(Date.parse(snapshot.updatedAt))) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt' });
  }

  // Workout memory
  const wm = snapshot.workoutMemory;
  if (!wm) {
    errors.push({ field: 'workoutMemory', message: 'Missing workoutMemory' });
  } else {
    if (wm.userId !== snapshot.userId) {
      errors.push({ field: 'workoutMemory.userId', message: 'UserId mismatch' });
    }

    // Timeline
    if (!wm.timeline) {
      errors.push({ field: 'workoutMemory.timeline', message: 'Missing timeline' });
    } else {
      if (wm.timeline.totalSessions !== wm.timeline.sessions.length) {
        errors.push({
          field: 'workoutMemory.timeline.totalSessions',
          message: 'Count mismatch with sessions array',
        });
      }
      for (const session of wm.timeline.sessions) {
        if (!session.workoutId) {
          errors.push({ field: 'workoutMemory.timeline.session', message: 'Missing workoutId' });
        }
        if (!session.date || isNaN(Date.parse(session.date))) {
          errors.push({ field: 'workoutMemory.timeline.session.date', message: 'Invalid date' });
        }
        for (const ex of session.exercises) {
          if (!ex.exerciseName && !ex.exerciseId) {
            errors.push({
              field: 'workoutMemory.timeline.session.exercise',
              message: 'Exercise has no name or id',
            });
          }
        }
      }
    }

    // Recovery snapshot
    if (wm.recoverySnapshot) {
      if (wm.recoverySnapshot.overallRecoveryScore < 0 || wm.recoverySnapshot.overallRecoveryScore > 100) {
        errors.push({
          field: 'workoutMemory.recoverySnapshot.overallRecoveryScore',
          message: 'Must be 0-100',
        });
      }
      for (const group of wm.recoverySnapshot.muscleGroups) {
        if (group.recoveryScore < 0 || group.recoveryScore > 100) {
          errors.push({
            field: 'workoutMemory.recoverySnapshot.muscleGroup.recoveryScore',
            message: 'Must be 0-100',
          });
        }
      }
    }
  }

  // Food memory
  const fm = snapshot.foodMemory;
  if (!fm) {
    errors.push({ field: 'foodMemory', message: 'Missing foodMemory' });
  } else {
    if (fm.userId !== snapshot.userId) {
      errors.push({ field: 'foodMemory.userId', message: 'UserId mismatch' });
    }
    for (const [foodId, snapshot] of Object.entries(fm.foodSnapshots)) {
      if (snapshot.foodId !== foodId) {
        errors.push({
          field: `foodMemory.foodSnapshots[${foodId}]`,
          message: 'Key does not match foodId',
        });
      }
      if (snapshot.totalLogs < 0) {
        errors.push({
          field: `foodMemory.foodSnapshots[${foodId}].totalLogs`,
          message: 'Must be non-negative',
        });
      }
      if (snapshot.frequency30d < 0 || snapshot.frequency7d < 0) {
        errors.push({
          field: `foodMemory.foodSnapshots[${foodId}].frequency`,
          message: 'Must be non-negative',
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
