// ── Corruption Detection ────────────────────────────────────────────────────
// Detects structural corruption, data inconsistencies, and broken references.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

export interface CorruptionReport {
  corrupted: boolean;
  issues: string[];
  severity: 'critical' | 'warning' | 'info';
}

/** Detect common corruption patterns in behavior memory. */
export function detectCorruptedMemory(
  snapshot: BehaviorMemorySnapshot
): CorruptionReport {
  const issues: string[] = [];
  let severity: CorruptionReport['severity'] = 'info';

  // 1. Check for null/undefined at top level
  if (!snapshot) {
    return { corrupted: true, issues: ['Snapshot is null or undefined'], severity: 'critical' };
  }

  // 2. Check version compatibility
  if (typeof snapshot.version !== 'number') {
    issues.push('Missing version field');
    severity = 'critical';
  }

  // 3. Check timeline consistency
  const wm = snapshot.workoutMemory;
  if (wm?.timeline) {
    const sessionIds = new Set<string>();
    for (const session of wm.timeline.sessions) {
      if (sessionIds.has(session.workoutId)) {
        issues.push(`Duplicate workoutId: ${session.workoutId}`);
        severity = severity === 'critical' ? 'critical' : 'warning';
      }
      sessionIds.add(session.workoutId);

      // Check exercise order consistency
      const orderIndices = session.exercises.map((e) => e.orderIndex);
      const sortedIndices = [...orderIndices].sort((a, b) => a - b);
      if (JSON.stringify(orderIndices) !== JSON.stringify(sortedIndices)) {
        issues.push(`Unordered exercises in session ${session.workoutId}`);
        severity = 'warning';
      }

      // Check for negative values
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (set.weight < 0 || set.reps < 0) {
            issues.push(`Negative weight/reps in ${session.workoutId}`);
            severity = 'warning';
          }
        }
      }
    }
  }

  // 4. Check exercise snapshot consistency
  if (wm?.exerciseSnapshots) {
    for (const [key, exSnap] of Object.entries(wm.exerciseSnapshots)) {
      if (exSnap.totalSessions < 0) {
        issues.push(`Negative totalSessions for ${key}`);
        severity = 'warning';
      }
      if (exSnap.recentFrequency > exSnap.totalSessions) {
        issues.push(`Recent frequency exceeds total for ${key}`);
        severity = 'warning';
      }
      if (exSnap.lastPerformedAt && isNaN(Date.parse(exSnap.lastPerformedAt))) {
        issues.push(`Invalid lastPerformedAt for ${key}`);
        severity = 'warning';
      }
    }
  }

  // 5. Check food snapshot consistency
  const fm = snapshot.foodMemory;
  if (fm?.foodSnapshots) {
    for (const [key, foodSnap] of Object.entries(fm.foodSnapshots)) {
      if (foodSnap.totalLogs < 0) {
        issues.push(`Negative totalLogs for ${key}`);
        severity = 'warning';
      }
      if (foodSnap.frequency30d > foodSnap.totalLogs) {
        issues.push(`frequency30d exceeds totalLogs for ${key}`);
        severity = 'warning';
      }
    }
  }

  // 6. Check for impossible recovery states
  if (wm?.recoverySnapshot) {
    for (const group of wm.recoverySnapshot.muscleGroups) {
      if (group.recoveryScore < 0 || group.recoveryScore > 100) {
        issues.push(`Invalid recoveryScore for ${group.muscleGroup}`);
        severity = 'warning';
      }
      if (group.daysSinceTrained < 0) {
        issues.push(`Negative daysSinceTrained for ${group.muscleGroup}`);
        severity = 'warning';
      }
    }
  }

  return {
    corrupted: issues.length > 0,
    issues,
    severity,
  };
}

/** Quick health check: returns true if memory appears valid. */
export function isMemoryHealthy(snapshot: BehaviorMemorySnapshot): boolean {
  const report = detectCorruptedMemory(snapshot);
  return !report.corrupted || report.severity !== 'critical';
}
