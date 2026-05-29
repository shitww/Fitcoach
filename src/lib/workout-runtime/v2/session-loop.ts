import type {
  V2SessionState,
  V2SetResult,
  V2ScoreResult,
  V2DecisionResult,
  V2FatigueState,
  V2ExerciseState,
  V2SessionLog,
} from './types';

export function createSessionLoop() {
  let state: V2SessionState = 'WORKOUT_START';
  let logs: V2SessionLog[] = [];
  let currentExercise: V2ExerciseState | null = null;

  function startWorkout() {
    state = 'EXERCISE_ACTIVE';
    logs = [];
    currentExercise = null;
  }

  function startExercise(name: string, muscleGroup: string) {
    currentExercise = {
      name,
      muscleGroup,
      sets: [],
      targetReps: 8,
    };
    state = 'EXERCISE_ACTIVE';
  }

  function completeSet(
    setResult: V2SetResult,
    score: V2ScoreResult,
    decision: V2DecisionResult,
    fatigue: V2FatigueState,
  ) {
    if (!currentExercise) return;
    currentExercise.sets.push(setResult);
    if (currentExercise.sets.length === 1) {
      currentExercise.targetReps = setResult.reps;
    }
    logs.push({
      set: setResult,
      score,
      decision,
      fatigue,
      timestamp: Date.now(),
    });
    state = 'DECISION_EVALUATION';
  }

  function readyNextSet() {
    state = 'NEXT_SET_READY';
  }

  function completeExercise() {
    state = 'EXERCISE_COMPLETE';
  }

  function finishWorkout() {
    state = 'WORKOUT_COMPLETE';
  }

  function getState() {
    return state;
  }

  function getLogs() {
    return [...logs];
  }

  function getCurrentExercise() {
    return currentExercise;
  }

  return {
    startWorkout,
    startExercise,
    completeSet,
    readyNextSet,
    completeExercise,
    finishWorkout,
    getState,
    getLogs,
    getCurrentExercise,
  };
}
