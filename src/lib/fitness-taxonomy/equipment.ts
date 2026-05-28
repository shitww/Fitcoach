// ── Equipment Taxonomy ──────────────────────────────────────────────────────
// Standardized equipment types for exercise classification, gym availability
// filtering, and home-gym workout generation.
// ─────────────────────────────────────────────────────────────────────────────

/** Equipment types available in commercial and home gyms. */
export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'smith_machine',
  'bodyweight',
  'resistance_band',
  'medicine_ball',
  'exercise_ball',
  'suspension_trainer',
  'trap_bar',
  'ez_curl_bar',
  'plate',
  'pull_up_bar',
  'dip_station',
  'treadmill',
  'stationary_bike',
  'rower',
  'elliptical',
  'sled',
  'battle_ropes',
  'foam_roll',
  'yoga_mat',
  'parallettes',
  'rings',
  'bench',
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

/** Equipment categories for availability filtering. */
export const EQUIPMENT_CATEGORIES = [
  'free_weight',
  'machine',
  'cardio_machine',
  'bodyweight',
  'accessory',
  'mobility',
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

/** Equipment type → category membership. */
export const EQUIPMENT_CATEGORY_MAP: Record<EquipmentType, EquipmentCategory> = {
  barbell: 'free_weight',
  dumbbell: 'free_weight',
  kettlebell: 'free_weight',
  cable: 'machine',
  machine: 'machine',
  smith_machine: 'machine',
  bodyweight: 'bodyweight',
  resistance_band: 'accessory',
  medicine_ball: 'free_weight',
  exercise_ball: 'accessory',
  suspension_trainer: 'bodyweight',
  trap_bar: 'free_weight',
  ez_curl_bar: 'free_weight',
  plate: 'free_weight',
  pull_up_bar: 'bodyweight',
  dip_station: 'bodyweight',
  treadmill: 'cardio_machine',
  stationary_bike: 'cardio_machine',
  rower: 'cardio_machine',
  elliptical: 'cardio_machine',
  sled: 'accessory',
  battle_ropes: 'accessory',
  foam_roll: 'mobility',
  yoga_mat: 'accessory',
  parallettes: 'bodyweight',
  rings: 'bodyweight',
  bench: 'accessory',
};

/** Human-readable labels (EN + CN). */
export const EQUIPMENT_LABELS: Record<EquipmentType, { en: string; cn: string }> = {
  barbell: { en: 'Barbell', cn: '杠铃' },
  dumbbell: { en: 'Dumbbell', cn: '哑铃' },
  kettlebell: { en: 'Kettlebell', cn: '壶铃' },
  cable: { en: 'Cable Machine', cn: '绳索/拉力器' },
  machine: { en: 'Machine', cn: '固定器械' },
  smith_machine: { en: 'Smith Machine', cn: '史密斯机' },
  bodyweight: { en: 'Bodyweight', cn: '徒手' },
  resistance_band: { en: 'Resistance Band', cn: '弹力带' },
  medicine_ball: { en: 'Medicine Ball', cn: '药球' },
  exercise_ball: { en: 'Exercise Ball', cn: '健身球' },
  suspension_trainer: { en: 'Suspension Trainer', cn: '悬挂训练带' },
  trap_bar: { en: 'Trap Bar', cn: '六角杠' },
  ez_curl_bar: { en: 'EZ Curl Bar', cn: 'EZ曲杆' },
  plate: { en: 'Weight Plate', cn: '杠铃片' },
  pull_up_bar: { en: 'Pull-Up Bar', cn: '引体向上杆' },
  dip_station: { en: 'Dip Station', cn: '双杠架' },
  treadmill: { en: 'Treadmill', cn: '跑步机' },
  stationary_bike: { en: 'Stationary Bike', cn: '动感单车' },
  rower: { en: 'Rowing Machine', cn: '划船机' },
  elliptical: { en: 'Elliptical', cn: '椭圆机' },
  sled: { en: 'Sled', cn: '雪橇' },
  battle_ropes: { en: 'Battle Ropes', cn: '战绳' },
  foam_roll: { en: 'Foam Roller', cn: '泡沫轴' },
  yoga_mat: { en: 'Yoga Mat', cn: '瑜伽垫' },
  parallettes: { en: 'Parallettes', cn: '俯卧撑支架' },
  rings: { en: 'Gymnastic Rings', cn: '吊环' },
  bench: { en: 'Bench', cn: '训练凳' },
};
