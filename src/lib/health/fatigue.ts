import type { WorkoutDay, FatigueResult, FatigueLevel } from './types';

/** Linearly interpolate x in [x0,x1] → [y0,y1], clamped */
function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return Math.min(y1, Math.max(y0, y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)));
}

/**
 * Map ACWR to a 0-100 fatigue score.
 *
 * ACWR sweet spot (Gabbett 2016, Blanch & Gabbett 2016):
 *   < 0.5  → severely under-trained / deloaded         → 5
 *   0.5–0.8 → recovered but undertrained               → 15–30
 *   0.8–1.3 → optimal load zone                        → 30–55
 *   1.3–1.5 → accumulating fatigue                     → 55–75
 *   > 1.5   → danger zone                              → 75–100
 */
function acwrToScore(acwr: number): number {
  if (acwr <= 0) return 5;
  if (acwr < 0.5) return lerp(acwr, 0, 0.5, 5, 15);
  if (acwr < 0.8) return lerp(acwr, 0.5, 0.8, 15, 30);
  if (acwr < 1.3) return lerp(acwr, 0.8, 1.3, 30, 55);
  if (acwr < 1.5) return lerp(acwr, 1.3, 1.5, 55, 75);
  return Math.min(100, lerp(acwr, 1.5, 2.5, 75, 100));
}

function levelFromScore(score: number): FatigueLevel {
  if (score < 30) return 'low';
  if (score < 55) return 'moderate';
  if (score < 75) return 'high';
  return 'very_high';
}

function buildRecommendation(level: FatigueLevel, acwr: number, daysSince: number): string {
  if (daysSince >= 5) return '已超过5天未训练，建议今天恢复轻量训练，重建节奏。';
  switch (level) {
    case 'low':
      return acwr < 0.5
        ? '训练量较低，可以安全增加训练强度，建议渐进性增加组数或重量。'
        : '恢复状态良好，可以安全进行高质量训练。';
    case 'moderate':
      return '训练负荷在合理范围内，保持当前节奏，注意充足睡眠和蛋白质摄入。';
    case 'high':
      return '训练量较高，疲劳积累明显。建议本周降低10-20%的训练量，或安排一天积极恢复。';
    case 'very_high':
      return 'ACWR 超出安全区间，受伤风险显著上升。强烈建议安排减量周（deload），降低50%训练量。';
  }
}

/** Population a daily-volume map keyed by YYYY-MM-DD from workout days */
function toDailyMap(workouts: WorkoutDay[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of workouts) {
    const key = w.date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + w.volume);
  }
  return map;
}

/**
 * Calculate ACWR-based fatigue.
 *
 * @param workouts - Workout days sorted oldest → newest (≥28 days recommended)
 */
export function calculateFatigue(workouts: WorkoutDay[]): FatigueResult {
  const now = Date.now();
  const MS_PER_DAY = 86_400_000;

  const dailyMap = toDailyMap(workouts);

  // ── Acute load (7 days) ──────────────────────────────────────────────────
  let acuteLoad = 0;
  for (const [dateStr, vol] of dailyMap) {
    const age = (now - new Date(dateStr).getTime()) / MS_PER_DAY;
    if (age <= 7) acuteLoad += vol;
  }

  // ── Chronic load (4-week avg) ────────────────────────────────────────────
  let total28 = 0;
  for (const [dateStr, vol] of dailyMap) {
    const age = (now - new Date(dateStr).getTime()) / MS_PER_DAY;
    if (age <= 28) total28 += vol;
  }
  const chronicLoad = total28 / 4;  // avg weekly volume

  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : acuteLoad > 0 ? 2 : 0;

  // ── Training Monotony (Foster et al.) ────────────────────────────────────
  const last7: number[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(now - d * MS_PER_DAY).toISOString().slice(0, 10);
    last7.push(dailyMap.get(date) ?? 0);
  }
  const mean7 = last7.reduce((s, v) => s + v, 0) / 7;
  const std7 = Math.sqrt(last7.reduce((s, v) => s + (v - mean7) ** 2, 0) / 7);
  const monotony = std7 > 0 ? mean7 / std7 : 1;
  const weeklyLoad = last7.reduce((s, v) => s + v, 0);
  const strain = weeklyLoad * monotony;

  // ── Days since last workout ──────────────────────────────────────────────
  let daysSinceLastWorkout = 999;
  if (workouts.length > 0) {
    const lastDate = workouts.reduce((latest, w) =>
      w.date > latest ? w.date : latest, workouts[0].date);
    daysSinceLastWorkout = Math.floor((now - lastDate.getTime()) / MS_PER_DAY);
  }

  // ── Monotony penalty (+0-15 bonus to score) ──────────────────────────────
  let baseScore = acwrToScore(acwr);
  if (monotony > 1.8 && weeklyLoad > 0) {
    baseScore = Math.min(100, baseScore + lerp(monotony, 1.8, 3, 0, 15));
  }

  // ── Rest bonus (every day of rest reduces score by 8, max -24) ──────────
  if (daysSinceLastWorkout > 0) {
    baseScore = Math.max(0, baseScore - Math.min(daysSinceLastWorkout * 8, 24));
  }

  const score = Math.round(baseScore);
  const level = levelFromScore(score);

  return {
    score,
    level,
    acwr: Math.round(acwr * 100) / 100,
    acuteLoad: Math.round(acuteLoad),
    chronicLoad: Math.round(chronicLoad),
    monotony: Math.round(monotony * 100) / 100,
    strain: Math.round(strain),
    daysSinceLastWorkout,
    recommendation: buildRecommendation(level, acwr, daysSinceLastWorkout),
  };
}
