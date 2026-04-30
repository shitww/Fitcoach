import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkoutTimerState {
  // 训练总计时
  isTrainingActive: boolean;
  trainingStartTime: number | null; // 页面刷新后，用这个计算增量 elapsed
  trainingDuration: number; // 已积累的秒数（不含页面刷新时的增量）
  // 休息倒计时
  isRestActive: boolean;
  restStartTime: number | null;
  restDuration: number;
  restTotal: number;
  // 当前动作（显示在悬浮窗）
  currentExercise: string | null;
  // 操作
  startTraining: () => void;
  stopTraining: () => { duration: number; startTime: number | null };
  addDuration: (seconds: number) => void;
  startRest: (seconds: number) => void;
  stopRest: () => void;
  setCurrentExercise: (name: string | null) => void;
}

export const useWorkoutTimer = create<WorkoutTimerState>()(
  persist(
    (set, get) => ({
      isTrainingActive: false,
      trainingStartTime: null,
      trainingDuration: 0,
      isRestActive: false,
      restStartTime: null,
      restDuration: 0,
      restTotal: 0,
      currentExercise: null,

      startTraining: () => set({
        isTrainingActive: true,
        trainingStartTime: Date.now(),
        trainingDuration: 0,
      }),

      stopTraining: () => {
        const { trainingDuration } = get();
        set({ isTrainingActive: false, trainingStartTime: null });
        return { duration: trainingDuration, startTime: null };
      },

      addDuration: (seconds) => set(state => ({
        trainingDuration: state.trainingDuration + seconds,
      })),

      startRest: (seconds) => set({
        isRestActive: true,
        restStartTime: Date.now(),
        restDuration: seconds,
        restTotal: seconds,
      }),

      stopRest: () => set({
        isRestActive: false,
        restStartTime: null,
        restDuration: 0,
        restTotal: 0,
      }),

      setCurrentExercise: (name) => set({ currentExercise: name }),
    }),
    {
      name: 'fitcoach-timer',
      // 只持久化这些字段，不需要持久化的是运行时状态
      partialize: (state) => ({
        isTrainingActive: state.isTrainingActive,
        trainingStartTime: state.trainingStartTime,
        trainingDuration: state.trainingDuration,
        isRestActive: state.isRestActive,
        restStartTime: state.restStartTime,
        restDuration: state.restDuration,
        restTotal: state.restTotal,
        currentExercise: state.currentExercise,
      }),
    }
  )
);
