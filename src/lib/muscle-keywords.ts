/** Shared muscle group keyword maps used across analysis routes */

export const CN_TO_EN: Record<string, string> = {
  '胸部': 'chest',
  '背部': 'back',
  '腿部': 'legs',
  '肩部': 'shoulders',
  '手臂': 'arms',
  '腹部': 'abs',
};

/** Chinese exercise name keywords → English muscle group (order-sensitive: first match wins) */
export const CN_NAME_KEYWORDS: Record<string, string> = {
  '臂弯举': 'arms', '二头': 'arms', '三头': 'arms', '臂屈伸': 'arms', '臂': 'arms',
  '深蹲': 'legs', '腿举': 'legs', '腿屈伸': 'legs', '提踵': 'legs', '弓步': 'legs', '腿': 'legs',
  '推举': 'shoulders', '侧平': 'shoulders', '前平': 'shoulders', '肩': 'shoulders',
  '划船': 'back', '引体': 'back', '下拉': 'back', '硬拉': 'back', '背': 'back',
  '卧推': 'chest', '胸推': 'chest', '飞鸟': 'chest', '俯卧撑': 'chest', '胸': 'chest',
};

export const EN_KEYWORDS: Record<string, string[]> = {
  chest: ['chest', 'pectoral', 'bench', 'push', 'fly'],
  back: ['back', 'lat', 'traps', 'rhomboid', 'pull', 'row', 'deadlift'],
  legs: ['legs', 'quads', 'hamstrings', 'glutes', 'calves', 'squat', 'leg', 'lunge'],
  shoulders: ['shoulders', 'delts', 'press', 'lateral', 'front raise'],
  arms: ['arms', 'biceps', 'triceps', 'forearm', 'curl', 'extension'],
};

/** Resolve a set's muscle group to an English key, returns null if unrecognised */
export function resolveMuscleGroup(exerciseName: string, muscleGroup: string): string | null {
  const raw = (muscleGroup || '').trim();
  if (raw) {
    const byCN = CN_TO_EN[raw];
    if (byCN) return byCN;
    const mg = raw.toLowerCase();
    for (const [group, kws] of Object.entries(EN_KEYWORDS)) {
      if (kws.some(k => mg.includes(k))) return group;
    }
  }
  const name = exerciseName.toLowerCase();
  for (const [kw, group] of Object.entries(CN_NAME_KEYWORDS)) {
    if (name.includes(kw)) return group;
  }
  for (const [group, kws] of Object.entries(EN_KEYWORDS)) {
    if (kws.some(k => name.includes(k))) return group;
  }
  return null;
}
