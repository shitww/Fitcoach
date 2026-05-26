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

以私人教练口吻写一段真实反馈（150-250字中文）。要求：
① 直接用"你"称呼，口气像真实教练当面说话，不要说教，不要套话
② 必须引用本次训练的具体数字（重量/组数/RIR/时长），不能泛泛而谈
③ 指出1个本次做得好的地方（数据支撑）
④ 指出1个最需要改进的问题（数据支撑）
⑤ 给出下次训练的1个具体调整（如"卧推第3组可以从60kg试试65kg，RIR还有3"）
⑥ 语气自然可口语化，结尾不要写"加油"之类的空话

严格JSON，无其他文字：
{"coach":"..."}`;
}
