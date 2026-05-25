/**
 * TemplateStrategy — Synchronous, deterministic, zero-network curated templates.
 *
 * Rules:
 *   - NO AI calls
 *   - NO network requests
 *   - Beginner-first
 *   - Exercises match names used by the existing exercise DB (Chinese + English alias)
 */

import type {
  StrengthWorkoutPlan,
  CardioWorkoutPlan,
  RecoveryWorkoutPlan,
  PlannedExercise,
  PlannedSet,
  MuscleGroup,
  CardioType,
  RecoveryFocus,
  FitnessLevel,
  PlanMeta,
} from '@/types/workout-plan';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePlanMeta(
  mode: 'strength' | 'cardio' | 'recovery',
  level: FitnessLevel,
  durationMin: number,
): PlanMeta & { mode: 'strength' | 'cardio' | 'recovery' } {
  return {
    id: `template-${mode}-${Date.now()}`,
    mode,
    generatedAt: Date.now(),
    estimatedDurationMin: durationMin,
    level,
    source: 'template',
  };
}

function sets(count: number, reps: number, restSec: number, weight: number | null = null): PlannedSet[] {
  return Array.from({ length: count }, () => ({ weight, reps, restSec }));
}

function exercise(name: string, plannedSets: PlannedSet[], notes?: string): PlannedExercise {
  return { name, sets: plannedSets, notes };
}

// ── Muscle group labels ───────────────────────────────────────────────────────

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  arms: '手臂',
  abs: '腹部',
  fullbody: '全身',
};

// ── Strength templates ────────────────────────────────────────────────────────

const STRENGTH_TEMPLATES: Record<
  MuscleGroup,
  Record<FitnessLevel, PlannedExercise[]>
