export interface PlanContext {
  fitnessGoal: string;
  daysPerWeek: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availableEquipment?: string[];
  weakMuscleGroups?: string[];
  recentPRs?: Array<{ exercise: string; weight: number; reps: number }>;
  currentVolume?: {
    chest?: number; back?: number; legs?: number;
    shoulders?: number; arms?: number;
  };
}

export function buildPlanPrompt(ctx: PlanContext): string {
  const equipment = ctx.availableEquipment?.join('、') || '完整器械';
  const weak = ctx.weakMuscleGroups?.join('、') || '无';
  const prBlock = ctx.recentPRs?.length
    ? `\n近期最大重量：${ctx.recentPRs.map(p => `${p.exercise} ${p.weight}kg×${p.reps}`).join('、')}`
    : '';
  const volBlock = ctx.currentVolume
    ? `\n当前每周训练量（组/周）：${Object.entries(ctx.currentVolume).map(([k, v]) => `${k}=${v}`).join(' ')}`
    : '';

  const levelMap = { beginner: '新手（<1年）', intermediate: '中级（1-3年）', advanced: '进阶（>3年）' };

  const progressionRef = ctx.experienceLevel === 'beginner'
    ? '线性递增：每次训练同一动作增加 2.5kg（下肢）或 1.25kg（上肢）直到停滞'
    : ctx.experienceLevel === 'intermediate'
    ? '每周波动：高强度日 85%1RM×3-5次，中等日 75%×6-8次，轻松日 65%×10-12次'
    : '块状周期：3周渐进加重后第4周减量至70%，下一个周期起始重量比上一块高5%';

  return `用户训练背景：
目标：${ctx.fitnessGoal}
训练频率：每周 ${ctx.daysPerWeek} 天
训练水平：${levelMap[ctx.experienceLevel]}
可用器械：${equipment}
薄弱肌群：${weak}${prBlock}${volBlock}

渐进超负荷参考（按水平）：${progressionRef}

生成科学训练计划（严格JSON）：
{
  "planName": "计划名称",
  "overview": "计划逻辑说明（2句，包含分化方式和周期安排）",
  "weeklyStructure": [
    {
      "day": "训练日1",
      "focus": "训练重点（如：推系/胸肩三）",
      "exercises": [
        {"name": "动作名", "sets": 4, "reps": "8-10", "rest": "90s", "notes": "技术要点"}
      ]
    }
  ],
  "progressionGuide": "本计划的具体递增方案（引用上方参考，给出数字）",
  "deloadRecommendation": "减量周时机和方式",
  "warning": "最需要注意的训练安全事项（热身、易伤部位等，必填，不得为空）"
}`;
}

export function buildWorkoutSuggestionPrompt(opts: {
  recentWorkouts: string;
  fatigueLevel?: number;
  lastTrainedMuscles?: string[];
}): string {
  const fatigue = opts.fatigueLevel != null
    ? `\n当前疲劳指数：${opts.fatigueLevel}/100（${opts.fatigueLevel > 70 ? '偏高，建议轻松训练或休息' : opts.fatigueLevel > 40 ? '适中' : '较低，可以高强度'}）`
    : '';
  const lastTrained = opts.lastTrainedMuscles?.length
    ? `\n上次主要训练肌群：${opts.lastTrainedMuscles.join('、')}`
    : '';

  return `近期训练记录：
${opts.recentWorkouts}${fatigue}${lastTrained}

基于以上数据给出今日训练建议。严格JSON：
{"suggestion":"今日建议，具体到目标肌群、建议强度区间（%1RM或RPE）（2句）","exercises":["推荐动作1","推荐动作2","推荐动作3"],"warning":"今日最需注意的1件事（安全/恢复/营养），必填，不得输出空字符串"}`;
}
