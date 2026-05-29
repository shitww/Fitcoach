/**
 * 基于 Free Exercise DB 的完整分类体系
 * - 17 个 primaryMuscles 肌群
 * - 7 个 exercise category 运动类型
 */

// ─── 17 肌群 (Free Exercise DB primaryMuscles 原始值) ───────────────────────

export const MUSCLE_GROUP_MAP: Record<string, string> = {
  'chest':       '胸部',
  'shoulders':   '肩部',
  'triceps':     '肱三头肌',
  'biceps':      '肱二头肌',
  'forearms':    '前臂',
  'traps':       '斜方肌',
  'neck':        '颈部',
  'lats':        '背阔肌',
  'middle back': '菱形肌',
  'lower back':  '下背部',
  'abdominals':  '腹部',
  'quadriceps':  '股四头肌',
  'hamstrings':  '腘绳肌',
  'glutes':      '臀部',
  'calves':      '小腿',
  'adductors':   '内收肌',
  'abductors':   '外展肌',
};

export const MUSCLE_GROUP_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MUSCLE_GROUP_MAP).map(([k, v]) => [v, k])
);

export const MUSCLE_GROUP_ORDER = [
  'chest', 'shoulders', 'triceps', 'biceps', 'forearms', 'traps', 'neck',
  'lats', 'middle back', 'lower back',
  'abdominals',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors',
] as const;

export const MUSCLE_GROUP_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'chest':       { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'hover:border-red-500/40',     hex: '#FF6B6B' },
  'shoulders':   { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'hover:border-amber-500/40',   hex: '#FBBF24' },
  'triceps':     { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'hover:border-orange-500/40',  hex: '#FB923C' },
  'biceps':      { bg: 'bg-yellow-500/15',  text: 'text-yellow-400',  border: 'hover:border-yellow-500/40',  hex: '#FDE047' },
  'forearms':    { bg: 'bg-lime-500/15',    text: 'text-lime-400',    border: 'hover:border-lime-500/40',    hex: '#A3E635' },
  'traps':       { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'hover:border-cyan-500/40',    hex: '#22D3EE' },
  'neck':        { bg: 'bg-muted/40',   text: 'text-muted-foreground',   border: 'hover:border-border/40',   hex: '#94A3B8' },
  'lats':        { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'hover:border-blue-500/40',    hex: '#60A5FA' },
  'middle back': { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  border: 'hover:border-indigo-500/40',  hex: '#818CF8' },
  'lower back':  { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'hover:border-violet-500/40',  hex: '#A78BFA' },
  'abdominals':  { bg: 'bg-pink-500/15',    text: 'text-pink-400',    border: 'hover:border-pink-500/40',    hex: '#F472B6' },
  'quadriceps':  { bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'hover:border-purple-500/40',  hex: '#C084FC' },
  'hamstrings':  { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'hover:border-fuchsia-500/40', hex: '#E879F9' },
  'glutes':      { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'hover:border-rose-500/40',    hex: '#FB7185' },
  'calves':      { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'hover:border-teal-500/40',    hex: '#2DD4BF' },
  'adductors':   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'hover:border-emerald-500/40', hex: '#34D399' },
  'abductors':   { bg: 'bg-green-500/15',   text: 'text-green-400',   border: 'hover:border-green-500/40',   hex: '#4ADE80' },
};

// ─── 7 运动类型 (Free Exercise DB category 原始值) ──────────────────────────

export const EXERCISE_CATEGORY_MAP: Record<string, string> = {
  'strength':              '力量训练',
  'stretching':            '拉伸',
  'plyometrics':           '爆发力',
  'powerlifting':          '力量举',
  'olympic weightlifting': '奥林匹克举重',
  'strongman':             '大力士',
  'cardio':                '有氧',
};

export const EXERCISE_CATEGORY_ORDER = [
  'strength', 'powerlifting', 'olympic weightlifting', 'strongman',
  'plyometrics', 'cardio', 'stretching',
] as const;

export const EXERCISE_CATEGORY_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  'strength':              { bg: 'bg-red-500/15',    text: 'text-red-400',    hex: '#FF6B6B' },
  'stretching':            { bg: 'bg-teal-500/15',   text: 'text-teal-400',   hex: '#2DD4BF' },
  'plyometrics':           { bg: 'bg-orange-500/15', text: 'text-orange-400', hex: '#FB923C' },
  'powerlifting':          { bg: 'bg-amber-500/15',  text: 'text-amber-400',  hex: '#FBBF24' },
  'olympic weightlifting': { bg: 'bg-blue-500/15',   text: 'text-blue-400',   hex: '#60A5FA' },
  'strongman':             { bg: 'bg-purple-500/15', text: 'text-purple-400', hex: '#C084FC' },
  'cardio':                { bg: 'bg-green-500/15',  text: 'text-green-400',  hex: '#4ADE80' },
};

// ─── 难度 ────────────────────────────────────────────────────────────────────

/** Free Exercise DB 原始值 → 中文，以及反向 */
export const DIFFICULTY_MAP: Record<string, string> = {
  'beginner':     '初级',
  'intermediate': '中级',
  'expert':       '高级',
};
export const DIFFICULTY_OPTIONS = ['初级', '中级', '高级'] as const;

// ─── 器材 ────────────────────────────────────────────────────────────────────

export const EQUIPMENT_TYPE_MAP: Record<string, string> = {
  'barbell':        '杠铃',
  'dumbbell':       '哑铃',
  'cable':          '绳索/拉力器',
  'machine':        '器械',
  'kettlebells':    '壶铃',
  'bands':          '弹力带',
  'body only':      '徒手',
  'e-z curl bar':   'EZ曲杆',
  'exercise ball':  '健身球',
  'foam roll':      '泡沫轴',
  'medicine ball':  '药球',
  'other':          '其他器械',
};

export function equipmentToType(equipment: string | null | undefined): string {
  if (!equipment) return '徒手';
  return EQUIPMENT_TYPE_MAP[equipment.toLowerCase()] ?? equipment;
}

// ─── 辅助函数 ────────────────────────────────────────────────────────────────

export function getMuscleGroupColor(group: string): { bg: string; text: string; border: string; hex: string } {
  const key = MUSCLE_GROUP_REVERSE[group] || group;
  const c = MUSCLE_GROUP_COLORS[key];
  if (c) return c;
  return { bg: 'bg-muted/40', text: 'text-muted-foreground', border: 'hover:border-border/40', hex: '#71717A' };
}

export function getMuscleGroupLabel(group: string): string {
  return MUSCLE_GROUP_MAP[group] ?? group;
}

export function getCategoryLabel(cat: string): string {
  return EXERCISE_CATEGORY_MAP[cat] ?? cat;
}

/** 肌群中文名列表（UI 筛选用） */
export const MUSCLE_GROUP_LABELS_CN = MUSCLE_GROUP_ORDER.map(k => MUSCLE_GROUP_MAP[k]);

/** 运动类型中文名列表（UI 筛选用） */
export const EXERCISE_CATEGORY_LABELS_CN = EXERCISE_CATEGORY_ORDER.map(k => EXERCISE_CATEGORY_MAP[k]);

/** 休息时间预设（秒） */
export const REST_TIME_PRESETS = [
  { label: '短', seconds: 60 },
  { label: '中', seconds: 90 },
  { label: '长', seconds: 120 },
  { label: '超长', seconds: 180 },
] as const;