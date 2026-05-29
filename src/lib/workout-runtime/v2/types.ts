export type V2SessionState =
  | 'WORKOUT_START'
  | 'EXERCISE_ACTIVE'
  | 'SET_COMPLETE'
  | 'DECISION_EVALUATION'
  | 'NEXT_SET_READY'
  | 'EXERCISE_COMPLETE'
  | 'WORKOUT_COMPLETE';

export interface V2SetResult {
  reps: number;
  weight: number;
  volume: number;
  rir: number | null;
  isBodyweight: boolean;
  timestamp: number;
}

export interface V2FatigueState {
  score: number;
  byMuscle: Record<string, number>;
}

export interface V2ScoreResult {
  score: number;
  repsEfficiency: number;
  weightProgression: number;
}

export interface V2DecisionResult {
  action: 'increase' | 'maintain' | 'decrease';
  nextWeight: number;
  nextReps: number;
  message: string;
}

export interface V2ExerciseState {
  name: string;
  muscleGroup: string;
  sets: V2SetResult[];
  targetReps: number;
}

export interface V2SessionLog {
  set: V2SetResult;
  score: V2ScoreResult;
  decision: V2DecisionResult;
  fatigue: V2FatigueState;
  timestamp: number;
}
