import type { WorkoutDay, InjuryRiskFactor, InjuryRiskResult, InjuryRiskLevel } from './types';

const PUSH_MUSCLES = new Set(['chest', 'shoulders', 'triceps', 'arms']);
const PULL_MUSCLES = new Set(['back', 'biceps']);
const LOWER_MUSCLES = new Set(['legs', 'glutes', 'calves']);

interface FactorDef {
  id: string;
  name: string;
  check: (data: AnalysisData) => { triggered: boolean; description: string; severity: 'info' | 'warning' | 'danger'; value?: number };
}

interface AnalysisData {
  workouts: WorkoutDay[];
  weeklyVolumes: number[];       // [this week, last week, week-2, week-3]
  consecutiveDays: number;
  acwr: number;
  monotony: number;
  daysSinceLast: number;
  pushCount: number;
  pullCount: number;
}

const FACTORS: FactorDef[] = [
  {
    id: 'acwr_high',
    name: '急慢性工作负荷比过高',
    check: ({ acwr }) => ({
      triggered: acwr > 1.3,
      value: acwr,
      severity: acwr > 1.5 ? 'danger' : 'warning',
      description: acwr > 1.5
        ? `ACWR = ${acwr.toFixed(2)}，远超安全区间（>1.5），受伤风险高度上升（Gabbett 2016）。`
        : `ACWR = ${acwr.toFixed(2)}，高于最优区间上限1.3，疲劳开始积累。`,
    }),
  },
  {
    id: 'acwr_spike',
    name: '训练量单周暴增',
    check: ({ weeklyVolumes }) => {
      if (weeklyVolumes.length < 2 || weeklyVolumes[1] === 0) {
        return { triggered: false, severity: 'info', description: '' };
      }
      const ratio = weeklyVolumes[0] / weeklyVolumes[1];
      return {
        triggered: ratio > 1.25,
        value: ratio,
        severity: ratio > 1.5 ? 'danger' : 'warning',
        description: `本周训练量是上周的 ${(ratio * 100).toFixed(0)}%，超过10%安全增量原则。`,
      };
    },
  },
  {
    id: 'consecutive_days',
    name: '连续训练天数过多',
    check: ({ consecutiveDays }) => ({
      triggered: consecutiveDays >= 4,
      value: consecutiveDays,
      severity: consecutiveDays >= 6 ? 'danger' : 'warning',
      description: `已连续训练 ${consecutiveDays} 天，肌肉和结缔组织缺乏充分恢复时间。`,
    }),
  },
  {
    id: 'monotony_high',
    name: '训练单调性过高',
    check: ({ monotony }) => ({
      triggered: monotony > 1.8,
      value: monotony,
      severity: monotony > 2.5 ? 'danger' : 'warning',
      description: `训练单调性 = ${monotony.toFixed(2)}（>1.8），每日负荷变化不足，容易导致过度使用性损伤。`,
    }),
  },
  {
    id: 'volume_decline',
    name: '训练量持续下降（欠训练）',
    check: ({ weeklyVolumes, acwr }) => {
      const declining = weeklyVolumes.length >= 3 &&
        weeklyVolumes[0] < weeklyVolumes[1] * 0.6 &&
        weeklyVolumes[1] < weeklyVolumes[2] * 0.6;
      return {
        triggered: declining && acwr < 0.5,
        severity: 'info',
        description: '训练量连续两周大幅下降，肌肉萎缩风险上升，且恢复后突然恢复高强度会造成急性损伤。',
      };
    },
  },
  {
    id: 'push_pull_imbalance',
    name: '推拉肌群训练失衡',
    check: ({ pushCount, pullCount }) => {
      if (pushCount + pullCount === 0) return { triggered: false, severity: 'info', description: '' };
      const ratio = pushCount / Math.max(pullCount, 1);
      return {
        triggered: ratio > 1.8 || ratio < 0.5,
        value: ratio,
        severity: 'warning',
        description: ratio > 1.8
          ? `推系（胸/肩/三头）训练是拉系（背/二头）的 ${ratio.toFixed(1)} 倍，长期失衡易导致肩袖损伤和姿势问题。`
          : `拉系训练频次显著多于推系，注意上肢肌群平衡发展。`,
      };
    },
  },
  {
    id: 'long_rest',
    name: '长时间未训练后突然高强度',
    check: ({ daysSinceLast, acwr }) => ({
      triggered: daysSinceLast >= 7 && acwr > 1.0,
      severity: 'warning',
      description: `距上次训练已有 ${daysSinceLast} 天，直接高强度训练容易导致延迟性肌肉损伤或急性拉伤，建议先进行1-2次适应性训练。`,
    }),
  },
];

