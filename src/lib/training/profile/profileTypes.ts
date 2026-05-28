// ── FitCoach Phase 3 — User Training Profile Types ──────────────────────────

/** Detected training style / behavioral archetype. */
export type TrainingStyle =
  | 'strength_focused'
  | 'hypertrophy_focused'
  | 'endurance_focused'
  | 'mixed'
  | 'undetermined';

/** Experience classification based on total training history. */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/** Preferred training split / frequency pattern. */
export type FrequencyPattern =
  | 'high_frequency' // 5+ days/week
  | 'moderate_frequency' // 3-4 days/week
  | 'low_frequency' // 1-2 days/week
  | 'irregular';

/** Recovery behavior pattern. */
export type RecoveryBehavior =
  | 'aggressive' // trains through fatigue
  | 'balanced' // takes rest when needed
  | 'conservative' // rests too much
  | 'unknown';

/** Progressive overload approach. */
export type ProgressionStyle =
  | 'aggressive_linear' // adds weight every session
  | 'conservative_wave' // wave loading, slow increases
  | 'rep_focused' // chases reps at same weight
  | 'volume_focused' // adds sets/volume
  | 'inconsistent'; // no clear pattern

/** User Training Profile — built from long-term observation. */
export interface UserTrainingProfile {
  style: TrainingStyle;
  experience: ExperienceLevel;
  frequencyPattern: FrequencyPattern;
  recoveryBehavior: RecoveryBehavior;
  progressionStyle: ProgressionStyle;
  /** Top 3 most-trained muscle groups (by volume). */
  musclePriority: string[];
  /** Top 3 most-trained exercises. */
  exercisePriority: string[];
  /** Average workout duration (minutes). */
  avgWorkoutDurationMin: number;
  /** Average sets per workout. */
  avgSetsPerWorkout: number;
  /** Average rest preference (seconds). */
  avgRestPreferenceSec: number;
  /** True if user tends to skip planned sessions. */
  skipsSessions: boolean;
  /** True if user frequently trains to failure. */
  highFailureRate: boolean;
  /** When profile was last computed. */
  computedAt: number;
}

/** Snapshot for profile change detection. */
export interface ProfileDelta {
  field: keyof UserTrainingProfile;
  previous: unknown;
  current: unknown;
  significance: 'major' | 'minor' | 'none';
}
