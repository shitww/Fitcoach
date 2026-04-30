import { calculate1RM, calculateTotalVolume } from './calc';

interface Set {
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  estimated1RM: number;
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface Workout {
  exercises: Exercise[];
  duration: number;
  date: string;
}

interface FeedbackResult {
  summary: string;
  progress: string;
  fatigue: string;
  suggestions: string[];
  nextSteps: string[];
}

// 分析训练强度
export function analyzeIntensity(workout: Workout): { level: 'low' | 'moderate' | 'high'; score: number } {
  const totalVolume = workout.exercises.reduce((sum, exercise) => {
    return sum + calculateTotalVolume(exercise.sets);
  }, 0);
  
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const avgSetsPerExercise = totalSets / workout.exercises.length;
  const exerciseCount = workout.exercises.length;
  
  // 计算强度分数
  let score = 0;
  score += totalVolume / 100; // 训练量贡献
  score += exerciseCount * 10; // 动作多样性贡献
  score += avgSetsPerExercise * 5; // 每组动作组数贡献
  
  if (score < 100) return { level: 'low', score };
  if (score < 250) return { level: 'moderate', score };
  return { level: 'high', score };
}

// 分析训练平衡性
export function analyzeBalance(exercises: Exercise[]): { balanced: boolean; muscleGroups: string[]; missing: string[] } {
  const muscleGroups = new Set<string>();
  
  // 简单的肌群分类
  const exerciseToMuscleGroup: Record<string, string> = {
    '卧推': 'chest',
    '胸肌飞鸟': 'chest',
    '俯卧撑': 'chest',
    '深蹲': 'legs',
    '腿举': 'legs',
    '硬拉': 'back',
    '引体向上': 'back',
    '划船': 'back',
    '肩上推举': 'shoulders',
    '侧平举': 'shoulders',
    '二头肌弯举': 'arms',
    '三头肌下压': 'arms'
  };
  
  exercises.forEach(exercise => {
    const muscleGroup = exerciseToMuscleGroup[exercise.name.split(' ')[0]];
    if (muscleGroup) muscleGroups.add(muscleGroup);
  });
  
  const requiredGroups = ['chest', 'back', 'legs', 'shoulders', 'arms'];
  const missing = requiredGroups.filter(group => !muscleGroups.has(group));
  
  return {
    balanced: missing.length === 0,
    muscleGroups: Array.from(muscleGroups),
    missing
  };
}

// 分析进步情况
export function analyzeProgress(currentWorkout: Workout, previousWorkout: Workout | null): { improved: boolean; improvements: string[] } {
  if (!previousWorkout) {
    return {
      improved: true,
      improvements: ['这是你的第一次训练，开始了就已经很棒了！']
    };
  }
  
  const improvements: string[] = [];
  let hasImprovement = false;
  
  // 分析每个动作的进步
  currentWorkout.exercises.forEach(currentExercise => {
    const previousExercise = previousWorkout.exercises.find(
      e => e.name === currentExercise.name
    );
    
    if (previousExercise) {
      // 比较最大重量
      const currentMaxWeight = Math.max(...currentExercise.sets.map(s => s.weight));
      const previousMaxWeight = Math.max(...previousExercise.sets.map(s => s.weight));
      
      if (currentMaxWeight > previousMaxWeight) {
        improvements.push(`${currentExercise.name} 重量提升了 ${(currentMaxWeight - previousMaxWeight).toFixed(1)}kg`);
        hasImprovement = true;
      }
      
      // 比较训练量
      const currentVolume = calculateTotalVolume(currentExercise.sets);
      const previousVolume = calculateTotalVolume(previousExercise.sets);
      
      if (currentVolume > previousVolume) {
        improvements.push(`${currentExercise.name} 训练量提升了 ${(currentVolume - previousVolume).toFixed(0)}kg`);
        hasImprovement = true;
      }
    }
  });
  
  // 分析整体训练量
  const currentTotalVolume = currentWorkout.exercises.reduce(
    (sum, exercise) => sum + calculateTotalVolume(exercise.sets),
    0
  );
  
  const previousTotalVolume = previousWorkout.exercises.reduce(
    (sum, exercise) => sum + calculateTotalVolume(exercise.sets),
    0
  );
  
  if (currentTotalVolume > previousTotalVolume) {
    improvements.push(`整体训练量提升了 ${(currentTotalVolume - previousTotalVolume).toFixed(0)}kg`);
    hasImprovement = true;
  }
  
  return {
    improved: hasImprovement,
    improvements: improvements.length > 0 ? improvements : ['保持了训练状态，继续加油！']
  };
}

// 生成 AI 反馈
export function generateFeedback(workout: Workout, previousWorkout: Workout | null): FeedbackResult {
  const intensity = analyzeIntensity(workout);
  const balance = analyzeBalance(workout.exercises);
  const progress = analyzeProgress(workout, previousWorkout);
  
  // 生成总结
  const summary = `本次训练共完成 ${workout.exercises.length} 个动作，总计 ${workout.exercises.reduce((sum, e) => sum + e.sets.length, 0)} 组训练，训练量 ${workout.exercises.reduce((sum, e) => sum + calculateTotalVolume(e.sets), 0)}kg，用时 ${Math.floor(workout.duration / 60)} 分钟。`;
  
  // 生成进步分析
  let progressText = '';
  if (progress.improvements.length > 0) {
    progressText = `训练进步明显：${progress.improvements.join('；')}。`;
  } else {
    progressText = '训练状态稳定，保持了良好的训练习惯。';
  }
  
  // 生成疲劳分析
  let fatigueText = '';
  const failureSets = workout.exercises.reduce((sum, e) => sum + e.sets.filter(s => s.isFailure).length, 0);
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const failureRatio = failureSets / totalSets;
  
  if (failureRatio > 0.5) {
    fatigueText = `力竭组数比例较高（${Math.round(failureRatio * 100)}%），可能存在过度训练风险，建议适当休息。`;
  } else if (failureRatio > 0.2) {
    fatigueText = `力竭组数比例适中（${Math.round(failureRatio * 100)}%），训练强度合理。`;
  } else {
    fatigueText = `力竭组数比例较低（${Math.round(failureRatio * 100)}%），可以考虑适当增加训练强度。`;
  }
  
  // 生成建议
  const suggestions: string[] = [];
  
  if (intensity.level === 'low') {
    suggestions.push('建议增加训练量和训练强度，逐步提升训练水平。');
  } else if (intensity.level === 'high') {
    suggestions.push('训练强度较高，注意充分休息和营养补充。');
  }
  
  if (!balance.balanced) {
    suggestions.push(`训练平衡性有待提高，建议增加 ${balance.missing.join('、')} 肌群的训练。`);
  }
  
  if (workout.duration > 90 * 60) {
    suggestions.push('训练时间较长，建议优化训练效率，避免过度训练。');
  }
  
  // 生成下一步建议
  const nextSteps: string[] = [];
  
  if (progress.improved) {
    nextSteps.push('继续保持当前的训练节奏，逐步增加重量和训练量。');
  } else {
    nextSteps.push('考虑调整训练计划，尝试不同的训练方法和动作组合。');
  }
  
  nextSteps.push('确保充足的睡眠和合理的饮食，这对肌肉恢复和生长至关重要。');
  nextSteps.push('记录每次训练的数据，定期分析训练进步情况。');
  
  return {
    summary,
    progress: progressText,
    fatigue: fatigueText,
    suggestions,
    nextSteps
  };
}
