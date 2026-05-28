import React from 'react';
import { ArrowRight, Dumbbell, Zap, Sparkles } from 'lucide-react';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { useRouter } from 'next/navigation';
import { useCachedFetch } from '@/lib/client-cache';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface ExercisePlan {
  name: string;
  sets: number;
  reps: string;
  tip: string;
}

interface WorkoutSuggestion {
  muscleFocus: string;
  exercises: Exercise[];
  recommendationReason: string;
  aiPlan?: ExercisePlan[];
}

const SuggestionSkeleton: React.FC = () => (
  <div className="rounded-2xl p-6 bg-card border border-border">
    <div className="animate-pulse">
      <div className="h-5 bg-secondary rounded w-1/2 mb-4" />
      <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
      <div className="h-3 bg-secondary rounded w-1/2 mb-4" />
      <div className="space-y-2 mb-6">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-secondary rounded" />)}
      </div>
      <div className="h-11 bg-secondary rounded" />
    </div>
  </div>
);

export const SmartWorkoutSuggestion: React.FC = () => {
  const { data: suggestion, isLoading } = useCachedFetch<WorkoutSuggestion>(
    '/api/analysis/workout-suggestion',
    { credentials: 'include' }
  );
  const router = useRouter();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;

  const handleStartWorkout = () => {
    router.push('/workout');
  };

  if (isLoading) return <SuggestionSkeleton />;

  if (!suggestion) {
    return (
      <div className="rounded-2xl p-5 bg-card border border-border">
        <div className="text-center py-6">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">暂无训练建议，多记录几次训练后自动生成</p>
        </div>
      </div>
    );
  }

  const isRestDay = suggestion.muscleFocus === 'Rest Day' || suggestion.muscleFocus === '休息日';

  return (
    <div className="rounded-2xl p-5 bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Zap className="text-primary" size={18} />
          {isRestDay ? '今日建议' : '今日推荐训练'}
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isRestDay ? 'bg-yellow-400/10 text-yellow-400' : 'bg-primary/10 text-primary'
        }`}>
          {suggestion.muscleFocus === 'Rest Day' ? '休息日' : suggestion.muscleFocus}
        </div>
      </div>

      <p className="text-sm mb-5 whitespace-pre-line text-muted-foreground">
        {suggestion.recommendationReason}
      </p>

      {!isRestDay && (
        <>
          <div className="space-y-2 mb-6">
            {suggestion.exercises.map((exercise, index) => {
              const plan = suggestion.aiPlan?.find(p => p.name === exercise.name) || suggestion.aiPlan?.[index];
              return (
                <div key={exercise.id} className="p-3 rounded-xl bg-secondary">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-sm flex-1">{exercise.name}</span>
                    {plan && (
                      <span className="text-xs font-bold shrink-0 text-primary">
                        {plan.sets}组 × {plan.reps}次
                      </span>
                    )}
                  </div>
                  {plan?.tip && (
                    <div className="flex items-start gap-1.5 pl-10">
                      <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                      <span className="text-xs text-muted-foreground">{plan.tip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full py-3 rounded-lg font-bold text-primary-foreground bg-primary flex items-center justify-center gap-2 transition-all group hover:bg-primary/90"
          >
            {hasActiveSession ? '继续训练' : '开始训练'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      {isRestDay && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-secondary">
            <span className="text-2xl">💤</span>
          </div>
          <p className="text-sm text-muted-foreground">让身体充分恢复，为下一次训练做好准备！</p>
        </div>
      )}
    </div>
  );
};