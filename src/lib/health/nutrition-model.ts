import type { FoodLogDay, UserNutritionSettings, NutritionAnalysis, MacroBalance } from './types';

/**
 * Harris-Benedict BMR (revised Mifflin-St Jeor, 1990)
 * Male:   10×kg + 6.25×cm - 5×age + 5
 * Female: 10×kg + 6.25×cm - 5×age - 161
 */
function calcBMR(settings: UserNutritionSettings): number {
  const { weightKg = 70, heightCm = 170, age = 28, sex = 'male' } = settings;
  return sex === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

/**
 * Activity multiplier (Ainsworth MET table simplified):
 * 0-1 days/wk → 1.2 (sedentary)
 * 2-3 days/wk → 1.375 (lightly active)
 * 4-5 days/wk → 1.55 (moderately active)
 * 6+ days/wk  → 1.725 (very active)
 */
function activityMultiplier(daysPerWeek: number): number {
  if (daysPerWeek <= 1) return 1.2;
  if (daysPerWeek <= 3) return 1.375;
  if (daysPerWeek <= 5) return 1.55;
  return 1.725;
}

/** 0–100 adequacy score where 100 = exactly at target */
function adequacy(actual: number, target: number): number {
  if (target <= 0) return 100;
  const ratio = actual / target;
  // Penalise both under and over, but under-eating penalised more
  if (ratio <= 0) return 0;
  if (ratio < 1) return Math.round(ratio * 100);
  // Over by ≤ 20% → still 100; every 10% over 120% → -5pts
  const over = Math.max(0, ratio - 1.2);
  return Math.max(0, Math.round(100 - over * 50));
}

function macroBalanceLabel(p: number, c: number, f: number): MacroBalance {
  const avg = (p + c + f) / 3;
  if (avg >= 80) return 'excellent';
  if (avg >= 60) return 'good';
  if (avg >= 40) return 'fair';
  return 'poor';
}

function buildIssues(
  avgCal: number,
  tdee: number,
  pAdq: number,
  cAdq: number,
  fAdq: number,
  settings: UserNutritionSettings,
): string[] {
  const issues: string[] = [];
  const deficit = tdee - avgCal;

  if (deficit > 700) issues.push(`热量缺口过大（约 ${Math.round(deficit)} kcal/天），可能导致肌肉流失和代谢适应。`);
  if (deficit < -500) issues.push(`热量显著盈余（约 ${Math.round(-deficit)} kcal/天），若非增肌期，可能加速脂肪积累。`);
  if (pAdq < 60) {
    const targetP = settings.targetProtein ?? ((settings.weightKg ?? 70) * 1.8);
    issues.push(`蛋白质严重不足（目标 ${Math.round(targetP)}g/天），会显著影响肌肉合成和修复。`);
  } else if (pAdq < 80) {
    issues.push('蛋白质摄入低于目标，考虑在餐间增加高蛋白食物（鸡胸肉/希腊酸奶/蛋白粉）。');
  }
  if (cAdq < 50) issues.push('碳水化合物严重不足，会影响高强度训练表现和糖原恢复。');
  if (fAdq < 40) issues.push('脂肪摄入过低（< 目标的40%），可能影响激素合成（睾酮、GH）。');
  if (avgCal < 1200) issues.push('每日热量极低（< 1200 kcal），存在营养不足风险，建议咨询营养师。');

  return issues;
}

function buildSuggestions(
  deficit: number,
  pAdq: number,
  cAdq: number,
  daysLogged: number,
): string[] {
  const s: string[] = [];
  if (daysLogged < 3) s.push('记录天数不足，建议坚持至少7天饮食记录以获得可靠分析。');
  if (pAdq < 80) s.push('建议每餐至少包含30g蛋白质来源，并在训练后2小时内补充蛋白质。');
  if (deficit > 500 && deficit < 700) s.push('热量缺口合理，继续保持，但需确保蛋白质充足以保护肌肉量。');
  if (deficit > 700) s.push('建议将热量缺口控制在300-500 kcal/天，避免过激减脂导致肌肉流失。');
  if (cAdq < 70) s.push('训练前1-2小时补充复合碳水（燕麦/米饭），有助于提升训练表现。');
  if (s.length === 0) s.push('宏量营养素摄入均衡，保持当前饮食习惯，注意训练日可适当增加碳水。');
  return s;
}

/**
 * Analyse food log history and return a nutrition balance assessment.
 *
 * @param logs     - Up to 30 days of daily food log aggregates
 * @param settings - User nutrition targets and body metrics
 * @param actualTrainingDays - Real training days/week (used to refine TDEE)
 */
export function analyzeNutrition(
  logs: FoodLogDay[],
  settings: UserNutritionSettings,
  actualTrainingDays = 0,
): NutritionAnalysis {
  if (logs.length === 0) {
    return {
      avgDailyCalories: 0,
      estimatedTDEE: 0,
      calorieBalance: 0,
      proteinAdequacy: 0,
      carbAdequacy: 0,
      fatAdequacy: 0,
      macroBalance: 'poor',
      issues: ['暂无饮食记录，请先添加饮食日志。'],
      suggestions: [],
    };
  }

  const n = logs.length;
  const avgCal = logs.reduce((s, l) => s + l.calories, 0) / n;
  const avgP   = logs.reduce((s, l) => s + l.protein, 0) / n;
  const avgC   = logs.reduce((s, l) => s + l.carbs, 0) / n;
  const avgF   = logs.reduce((s, l) => s + l.fat, 0) / n;

  // Estimate TDEE
  const bmr = calcBMR(settings);
  const daysPerWeek = actualTrainingDays > 0 ? actualTrainingDays : (settings.trainingDaysPerWeek ?? 3);
  const tdee = Math.round(bmr * activityMultiplier(daysPerWeek));

  // Targets: use user settings if set, else derive from TDEE
  const targetCal = settings.targetCalories ?? tdee;
  const weightKg  = settings.weightKg ?? 70;
  const targetP   = settings.targetProtein   ?? weightKg * 1.8;
  const targetC   = settings.targetCarbs     ?? (targetCal * 0.45 / 4);  // 45% from carbs
  const targetF   = settings.targetFat       ?? (targetCal * 0.25 / 9);  // 25% from fat

  const pAdq = adequacy(avgP, targetP);
  const cAdq = adequacy(avgC, targetC);
  const fAdq = adequacy(avgF, targetF);

  const calorieBalance = Math.round(avgCal - tdee);  // positive = surplus
  const deficit = -calorieBalance;

  return {
    avgDailyCalories: Math.round(avgCal),
    estimatedTDEE: tdee,
    calorieBalance,
    proteinAdequacy: pAdq,
    carbAdequacy: cAdq,
    fatAdequacy: fAdq,
    macroBalance: macroBalanceLabel(pAdq, cAdq, fAdq),
    issues: buildIssues(avgCal, tdee, pAdq, cAdq, fAdq, { ...settings, targetProtein: targetP }),
    suggestions: buildSuggestions(deficit, pAdq, cAdq, n),
  };
}
