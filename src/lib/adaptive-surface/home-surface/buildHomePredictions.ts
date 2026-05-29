// ── Build Home Predictions ────────────────────────────────────────────────────
// Generates the prediction strip shown below the hero on the home surface.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionReason } from '@/types/predictive-flow';
import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

export interface HomePredictionStrip {
  predictions: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable' | 'new';
    confidence: number;
  }[];
  summary: string;
}

/** Build a lightweight prediction strip for the home surface.
 *  Shows 3 key insights without overwhelming the user.
 */
export function buildHomePredictions(
  memory: BehaviorMemorySnapshot,
  today: Date
): HomePredictionStrip {
  const wm = memory.workoutMemory;
  const predictions: HomePredictionStrip['predictions'] = [];

  // 1. Weekly volume trend
  const recentSessions = wm.timeline.sessions.filter(
    (s) => new Date(s.date) >= new Date(today.getTime() - 7 * 86_400_000)
  );
  const weeklyVolume = recentSessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const prevWeekSessions = wm.timeline.sessions.filter(
    (s) => {
      const d = new Date(s.date);
      return (
        d >= new Date(today.getTime() - 14 * 86_400_000) &&
        d < new Date(today.getTime() - 7 * 86_400_000)
      );
    }
  );
  const prevVolume = prevWeekSessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const volumeTrend: HomePredictionStrip['predictions'][0]['trend'] =
    weeklyVolume > prevVolume * 1.1 ? 'up' : weeklyVolume < prevVolume * 0.9 ? 'down' : 'stable';

  predictions.push({
    label: 'Weekly Volume',
    value: `${Math.round(weeklyVolume / 1000)}k`,
    trend: volumeTrend,
    confidence: recentSessions.length > 2 ? 0.8 : 0.5,
  });

  // 2. Most trained muscle
  const muscleCounts = new Map<string, number>();
  for (const session of recentSessions) {
    for (const mg of session.muscleGroups) {
      muscleCounts.set(mg, (muscleCounts.get(mg) || 0) + 1);
    }
  }
  const topMuscle = Array.from(muscleCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topMuscle) {
    predictions.push({
      label: 'Top Focus',
      value: capitalize(topMuscle[0]),
      trend: 'stable',
      confidence: 0.75,
    });
  }

  // 3. Recovery status
  const recoveredCount = wm.recoverySnapshot.fullyRecovered.length;
  const totalMuscles = wm.recoverySnapshot.muscleGroups.length;
  const recoveryPct = totalMuscles > 0 ? recoveredCount / totalMuscles : 1;

  predictions.push({
    label: 'Recovery',
    value: `${Math.round(recoveryPct * 100)}%`,
    trend: recoveryPct >= 0.8 ? 'up' : recoveryPct >= 0.5 ? 'stable' : 'down',
    confidence: 0.9,
  });

  const summary =
    recentSessions.length === 0
      ? 'Ready to start your first workout'
      : `${recentSessions.length} sessions this week · ${Math.round(weeklyVolume / 1000)}k volume`;

  return { predictions, summary };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
