export interface DietAnalysisContext {
  period: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  targetCalories?: number;
  weight?: number;
  fitnessGoal?: string;
  dailyLogs?: Array<{ date: string; calories: number; protein: number }>;
}

export function buildDietInsightPrompt(ctx: DietAnalysisContext): string {
  const calDiff = ctx.targetCalories
    ? (ctx.avgCalories > ctx.targetCalories
        ? `超出 ${ctx.avgCalories - ctx.targetCalories} kcal`
        : `缺口 ${ctx.targetCalories - ctx.avgCalories} kcal`)
    : '';

  const proteinPerKg = ctx.weight ? (ctx.avgProtein / ctx.weight).toFixed(1) : null;
  const proteinTarget = ctx.weight
    ? `（实际 ${proteinPerKg}g/kg，力量训练推荐 1.6-2.2g/kg，最低 1.2g/kg）`
    : '';

  const macroBlock = `平均每日摄入：
- 热量：${ctx.avgCalories} kcal${ctx.targetCalories ? `（目标 ${ctx.targetCalories} kcal，${calDiff}）` : ''}
- 蛋白质：${ctx.avgProtein}g${proteinTarget}
- 碳水：${ctx.avgCarbs}g
- 脂肪：${ctx.avgFat}g`;

  const goalBlock = ctx.fitnessGoal ? `\n用户健身目标：${ctx.fitnessGoal}` : '';
  const weightBlock = ctx.weight ? `\n用户体重：${ctx.weight}kg` : '';

  const trendBlock = ctx.dailyLogs && ctx.dailyLogs.length > 0
    ? `\n\n每日趋势：\n${ctx.dailyLogs.map(d => `${d.date}: ${d.calories}kcal 蛋白${d.protein}g`).join('\n')}`
    : '';

  return `分析周期：${ctx.period}\n${macroBlock}${weightBlock}${goalBlock}${trendBlock}

分析要求：
- overall：整体评价，必须基于具体数值，不用泛泛而谈（2句内）
- proteinAssessment：对照 1.6-2.2g/kg 标准判断是否达标，给出实际差距（如"缺口约30g"）
- calorieBalance：热量偏差对目标的具体影响（增肌/减脂/体重维持）
- keyIssues：恰好2个最关键问题（有数据支撑，非泛泛而谈）
- improvements：恰好3条可立即执行的建议（具体到食物或克数）
- mealTiming：基于目标给出训练前2小时和训练后30分钟的具体建议

严格JSON格式：
{"overall":"...","proteinAssessment":"...","calorieBalance":"...","keyIssues":["...","..."],"improvements":["...","...","..."],"mealTiming":"..."}`;
}

export function buildWeeklyDietReportPrompt(ctx: DietAnalysisContext & {
  workoutDays: number;
  topFoods?: string[];
}): string {
  const proteinPerKg = ctx.weight ? ` | 蛋白质 ${(ctx.avgProtein / ctx.weight).toFixed(1)}g/kg` : '';
  const calStatus = ctx.targetCalories
    ? `（目标 ${ctx.targetCalories} kcal，${ctx.avgCalories > ctx.targetCalories ? `超出 ${ctx.avgCalories - ctx.targetCalories}` : `缺口 ${ctx.targetCalories - ctx.avgCalories}`} kcal）`
    : '';

  return `本周饮食数据（训练 ${ctx.workoutDays} 天 / 7 天）：
热量 ${ctx.avgCalories} kcal/天${calStatus}
蛋白质 ${ctx.avgProtein}g | 碳水 ${ctx.avgCarbs}g | 脂肪 ${ctx.avgFat}g${proteinPerKg}
${ctx.weight ? `体重：${ctx.weight}kg` : ''}${ctx.fitnessGoal ? `，目标：${ctx.fitnessGoal}` : ''}
${ctx.topFoods?.length ? `常摄入食物：${ctx.topFoods.join('、')}` : ''}

输出本周饮食复盘（严格JSON，不含其他文字）：
{"summary":"总体评价，必须提及热量和蛋白质是否达标（2句）","score":0-10,"highlights":["具体亮点1（含数据）","亮点2"],"concerns":["具体问题1（含数据）","问题2"],"nextWeekAdvice":"下周最重要的1个调整（具体到食物或克数）"}`;
}