> = {
  chest: {
    beginner: [
      exercise('卧推 (Bench Press)',         sets(3, 10, 90, null), '找到合适重量，感受胸肌发力'),
      exercise('哑铃卧推 (Dumbbell Press)',   sets(3, 12, 90, null)),
      exercise('俯卧撑 (Push Up)',            sets(3, 15, 60, 0),   '自重即可，保持核心收紧'),
    ],
    intermediate: [
      exercise('卧推 (Bench Press)',         sets(4, 8,  90, null)),
      exercise('上斜卧推 (Incline Press)',   sets(3, 10, 90, null)),
      exercise('胸肌夹胸 (Cable Crossover)', sets(3, 12, 60, null)),
      exercise('双杠臂屈伸 (Dips)',          sets(3, 10, 90, 0)),
    ],
    advanced: [
      exercise('卧推 (Bench Press)',         sets(5, 5,  120, null)),
      exercise('上斜卧推 (Incline Press)',   sets(4, 8,  90,  null)),
      exercise('胸肌夹胸 (Cable Crossover)', sets(4, 12, 60,  null)),
      exercise('双杠臂屈伸 (Dips)',          sets(4, 12, 90,  0)),
      exercise('哑铃飞鸟 (Dumbbell Fly)',    sets(3, 15, 60,  null)),
    ],
  },
  back: {
    beginner: [
      exercise('硬拉 (Deadlift)',                  sets(3, 8,  120, null), '从轻重量开始，专注动作质量'),
      exercise('引体向上 (Pull Up)',               sets(3, 5,  90,  0),   '无法完成可借助辅助机'),
      exercise('哑铃单臂划船 (One-Arm Dumbbell Row)', sets(3, 10, 90, null)),
    ],
    intermediate: [
      exercise('硬拉 (Deadlift)',                  sets(4, 6,  120, null)),
      exercise('引体向上 (Pull Up)',               sets(4, 8,  90,  0)),
      exercise('杠铃划船 (Barbell Row)',            sets(3, 10, 90,  null)),
      exercise('下拉 (Lat Pulldown)',              sets(3, 12, 90,  null)),
    ],
    advanced: [
      exercise('硬拉 (Deadlift)',                  sets(5, 5,  120, null)),
      exercise('引体向上 (Pull Up)',               sets(4, 10, 90,  0)),
      exercise('杠铃划船 (Barbell Row)',            sets(4, 8,  90,  null)),
      exercise('下拉 (Lat Pulldown)',              sets(3, 12, 90,  null)),
      exercise('哑铃单臂划船 (One-Arm Dumbbell Row)', sets(3, 12, 60, null)),
    ],
  },
  legs: {
    beginner: [
      exercise('深蹲 (Squat)',                    sets(3, 10, 120, null), '脚与肩同宽，膝盖不超脚尖'),
      exercise('腿举 (Leg Press)',               sets(3, 12, 90,  null)),
      exercise('箭步蹲 (Lunge)',                 sets(3, 10, 90,  0),   '每侧 10 次'),
    ],
    intermediate: [
      exercise('深蹲 (Squat)',                    sets(4, 8,  120, null)),
      exercise('罗马尼亚硬拉 (Romanian Deadlift)', sets(4, 10, 90,  null)),
      exercise('腿举 (Leg Press)',               sets(3, 12, 90,  null)),
      exercise('腿弯举 (Leg Curl)',              sets(3, 12, 90,  null)),
    ],
    advanced: [
      exercise('深蹲 (Squat)',                    sets(5, 5,  120, null)),
      exercise('罗马尼亚硬拉 (Romanian Deadlift)', sets(4, 8,  120, null)),
      exercise('腿举 (Leg Press)',               sets(4, 12, 90,  null)),
      exercise('腿弯举 (Leg Curl)',              sets(4, 12, 90,  null)),
      exercise('提踵 (Calf Raise)',              sets(4, 20, 60,  0)),
    ],
  },
  shoulders: {
    beginner: [
      exercise('哑铃肩推 (Dumbbell Shoulder Press)', sets(3, 10, 90, null)),
      exercise('侧平举 (Lateral Raise)',              sets(3, 12, 60, null), '手肘微弯，不要借力'),
      exercise('前平举 (Front Raise)',               sets(3, 12, 60, null)),
    ],
    intermediate: [
      exercise('肩上推举 (Overhead Press)',           sets(4, 8,  90, null)),
      exercise('哑铃肩推 (Dumbbell Shoulder Press)', sets(3, 10, 90, null)),
      exercise('侧平举 (Lateral Raise)',              sets(4, 15, 60, null)),
      exercise('反向飞鸟 (Rear Delt Fly)',            sets(3, 15, 60, null)),
    ],
    advanced: [
      exercise('肩上推举 (Overhead Press)',           sets(5, 5,  120, null)),
      exercise('哑铃肩推 (Dumbbell Shoulder Press)', sets(4, 8,  90,  null)),
      exercise('侧平举 (Lateral Raise)',              sets(4, 15, 60,  null)),
      exercise('反向飞鸟 (Rear Delt Fly)',            sets(4, 15, 60,  null)),
      exercise('绳索面拉 (Face Pull)',               sets(3, 20, 60,  null)),
    ],
  },
  arms: {
    beginner: [
      exercise('二头肌弯举 (Bicep Curl)',         sets(3, 12, 60, null)),
      exercise('三头肌下压 (Tricep Pushdown)',    sets(3, 12, 60, null)),
      exercise('锤式弯举 (Hammer Curl)',          sets(3, 12, 60, null)),
    ],
    intermediate: [
      exercise('二头肌弯举 (Bicep Curl)',         sets(4, 10, 60, null)),
      exercise('锤式弯举 (Hammer Curl)',          sets(3, 12, 60, null)),
      exercise('三头肌下压 (Tricep Pushdown)',    sets(4, 12, 60, null)),
      exercise('双杠臂屈伸 (Dips)',               sets(3, 10, 90, 0)),
    ],
    advanced: [
      exercise('二头肌弯举 (Bicep Curl)',         sets(4, 10, 60,  null)),
      exercise('锤式弯举 (Hammer Curl)',          sets(4, 12, 60,  null)),
      exercise('上斜哑铃弯举 (Incline Curl)',     sets(3, 12, 60,  null)),
      exercise('三头肌下压 (Tricep Pushdown)',    sets(4, 12, 60,  null)),
      exercise('双杠臂屈伸 (Dips)',               sets(4, 12, 90,  0)),
      exercise('窄距卧推 (Close Grip Bench Press)', sets(3, 10, 90, null)),
    ],
  },
  abs: {
    beginner: [
      exercise('仰卧起坐 (Sit Up)',           sets(3, 15, 60, 0)),
      exercise('平板支撑 (Plank)',             sets(3, 30, 60, 0), '保持 30 秒，感受腹部发力'),
      exercise('卷腹 (Crunch)',               sets(3, 20, 60, 0)),
    ],
    intermediate: [
      exercise('仰卧起坐 (Sit Up)',           sets(4, 20, 60, 0)),
      exercise('平板支撑 (Plank)',             sets(3, 45, 60, 0)),
      exercise('俄罗斯转体 (Russian Twist)',   sets(3, 20, 60, 0)),
      exercise('腿举 (Leg Raise)',            sets(3, 15, 60, 0)),
    ],
    advanced: [
      exercise('平板支撑 (Plank)',             sets(4, 60, 60,  0)),
      exercise('悬垂举腿 (Hanging Leg Raise)', sets(4, 12, 90,  0)),
      exercise('俄罗斯转体 (Russian Twist)',   sets(4, 20, 60,  null)),
      exercise('卷腹 (Crunch)',               sets(4, 25, 60,  0)),
      exercise('腿举 (Leg Raise)',            sets(3, 20, 60,  0)),
    ],
  },
  fullbody: {
    beginner: [
      exercise('深蹲 (Squat)',           sets(3, 10, 90, 0),   '自重即可'),
      exercise('俯卧撑 (Push Up)',        sets(3, 10, 90, 0)),
      exercise('引体向上 (Pull Up)',      sets(3, 5,  90, 0),   '无法完成可用弹力带辅助'),
      exercise('箭步蹲 (Lunge)',         sets(3, 10, 90, 0),   '每侧 10 次'),
    ],
    intermediate: [
      exercise('深蹲 (Squat)',           sets(4, 8,  90,  null)),
      exercise('卧推 (Bench Press)',     sets(4, 8,  90,  null)),
      exercise('硬拉 (Deadlift)',        sets(4, 6,  120, null)),
      exercise('肩上推举 (Overhead Press)', sets(3, 10, 90, null)),
    ],
    advanced: [
      exercise('深蹲 (Squat)',           sets(5, 5,  120, null)),
      exercise('卧推 (Bench Press)',     sets(5, 5,  120, null)),
      exercise('硬拉 (Deadlift)',        sets(5, 5,  120, null)),
      exercise('肩上推举 (Overhead Press)', sets(4, 8, 90, null)),
      exercise('引体向上 (Pull Up)',      sets(4, 8,  90, 0)),
    ],
  },
};

