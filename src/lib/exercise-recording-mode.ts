export type ExerciseRecordingMode = 'strength' | 'timed' | 'warmup' | 'cardio';

/** True isometric / hold exercises — reps field means seconds held */
export const TIMED_EXERCISE_NAMES = new Set([
  '平板支撑', '侧平板支撑', '俯撑', '单臂平板支撑',
  '靠墙蹲', '靠墙静蹲', '壁坐',
  '悬挂', '死亡悬挂', '悬垂保持',
  'L坐', 'L-sit', '超人式保持', 'Superman保持',
  '单腿平衡', '瑜伽保持',
]);

const WARMUP_KEYWORDS = ['拉伸', '伸展', '放松', '泡沫轴', '滚压', '激活', '热身'];
const CARDIO_KEYWORDS = ['跑步', '单车', '骑行', '游泳', '椭圆机', '跳绳', '快走', '慢跑', '步行', '跑台', '划船机'];

/**
 * Derive recording mode for an exercise.
 * Priority: name-set → category → name keywords → default strength
 */
export function detectExerciseMode(
  name: string,
  category?: string | null,
): ExerciseRecordingMode {
  const base = name.split(' (')[0];

  // 1. Hardcoded isometric hold names
  if (TIMED_EXERCISE_NAMES.has(base)) return 'timed';

  // 2. Explicit category signals (only trust specific values)
  if (category === 'isometric' || category === 'hold') return 'timed';
  if (category === 'cardio' || category === 'aerobic') return 'cardio';
  if (category === 'warmup' || category === 'mobility' || category === 'flexibility') return 'warmup';
  // NOTE: 'stretching' is intentionally NOT mapped to 'timed' — many strength exercises
  // have stretching descriptions, so we rely on name keywords instead.

  // 3. Name keyword heuristics
  if (WARMUP_KEYWORDS.some(k => base.includes(k))) return 'warmup';
  if (CARDIO_KEYWORDS.some(k => base.includes(k))) return 'cardio';

  return 'strength';
}

const OVERRIDE_KEY = 'fitcoach:v1:exerciseMode';

export function loadModeOverrides(): Record<string, ExerciseRecordingMode> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveModeOverride(exerciseName: string, mode: ExerciseRecordingMode) {
  if (typeof window === 'undefined') return;
  const current = loadModeOverrides();
  current[exerciseName] = mode;
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(current));
}
