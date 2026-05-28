// ── Warmup Recommendation Engine ────────────────────────────────────────────
// Generates contextual warmup suggestions based on target exercise properties.
// ─────────────────────────────────────────────────────────────────────────────

import type { WarmupRecommendation, WarmupFlow } from '@/types/predictive-flow';

export interface ExerciseWarmupProfile {
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string[];
  movementPatterns: string[];
  category: string;
  stabilityDemand: 'low' | 'moderate' | 'high';
  axialLoad: 'none' | 'low' | 'moderate' | 'high';
  fatigueScore: number;
}

const WARMUP_LIBRARY: WarmupRecommendation[] = [
  {
    id: 'shoulder_activation',
    name: 'Shoulder Activation',
    description: 'Band pull-aparts, face pulls, external rotation',
    targetMuscles: ['deltoid_anterior', 'deltoid_lateral', 'deltoid_posterior', 'rotator_cuff'],
    targetMovementPatterns: ['horizontal_push', 'vertical_push', 'scapular_elevation'],
    type: 'activation',
    durationSec: 120,
    reason: 'Prepares rotator cuff for pressing movements',
  },
  {
    id: 'hip_activation',
    name: 'Hip Activation',
    description: 'Clamshells, monster walks, glute bridges',
    targetMuscles: ['gluteus_maximus', 'gluteus_medius', 'hip_adductors'],
    targetMovementPatterns: ['squat', 'hinge', 'lunge'],
    type: 'activation',
    durationSec: 120,
    reason: 'Activates glutes before compound lower body work',
  },
  {
    id: 'core_activation',
    name: 'Core Activation',
    description: 'Dead bug, bird dog, plank holds',
    targetMuscles: ['rectus_abdominis', 'obliques', 'erector_spinae'],
    targetMovementPatterns: ['squat', 'hinge', 'row', 'overhead_press'],
    type: 'activation',
    durationSec: 90,
    reason: 'Stabilizes trunk for heavy compound lifts',
  },
  {
    id: 'empty_bar_ramp',
    name: 'Empty Bar Ramp-Up',
    description: '2 sets of 10-15 reps with empty bar',
    targetMuscles: [],
    targetMovementPatterns: ['horizontal_push', 'vertical_push', 'row', 'hinge', 'squat'],
    type: 'ramp_up',
    durationSec: 180,
    reason: 'Neuromuscular warmup for barbell movements',
  },
  {
    id: 'light_db_ramp',
    name: 'Light Dumbbell Ramp-Up',
    description: '1-2 sets with 50% working weight',
    targetMuscles: [],
    targetMovementPatterns: ['horizontal_push', 'horizontal_pull', 'lunge', 'bulgarian_split_squat'],
    type: 'ramp_up',
    durationSec: 150,
    reason: 'Prepares joints for dumbbell work',
  },
  {
    id: 'wrist_elbow_prep',
    name: 'Wrist & Elbow Prep',
    description: 'Wrist circles, elbow rotations, light curls',
    targetMuscles: ['forearm_flexors', 'biceps_brachii', 'triceps_brachii'],
    targetMovementPatterns: ['curl', 'extension', 'push'],
    type: 'mobility',
    durationSec: 60,
    reason: 'Prepares arms for isolation work',
  },
  {
    id: 'thoracic_mobility',
    name: 'Thoracic Mobility',
    description: 'Open books, cat-cow, thoracic extensions',
    targetMuscles: ['erector_spinae', 'rhomboids', 'latissimus_dorsi'],
    targetMovementPatterns: ['row', 'horizontal_pull', 'vertical_pull', 'hinge'],
    type: 'mobility',
    durationSec: 90,
    reason: 'Improves upper back mobility for pulling',
  },
  {
    id: 'ankle_hip_mobility',
    name: 'Ankle & Hip Mobility',
    description: 'Ankle circles, hip circles, deep squat holds',
    targetMuscles: ['quadriceps', 'hamstrings', 'gluteus_maximus'],
    targetMovementPatterns: ['squat', 'lunge', 'bulgarian_split_squat'],
    type: 'mobility',
    durationSec: 120,
    reason: 'Increases depth and safety in squatting',
  },
  {
    id: 'scapular_pulls',
    name: 'Scapular Pulls / Hangs',
    description: 'Active hangs, scapular retractions on bar',
    targetMuscles: ['latissimus_dorsi', 'rhomboids', 'trapezius'],
    targetMovementPatterns: ['vertical_pull', 'horizontal_pull'],
    type: 'movement_prep',
    durationSec: 90,
    reason: 'Prepares shoulders for pull-up/deadlift patterns',
  },
];

/** Recommend warmups for a given target exercise. */
export function recommendWarmups(
  profile: ExerciseWarmupProfile
): WarmupRecommendation[] {
  const scored = WARMUP_LIBRARY.map((w) => {
    let matchScore = 0;

    // Muscle match
    for (const muscle of w.targetMuscles) {
      if (profile.targetMuscles.includes(muscle)) matchScore += 0.3;
    }

    // Movement pattern match
    for (const pattern of w.targetMovementPatterns) {
      if (profile.movementPatterns.includes(pattern)) matchScore += 0.4;
    }

    // Category bonuses
    if (profile.category === 'strength' && w.type === 'ramp_up') matchScore += 0.2;
    if (profile.stabilityDemand === 'high' && w.type === 'activation') matchScore += 0.3;
    if (profile.axialLoad === 'high' && w.type === 'activation') matchScore += 0.25;

    return { warmup: w, score: matchScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 2-3 warmups, at least one activation if stability demand is high
  const results = scored.filter((s) => s.score > 0.4).map((s) => s.warmup);

  if (profile.stabilityDemand === 'high') {
    const hasActivation = results.some((w) => w.type === 'activation');
    if (!hasActivation) {
      const fallback = WARMUP_LIBRARY.find((w) => w.type === 'activation');
      if (fallback) results.unshift(fallback);
    }
  }

  return results.slice(0, 3);
}

/** Build a complete warmup flow for a target exercise. */
export function buildWarmupFlow(profile: ExerciseWarmupProfile): WarmupFlow {
  const steps = recommendWarmups(profile);
  const totalDurationSec = steps.reduce((s, w) => s + w.durationSec, 0);

  const priority: WarmupFlow['priority'] =
    profile.stabilityDemand === 'high' || profile.fatigueScore >= 8
      ? 'required'
      : profile.fatigueScore >= 5
        ? 'recommended'
        : 'optional';

  return {
    targetExerciseId: profile.exerciseId,
    targetExerciseName: profile.exerciseName,
    steps,
    totalDurationSec,
    priority,
  };
}
