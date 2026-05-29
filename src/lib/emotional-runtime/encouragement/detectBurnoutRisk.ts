// ── Detect Burnout Risk ───────────────────────────────────────────────────────
// Identifies over-training patterns before they become problems.
// ─────────────────────────────────────────────────────────────────────────────

import type { BurnoutRiskState } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';

/** Detect burnout risk from training load + recovery data. */
export function detectBurnoutRisk(
  progress: ProgressData,
  recovery: RecoveryData
): BurnoutRiskState {
  const twoWeekCount = progress.last14Days.filter((d) => d.done).length;
  const sevenDayCount = progress.last14Days.slice(7).filter((d) => d.done).length;
  const signals: string[] = [];

  // High frequency signal
  if (twoWeekCount >= 12) signals.push('两周内训练频率极高（≥12次）');
  else if (sevenDayCount >= 6) signals.push('近 7 天连续高频训练');

  // Fatigue signal
  if (recovery.fatigueScore >= 70) signals.push('疲劳指数偏高');
  if (recovery.fatigueLevel === 'high') signals.push('当前疲劳等级：高');

  // Rest signal: not taking rest days
  const lastWeek = progress.last14Days.slice(7);
  const restDays = lastWeek.filter((d) => !d.done).length;
  if (restDays === 0 && sevenDayCount >= 5) signals.push('本周未安排休息日');

  const riskLevel = signals.length >= 3 ? 'high' :
                    signals.length === 2 ? 'moderate' :
                    signals.length === 1 ? 'mild' : 'none';

  const recommendation = riskLevel !== 'none'
    ? buildRecommendation(riskLevel, signals)
    : null;

  return {
    isAtRisk: riskLevel !== 'none',
    riskLevel,
    signals,
    recommendation,
  };
}

function buildRecommendation(
  level: 'mild' | 'moderate' | 'high',
  signals: string[]
): string {
  if (level === 'high') return '建议本周增加 2 天主动恢复，降低训练强度';
  if (signals.some((s) => s.includes('休息'))) return '建议本周安排至少 1–2 天完整休息';
  return '建议今天适当降低训练强度';
}