// ── Recovery templates ────────────────────────────────────────────────────────

const RECOVERY_LABELS: Record<RecoveryFocus, string> = {
  full_body: '全身放松',
  upper_body: '上肢恢复',
  lower_body: '下肢恢复',
  back: '背部放松',
  mobility: '灵活性训练',
};

const RECOVERY_TEMPLATES: Record<RecoveryFocus, Array<{ name: string; durationSec: number; description: string }>> = {
  full_body: [
    { name: '猫牛式拉伸', durationSec: 60, description: '四肢着地，交替弓背和塌腰，感受脊柱放松' },
    { name: '肩部环绕', durationSec: 45, description: '站立，双肩向前向后各缓慢绕圈 10 次' },
    { name: '站立腿后侧拉伸', durationSec: 45, description: '单腿向前伸直，上身前倾，保持腿后侧拉伸感' },
    { name: '儿童式', durationSec: 60, description: '双膝跪地，臀部向后坐，手臂向前伸展，放松背部' },
    { name: '卧式扭转', durationSec: 60, description: '仰卧，膝盖弯曲倒向一侧，感受脊柱旋转' },
    { name: '深呼吸放松', durationSec: 90, description: '闭眼仰卧，用腹式呼吸节奏放松全身' },
  ],
  upper_body: [
    { name: '肩部横向拉伸', durationSec: 45, description: '单臂横过胸前，另一手固定，保持肩后侧拉伸' },
    { name: '三角肌前拉伸', durationSec: 45, description: '手臂高举后屈，用另一手轻压肘部' },
    { name: '胸部开肩伸展', durationSec: 60, description: '双手在背后十指相扣，挺胸扩肩，感受胸肌拉伸' },
    { name: '颈部侧向拉伸', durationSec: 30, description: '头缓慢向一侧倾，感受颈部一侧拉伸，左右各一次' },
    { name: '前臂拉伸', durationSec: 30, description: '手掌朝下按压，肘部伸直，感受前臂拉伸' },
    { name: '斜方肌放松', durationSec: 45, description: '低头，双手轻扶脑后，感受颈后肌肉放松' },
  ],
  lower_body: [
    { name: '站立股四头肌拉伸', durationSec: 45, description: '单脚向后弯曲，手抓脚踝，保持平衡' },
    { name: '腿后侧拉伸', durationSec: 60, description: '坐立，腿向前伸直，上身缓慢前倾' },
    { name: '弓步髋屈肌拉伸', durationSec: 60, description: '单腿跪地向前弓步，感受后腿髋屈肌拉伸' },
    { name: '蝴蝶式内收肌拉伸', durationSec: 60, description: '坐姿，双脚掌合并，双手轻压膝盖' },
    { name: '小腿拉伸', durationSec: 45, description: '面对墙站立，单腿向后伸直，脚跟踩地' },
    { name: '臀部鸽式拉伸', durationSec: 60, description: '仰卧，单脚踝搭在对侧膝盖上，双手抱腿向胸口' },
  ],
  back: [
    { name: '猫牛式', durationSec: 60, description: '四肢着地，交替弓背塌腰，每次保持 3 秒' },
    { name: '儿童式', durationSec: 90, description: '臀部向后坐，手臂向前伸展，感受背部深层拉伸' },
    { name: '脊柱扭转', durationSec: 60, description: '坐姿，双腿伸直，单腿弯曲踩过，扭转上身' },
    { name: '下背部拉伸', durationSec: 60, description: '仰卧，双膝抱胸，缓慢左右滚动' },
    { name: '眼镜蛇式', durationSec: 45, description: '俯卧，用手撑起上身，感受腹部和下背部拉伸' },
  ],
  mobility: [
    { name: '世界上最伟大的拉伸', durationSec: 90, description: '弓步姿势，旋转上身，充分拉伸髋部和胸腔' },
    { name: '深蹲蹲起活动', durationSec: 60, description: '慢速深蹲至底，在底部保持 5 秒后起立' },
    { name: '肩关节画圈', durationSec: 45, description: '双臂伸直，以肩关节为轴画大圆圈' },
    { name: '髋部环绕', durationSec: 60, description: '双手叉腰，髋部顺时针逆时针各画圆 10 次' },
    { name: '踝关节活动', durationSec: 30, description: '坐立，脚踝向各方向画圆，改善踝关节灵活性' },
    { name: '胸椎旋转', durationSec: 60, description: '侧卧，上侧手臂向天花板方向旋转展开' },
  ],
};

