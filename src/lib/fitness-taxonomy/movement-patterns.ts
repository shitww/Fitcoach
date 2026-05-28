// ── Movement Pattern Taxonomy ─────────────────────────────────────────────────
// Fundamental human movement patterns used for exercise classification,
// program design, and intelligent exercise substitution.
// ─────────────────────────────────────────────────────────────────────────────

/** Fundamental movement patterns derived from biomechanical taxonomy.
 *  Every resistance exercise maps to exactly one primary pattern.
 */
export const MOVEMENT_PATTERNS = [
  // Upper body — push
  'horizontal_push',
  'vertical_push',
  'incline_push',
  'dip',
  // Upper body — pull
  'horizontal_pull',
  'vertical_pull',
  'face_pull',
  // Lower body — knee dominant
  'squat',
  'single_leg_squat',
  'step_up',
  // Lower body — hip dominant
  'hinge',
  'single_leg_hinge',
  'hip_thrust',
  // Lower body — combination
  'lunge',
  'bulgarian_split_squat',
  // Core / trunk
  'anti_extension',
  'anti_rotation',
  'flexion',
  'rotation',
  'extension',
  'carry',
  // Loaded locomotion
  'loaded_carry',
  // Arms — isolation
  'elbow_flexion',
  'elbow_extension',
  'wrist_flexion',
  'wrist_extension',
  // Shoulder — isolation
  'shoulder_abduction',
  'shoulder_extension',
  'shoulder_external_rotation',
  'shoulder_internal_rotation',
  'scapular_retraction',
  'scapular_depression',
  'scapular_elevation',
  // Cardio / conditioning
  'steady_state_cardio',
  'interval_cardio',
  'plyometric',
  // Full body
  'olympic_lift',
  'full_body_dynamic',
] as const;

export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

/** Movement pattern families for high-level grouping. */
export const MOVEMENT_FAMILIES = [
  'push',
  'pull',
  'squat',
  'hinge',
  'lunge',
  'core',
  'carry',
  'arm_isolation',
  'shoulder_isolation',
  'cardio',
  'olympic',
] as const;

export type MovementFamily = (typeof MOVEMENT_FAMILIES)[number];

/** Pattern → family mapping. */
export const MOVEMENT_PATTERN_FAMILY_MAP: Record<MovementPattern, MovementFamily> = {
  horizontal_push: 'push',
  vertical_push: 'push',
  incline_push: 'push',
  dip: 'push',
  horizontal_pull: 'pull',
  vertical_pull: 'pull',
  face_pull: 'pull',
  squat: 'squat',
  single_leg_squat: 'squat',
  step_up: 'squat',
  hinge: 'hinge',
  single_leg_hinge: 'hinge',
  hip_thrust: 'hinge',
  lunge: 'lunge',
  bulgarian_split_squat: 'lunge',
  anti_extension: 'core',
  anti_rotation: 'core',
  flexion: 'core',
  rotation: 'core',
  extension: 'core',
  carry: 'carry',
  loaded_carry: 'carry',
  elbow_flexion: 'arm_isolation',
  elbow_extension: 'arm_isolation',
  wrist_flexion: 'arm_isolation',
  wrist_extension: 'arm_isolation',
  shoulder_abduction: 'shoulder_isolation',
  shoulder_extension: 'shoulder_isolation',
  shoulder_external_rotation: 'shoulder_isolation',
  shoulder_internal_rotation: 'shoulder_isolation',
  scapular_retraction: 'shoulder_isolation',
  scapular_depression: 'shoulder_isolation',
  scapular_elevation: 'shoulder_isolation',
  steady_state_cardio: 'cardio',
  interval_cardio: 'cardio',
  plyometric: 'cardio',
  olympic_lift: 'olympic',
  full_body_dynamic: 'olympic',
};

/** Human-readable labels (EN + CN). */
export const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, { en: string; cn: string }> = {
  horizontal_push: { en: 'Horizontal Push', cn: '水平推' },
  vertical_push: { en: 'Vertical Push', cn: '垂直推' },
  incline_push: { en: 'Incline Push', cn: '上斜推' },
  dip: { en: 'Dip', cn: '臂屈伸' },
  horizontal_pull: { en: 'Horizontal Pull', cn: '水平拉' },
  vertical_pull: { en: 'Vertical Pull', cn: '垂直拉' },
  face_pull: { en: 'Face Pull', cn: '面拉' },
  squat: { en: 'Squat', cn: '深蹲' },
  single_leg_squat: { en: 'Single-Leg Squat', cn: '单腿蹲' },
  step_up: { en: 'Step-Up', cn: '登台阶' },
  hinge: { en: 'Hinge', cn: '铰链' },
  single_leg_hinge: { en: 'Single-Leg Hinge', cn: '单腿铰链' },
  hip_thrust: { en: 'Hip Thrust', cn: '臀推' },
  lunge: { en: 'Lunge', cn: '弓步蹲' },
  bulgarian_split_squat: { en: 'Bulgarian Split Squat', cn: '保加利亚分腿蹲' },
  anti_extension: { en: 'Anti-Extension', cn: '抗伸展' },
  anti_rotation: { en: 'Anti-Rotation', cn: '抗旋转' },
  flexion: { en: 'Flexion', cn: '屈曲' },
  rotation: { en: 'Rotation', cn: '旋转' },
  extension: { en: 'Extension', cn: '伸展' },
  carry: { en: 'Carry', cn: '支撑' },
  loaded_carry: { en: 'Loaded Carry', cn: '负重行走' },
  elbow_flexion: { en: 'Elbow Flexion', cn: '肘屈曲' },
  elbow_extension: { en: 'Elbow Extension', cn: '肘伸展' },
  wrist_flexion: { en: 'Wrist Flexion', cn: '腕屈曲' },
  wrist_extension: { en: 'Wrist Extension', cn: '腕伸展' },
  shoulder_abduction: { en: 'Shoulder Abduction', cn: '肩外展' },
  shoulder_extension: { en: 'Shoulder Extension', cn: '肩伸展' },
  shoulder_external_rotation: { en: 'External Rotation', cn: '肩外旋' },
  shoulder_internal_rotation: { en: 'Internal Rotation', cn: '肩内旋' },
  scapular_retraction: { en: 'Scapular Retraction', cn: '肩胛后缩' },
  scapular_depression: { en: 'Scapular Depression', cn: '肩胛下沉' },
  scapular_elevation: { en: 'Scapular Elevation', cn: '肩胛上提' },
  steady_state_cardio: { en: 'Steady-State Cardio', cn: '稳态有氧' },
  interval_cardio: { en: 'Interval Cardio', cn: '间歇有氧' },
  plyometric: { en: 'Plyometric', cn: '爆发力' },
  olympic_lift: { en: 'Olympic Lift', cn: '奥林匹克举' },
  full_body_dynamic: { en: 'Full-Body Dynamic', cn: '全身动态' },
};
