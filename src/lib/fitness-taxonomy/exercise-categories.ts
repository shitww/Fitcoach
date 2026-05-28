// ── Exercise Category Taxonomy ────────────────────────────────────────────────
// High-level exercise classifications for program design, goal alignment,
// and recommendation filtering.
// ─────────────────────────────────────────────────────────────────────────────

/** Exercise categories aligned with training goals. */
export const EXERCISE_CATEGORIES = [
  'strength',
  'hypertrophy',
  'power',
  'endurance',
  'mobility',
  'plyometrics',
  'cardio',
  'recovery',
  'technique_drill',
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

/** Training goal alignment — which categories serve which goal. */
export const GOAL_CATEGORY_ALIGNMENT: Record<string, readonly ExerciseCategory[]> = {
  build_muscle: ['hypertrophy', 'strength'],
  gain_strength: ['strength', 'power', 'technique_drill'],
  lose_fat: ['cardio', 'endurance', 'hypertrophy'],
  improve_endurance: ['endurance', 'cardio'],
  athletic_performance: ['power', 'plyometrics', 'strength'],
  rehab_prehab: ['mobility', 'recovery', 'technique_drill'],
  general_fitness: ['strength', 'hypertrophy', 'cardio', 'mobility'],
} as const;

/** Human-readable labels (EN + CN). */
export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, { en: string; cn: string }> = {
  strength: { en: 'Strength', cn: '力量' },
  hypertrophy: { en: 'Hypertrophy', cn: '增肌' },
  power: { en: 'Power', cn: '爆发力' },
  endurance: { en: 'Endurance', cn: '耐力' },
  mobility: { en: 'Mobility', cn: '灵活性' },
  plyometrics: { en: 'Plyometrics', cn: '增强式' },
  cardio: { en: 'Cardio', cn: '有氧' },
  recovery: { en: 'Recovery', cn: '恢复' },
  technique_drill: { en: 'Technique Drill', cn: '技术训练' },
};
