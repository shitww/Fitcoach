export interface WorkoutFeedbackContext {
  workoutType: 'strength' | 'cardio' | 'free';
  durationMin: number;
  totalVolume?: number;
  totalSets?: number;
  maxWeight?: number;
  notes?: string;
  exercises?: Array<{
    name: string;
    sets: Array<{
      weight: number;
      reps: number;
      rir?: number | null;
      isFailure?: boolean;
      isWarmup?: boolean;
    }>;
  }>;
  cardioData?: {
    machine: string;
    speed?: number;
    incline?: number;
    level?: number;
    distance?: number;
    calories?: number;
  };
}

export function buildFeedbackPrompt(ctx: WorkoutFeedbackContext): string {
  let contextBlock = '';

  if (ctx.workoutType === 'free') {
    contextBlock = `训练类型：自由记录\n时长：${ctx.durationMin} 分钟\n训练内容：${ctx.notes || '（未填写）'}`;
  } else if (ctx.workoutType === 'cardio' && ctx.cardioData) {
    const { machine, speed, incline, level, distance, calories } = ctx.cardioData;
    const label = machine === 'treadmill' ? '跑步机' : '爬楼机/踏步机';
    contextBlock = `训练类型：有氧训练（${label}）\n时长：${ctx.durationMin} 分钟`;
    if (machine === 'treadmill') {
      contextBlock += `\n速度：${speed} km/h，坡度：${incline}%\n距离：${Number(distance || 0).toFixed(2)} km，消耗热量：${calories} kcal`;
    } else {
      contextBlock += `\n档位：${level}，消耗热量：${calories} kcal`;
    }
  } else {
    const exLines = (ctx.exercises || []).map(ex => {
      const workSets = ex.sets.filter(s => !s.isWarmup);
      const setStr = workSets.map((s, idx) => {
        const w = s.weight > 0 ? `${s.weight}kg` : '自重';
        const rir = s.rir != null ? ` RIR${s.rir}` : '';
        const fail = s.isFailure ? '⚡力竭' : '';
        return `    第${idx + 1}组 ${w}×${s.reps}次${rir}${fail}`;
      }).join('\n');
      const vol = workSets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
      return `  · ${ex.name}（${workSets.length}组，总量${vol}kg）：\n${setStr}`;
    }).join('\n');

    contextBlock = `训练类型：力量训练\n时长：${ctx.durationMin} 分钟\n总训练量：${ctx.totalVolume} kg | 完成组数：${ctx.totalSets} 组 | 最大重量：${ctx.maxWeight} kg\n完整训练记录：\n${exLines || '  （暂无数据）'}`;
  }

  const rirGuide = ctx.workoutType === 'strength' ? `
【RIR 解读参考】RIR = 距力竭剩余次数
- RIR 0-1：接近/到达力竭，神经系统压力大，需要较长恢复
- RIR 2-3：高强度区间，适合力量积累
- RIR 4+：保守训练，可适当加重
- isFailure=true：力竭组，分析时标注为高疲劳信号` : '';

  const cardioGuide = ctx.workoutType === 'cardio' && ctx.cardioData?.machine === 'treadmill' ? `
【跑步配速区间参考】
- < 7 km/h：热身/恢复区（Zone 1-2）
- 7-10 km/h：有氧基础区（Zone 2-3，脂肪供能为主）
- 10-13 km/h：有氧强化区（Zone 3-4）
- > 13 km/h：阈值/无氧区（Zone 4-5）
坡度每增加1%约等效增加5-8%跑步强度` : '';

  return `${contextBlock}${rirGuide}${cardioGuide}

分析要求（不要复述用户已知的训练内容，只给用户看不到的洞察）：
- summary：整体评价，重点评估训练强度分布和节奏合理性（25字内）
- progress：本次最值得关注的1个进步点或1个风险点，必须引用具体数据（如某动作的重量/组数）
- fatigue：结合训练量、时长、力竭组数评估恢复需求，明确给出建议休息时间（如"建议休息48小时"）
- suggestions：恰好3条，每条针对本次训练的具体问题，不是通用建议
- nextSteps：恰好2条，下次训练的具体调整（明确到重量增减数字、动作顺序变化）

严格JSON，不含其他文字：
{"summary":"...","progress":"...","fatigue":"...","suggestions":["...","...","..."],"nextSteps":["...","..."]}`;
}
