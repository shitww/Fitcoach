// ── Build Cold Start Surface ──────────────────────────────────────────────────
// For brand-new users: guided entry without requiring any configuration.
// ─────────────────────────────────────────────────────────────────────────────

import type { ColdStartSurface, SurfaceAction } from '@/types/adaptive-surface';

export interface ColdStartInput {
  fitnessGoal: 'strength' | 'muscle' | 'endurance' | 'general' | null;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  availableDaysPerWeek: number | null;
}

/** Build the cold-start surface for users with zero history.
 *  Uses taxonomy + common defaults to provide immediate direction.
 */
export function buildColdStartSurface(
  input: ColdStartInput = { fitnessGoal: null, experienceLevel: null, availableDaysPerWeek: null }
): ColdStartSurface {
  const focusAreas = buildFocusAreas(input);
  const popularFlows = buildPopularFlows(input);

  return {
    headline: 'What would you like to focus on today?',
    body: 'Pick a focus area and start your first session. FitCoach will learn your preferences over time.',
    suggestedFocusAreas: focusAreas,
    popularFlows,
  };
}

function buildFocusAreas(
  input: ColdStartInput
): ColdStartSurface['suggestedFocusAreas'] {
  const areas: ColdStartSurface['suggestedFocusAreas'] = [
    {
      label: 'Upper Body',
      muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
      reason: 'Build a strong upper body foundation',
      action: buildAction('Start Upper Body', 'target'),
    },
    {
      label: 'Lower Body',
      muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      reason: 'Develop leg strength and power',
      action: buildAction('Start Lower Body', 'target'),
    },
    {
      label: 'Full Body',
      muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms'],
      reason: 'Balanced training for all major groups',
      action: buildAction('Start Full Body', 'zap'),
    },
  ];

  // Goal-aware ordering
  if (input.fitnessGoal === 'strength') {
    areas.unshift({
      label: 'Strength Focus',
      muscleGroups: ['chest', 'back', 'legs'],
      reason: 'Compound lifts for maximum strength gains',
      action: buildAction('Start Strength', 'dumbbell'),
    });
  }

  if (input.fitnessGoal === 'muscle') {
    areas.unshift({
      label: 'Hypertrophy Focus',
      muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'legs'],
      reason: 'Volume-driven muscle building',
      action: buildAction('Start Hypertrophy', 'fire'),
    });
  }

  return areas.slice(0, 4);
}

function buildPopularFlows(
  input: ColdStartInput
): ColdStartSurface['popularFlows'] {
  const flows: ColdStartSurface['popularFlows'] = [
    {
      label: 'Classic Push Day',
      exercises: ['Bench Press', 'Overhead Press', 'Tricep Pushdown', 'Lateral Raise'],
      action: buildAction('Try Push Day', 'play'),
    },
    {
      label: 'Classic Pull Day',
      exercises: ['Pull-Up', 'Barbell Row', 'Face Pull', 'Bicep Curl'],
      action: buildAction('Try Pull Day', 'play'),
    },
    {
      label: 'Leg Day Essentials',
      exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise'],
      action: buildAction('Try Leg Day', 'play'),
    },
  ];

  if (input.availableDaysPerWeek && input.availableDaysPerWeek <= 3) {
    flows.unshift({
      label: 'Quick Full Body',
      exercises: ['Squat', 'Bench Press', 'Row', 'Overhead Press'],
      action: buildAction('Try Full Body', 'zap'),
    });
  }

  return flows.slice(0, 3);
}

function buildAction(label: string, icon: SurfaceAction['icon']): SurfaceAction {
  return {
    id: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    icon,
    variant: 'filled',
    priority: 'primary',
    enabled: true,
  };
}
