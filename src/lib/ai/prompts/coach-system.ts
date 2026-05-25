import { buildPersonalityPrefix } from '../personality';
import { retrieve, formatRAGContext } from '../rag';
import type { CoachPersonality, UserContext, HealthSnapshotContext } from '../types';

const FATIGUE_CN: Record<string, string> = {
  low: '良好', moderate: '一般', high: '偏高', very_high: '很高',
};
const RISK_CN: Record<string, string> = {
  low: '低风险', moderate: '中等风险', high: '高风险', critical: '危险',
};

/**
 * Build the health status block and corresponding behavioral rules for the AI coach.
 * Rules are conditional on actual values to avoid noise when everything is fine.
 */
function buildHealthBlock(h: HealthSnapshotContext): string {
  const fatigueLine = `疲劳等级：${FATIGUE_CN[h.fatigueLevel] ?? h.fatigueLevel}（评分 ${h.fatigueScore}/100）| ACWR：${h.acwr.toFixed(2)} | 距上次训练：${h.daysSinceLastWorkout}天`;
  const riskLine    = `受伤风险：${RISK_CN[h.injuryRiskLevel] ?? h.injuryRiskLevel}（评分 ${h.injuryRiskScore}/100）${h.triggeredFactorNames.length > 0 ? `| 触发因子：${h.triggeredFactorNames.join('、')}` : ''}`;
  const calSign     = h.calorieBalance >= 0 ? '+' : '';
  const nutritionLine = `热量缺口：${calSign}${h.calorieBalance}kcal | 蛋白质达标：${h.proteinAdequacy}% | 宏量平衡：${h.macroBalance}`;

  const rules: string[] = [];

  // Fatigue rules
  if (h.fatigueLevel === 'very_high') {
    rules.push('⚠️ 用户当前疲劳极高（ACWR > 1.5 或训练单调性过高）——若涉及训练安排，必须优先建议减量或休息1-2天，不得推荐高强度训练。');
  } else if (h.fatigueLevel === 'high') {
    rules.push('⚠️ 用户疲劳偏高——若用户询问下一次训练计划，建议降低强度（70-75% 1RM）或以恢复性训练为主。');
  } else if (h.daysSinceLastWorkout >= 5) {
    rules.push('📌 用户已超过5天未训练——若涉及复训，提醒从70%原有强度开始，避免DOMS过重。');
  }

  // Injury risk rules
  if (h.injuryRiskLevel === 'critical' || h.injuryRiskLevel === 'high') {
    rules.push(`🚨 受伤风险${RISK_CN[h.injuryRiskLevel]}——回答任何训练相关问题时必须先点明风险因子（${h.triggeredFactorNames.join('、') || '见评估'}），并给出针对性的预防建议，不得仅回应训练增量。`);
  } else if (h.injuryRiskLevel === 'moderate' && h.triggeredFactorNames.length > 0) {
    rules.push(`📌 存在中等受伤风险因子（${h.triggeredFactorNames.join('、')}）——在推荐训练量时保守处理，避免单周训练量超过上周20%以上。`);
  }

  // Nutrition rules
  if (h.proteinAdequacy < 60) {
    rules.push('⚠️ 蛋白质严重不足（达标率 < 60%）——涉及增肌、恢复或训练表现话题时，必须提醒优化蛋白质摄入，不得仅讨论训练而忽略营养基础。');
  } else if (h.proteinAdequacy < 80) {
    rules.push('📌 蛋白质摄入低于目标（达标率 < 80%）——在增肌相关话题中主动提及蛋白质优化空间。');
  }
  if (Math.abs(h.calorieBalance) > 600) {
    const dir = h.calorieBalance > 0 ? '热量盈余过大' : '热量缺口过大';
    rules.push(`📌 ${dir}（${Math.abs(h.calorieBalance)}kcal）——涉及体成分目标时给出针对性提醒。`);
  }

  let block = `\n\n--- 用户当前健康状态（实时计算）---\n${fatigueLine}\n${riskLine}\n${nutritionLine}`;

  if (h.nutritionIssues.length > 0) {
    block += `\n营养问题：${h.nutritionIssues.slice(0, 2).join('；')}`;
  }

  if (rules.length > 0) {
    block += `\n\n【教练行为规则（基于当前健康状态）】\n${rules.join('\n')}`;
  }

  return block;
}

/**
 * Build the unified coach system prompt.
 * Combines personality prefix, user context, health snapshot, and RAG-retrieved knowledge.
 */
export function buildCoachSystemPrompt(
  ctx: UserContext,
  userQuery = '',
): string {
  const personality: CoachPersonality = ctx.personality ?? 'direct';
  const personalityBlock = buildPersonalityPrefix(personality);

  const userName = ctx.userName || '用户';

  let userContextBlock = `\n\n--- 用户信息 ---\n用户名：${userName}`;

  if (ctx.userSettings) {
    const { fitnessGoal, weight, height } = ctx.userSettings;
    if (fitnessGoal) userContextBlock += `\n健身目标：${fitnessGoal}`;
    if (weight) userContextBlock += `\n体重：${weight}kg`;
    if (height) userContextBlock += `\n身高：${height}cm`;
  }

  if (ctx.recentWorkouts && ctx.recentWorkouts.length > 0) {
    userContextBlock += `\n\n--- 近期训练记录（最新在前）---\n${ctx.recentWorkouts.join('\n')}`;
  }

  if (ctx.recentFoodLogs && ctx.recentFoodLogs.length > 0) {
    userContextBlock += `\n\n--- 近期饮食记录（14天内）---\n${ctx.recentFoodLogs.join('\n')}`;
  }

  // Health snapshot block (injected only when data is available)
  const healthBlock = ctx.healthSnapshot ? buildHealthBlock(ctx.healthSnapshot) : '';

  // RAG: retrieve relevant knowledge based on health state + user query
  const ragQuery = [
    userQuery,
    ctx.healthSnapshot?.fatigueLevel === 'high' || ctx.healthSnapshot?.fatigueLevel === 'very_high' ? '疲劳恢复' : '',
    ctx.healthSnapshot?.injuryRiskLevel === 'high' || ctx.healthSnapshot?.injuryRiskLevel === 'critical' ? '受伤风险' : '',
    ...(ctx.recentWorkouts ?? []).slice(0, 2),
  ].filter(Boolean).join(' ');
  const ragResults = retrieve(ragQuery, 3);
  const ragBlock = formatRAGContext(ragResults);

  const formatBlock = `\n\n【输出格式】
- 回答使用自然中文，**关键数字和重点词**可加粗，不用其他 Markdown 符号
- 欢迎语 / 主动建议：2-3句，不超过60字
- 普通问答：不超过200字（用户明确要详细时除外）
- 数字一律带单位（kg、kcal、%、次），不用省略`;

  return `${personalityBlock}${userContextBlock}${healthBlock}${ragBlock}${formatBlock}\n\n你的回答必须是中文。`;
}