// ── Public API ────────────────────────────────────────────────────────────────

export interface StrengthTemplateInput {
  muscleGroup: MuscleGroup;
  durationMin: number;
  level: FitnessLevel;
}

export interface CardioTemplateInput {
  cardioType: CardioType;
  durationMin: number;
  level: FitnessLevel;
}

export interface RecoveryTemplateInput {
  focus: RecoveryFocus;
  durationMin: number;
  level: FitnessLevel;
}

export function generateStrengthTemplate(input: StrengthTemplateInput): StrengthWorkoutPlan {
  const exercises = STRENGTH_TEMPLATES[input.muscleGroup][input.level];
  return {
    meta: makePlanMeta('strength', input.level, input.durationMin) as PlanMeta & { mode: 'strength' },
    muscleGroup: input.muscleGroup,
    muscleGroupLabel: MUSCLE_GROUP_LABELS[input.muscleGroup],
    exercises,
  };
}

export function generateCardioTemplate(input: CardioTemplateInput): CardioWorkoutPlan {
  const defaults: Record<CardioType, { speed?: number; incline?: number; level?: number }> = {
    treadmill:    { speed: 8, incline: 1 },
    stairclimber: { level: 5 },
  };
  const d = defaults[input.cardioType];
  return {
    meta: makePlanMeta('cardio', input.level, input.durationMin) as PlanMeta & { mode: 'cardio' },
    cardioType: input.cardioType,
    targetDurationMin: input.durationMin,
    suggestedSpeed:   d.speed,
    suggestedIncline: d.incline,
    suggestedLevel:   d.level,
  };
}

export function generateRecoveryTemplate(input: RecoveryTemplateInput): RecoveryWorkoutPlan {
  const steps = RECOVERY_TEMPLATES[input.focus];
  return {
    meta: makePlanMeta('recovery', input.level, input.durationMin) as PlanMeta & { mode: 'recovery' },
    focus: input.focus,
    focusLabel: RECOVERY_LABELS[input.focus],
    steps,
  };
}