function getConsecutiveDays(workouts: WorkoutDay[]): number {
  if (workouts.length === 0) return 0;
  const dateSet = new Set(workouts.map(w => w.date.toISOString().slice(0, 10)));
  const today = new Date();
  let count = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (dateSet.has(d)) count++;
    else if (count > 0) break;
  }
  return count;
}

function getWeeklyVolumes(workouts: WorkoutDay[]): number[] {
  const now = Date.now();
  const MS_PER_DAY = 86400000;
  return [0, 1, 2, 3].map(week => {
    const start = week * 7;
    const end = (week + 1) * 7;
    return workouts.reduce((sum, w) => {
      const age = (now - w.date.getTime()) / MS_PER_DAY;
      return age >= start && age < end ? sum + w.volume : sum;
    }, 0);
  });
}

function getPushPullCounts(workouts: WorkoutDay[]): { push: number; pull: number } {
  const now = Date.now();
  let push = 0;
  let pull = 0;
  for (const w of workouts) {
    if ((now - w.date.getTime()) / 86400000 > 28) continue;
    for (const mg of w.muscleGroups) {
      const lower = mg.toLowerCase();
      if (PUSH_MUSCLES.has(lower)) push++;
      if (PULL_MUSCLES.has(lower)) pull++;
    }
  }
  return { push, pull };
}

function buildInjuryRecommendation(level: InjuryRiskLevel, triggered: InjuryRiskFactor[]): string {
  if (triggered.length === 0) return '各项指标正常，继续保持均衡的训练节奏和充分恢复。';
  const hasDanger = triggered.some(f => f.severity === 'danger');
  if (level === 'critical' || hasDanger) {
    return '存在高危风险因子，强烈建议本周大幅降低训练强度，优先安排主动恢复（拉伸/游泳/走路），并保证充足睡眠。';
  }
  if (level === 'high') {
    return '多个风险因子同时存在，建议本周减少10-20%训练量，增加热身时长，避免在疲劳状态下进行高强度复合动作。';
  }
  return '存在轻微风险信号，注意充分热身，动作质量优先于重量，确保肌群间充足恢复时间。';
}

/**
 * Multi-factor injury risk assessment.
 * @param workouts - Last 28+ days of workout data
 * @param acwr     - Pre-calculated ACWR from fatigue model
 * @param monotony - Pre-calculated monotony from fatigue model
 */
export function assessInjuryRisk(
  workouts: WorkoutDay[],
  acwr: number,
  monotony: number,
): InjuryRiskResult {
  const weeklyVolumes = getWeeklyVolumes(workouts);
  const consecutiveDays = getConsecutiveDays(workouts);
  const { push: pushCount, pull: pullCount } = getPushPullCounts(workouts);

  const now = Date.now();
  let daysSinceLast = 999;
  if (workouts.length > 0) {
    const last = workouts.reduce((a, b) => a.date > b.date ? a : b);
    daysSinceLast = Math.floor((now - last.date.getTime()) / 86400000);
  }

  const data: AnalysisData = {
    workouts, weeklyVolumes, consecutiveDays, acwr, monotony,
    daysSinceLast, pushCount, pullCount,
  };

  const factors: InjuryRiskFactor[] = FACTORS.map(def => {
    const result = def.check(data);
    return {
      id: def.id,
      name: def.name,
      description: result.description,
      severity: result.severity,
      triggered: result.triggered,
      value: result.value,
    };
  });

  const triggered = factors.filter(f => f.triggered);

  // Score: danger = 25pts, warning = 15pts
  const rawScore = triggered.reduce((s, f) => {
    if (f.severity === 'danger') return s + 25;
    if (f.severity === 'warning') return s + 15;
    return s + 5;
  }, 0);
  const score = Math.min(100, rawScore);

  const level: InjuryRiskLevel =
    score < 20 ? 'low' :
    score < 40 ? 'moderate' :
    score < 65 ? 'high' : 'critical';

  return {
    score,
    level,
    factors,
    triggeredFactors: triggered,
    recommendation: buildInjuryRecommendation(level, triggered),
  };
}
