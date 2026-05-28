// ── Equipment Affinity Engine ─────────────────────────────────────────────────
// Detects which equipment types the user prefers based on actual usage.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory } from '@/types/workout-memory';
import type { EquipmentAffinity } from '@/types/workout-memory';

/** Infer equipment used from exercise names and muscle groups.
 *  This is a heuristic since legacy data may not have explicit equipment.
 *  Future: use Exercise schema from knowledge pack for exact mapping.
 */
function inferEquipment(exerciseName: string, muscleGroup: string): string[] {
  const name = exerciseName.toLowerCase();
  const equipment: string[] = [];

  if (name.includes('barbell')) equipment.push('barbell');
  if (name.includes('dumbbell') || name.includes('db ')) equipment.push('dumbbell');
  if (name.includes('machine') || name.includes('press machine')) equipment.push('machine');
  if (name.includes('cable') || name.includes('rope')) equipment.push('cable');
  if (name.includes('bodyweight') || name.includes('push-up') || name.includes('pull-up') || name.includes('dip')) equipment.push('bodyweight');
  if (name.includes('kettlebell') || name.includes('kb ')) equipment.push('kettlebell');
  if (name.includes('smith')) equipment.push('smith_machine');

  // Fallback: use exercise name patterns
  if (equipment.length === 0) {
    if (name.includes('bench press') || name.includes('squat') || name.includes('deadlift') || name.includes('row')) {
      equipment.push('barbell');
    } else if (name.includes('fly') || name.includes('curl') || name.includes('raise') || name.includes('lateral')) {
      equipment.push('dumbbell');
    } else if (name.includes('plank') || name.includes('push up') || name.includes('pull up')) {
      equipment.push('bodyweight');
    } else {
      equipment.push('unknown');
    }
  }

  return equipment;
}

/** Calculate equipment affinity from session history. */
export function calculateEquipmentAffinities(
  sessions: readonly WorkoutSessionMemory[]
): EquipmentAffinity[] {
  const counts = new Map<string, number>();
  let total = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      const eqs = inferEquipment(ex.exerciseName, ex.muscleGroup);
      for (const eq of eqs) {
        counts.set(eq, (counts.get(eq) || 0) + 1);
        total++;
      }
    }
  }

  if (total === 0) return [];

  const results: EquipmentAffinity[] = [];
  for (const [equipment, usageCount] of counts) {
    const usageRatio = usageCount / total;
    results.push({
      equipment,
      usageCount,
      usageRatio: Math.round(usageRatio * 1000) / 1000,
      score: Math.round(usageRatio * 1000) / 1000,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Get the user's dominant equipment type. */
export function getDominantEquipment(
  sessions: readonly WorkoutSessionMemory[]
): string | null {
  const affinities = calculateEquipmentAffinities(sessions);
  return affinities.length > 0 ? affinities[0].equipment : null;
}
