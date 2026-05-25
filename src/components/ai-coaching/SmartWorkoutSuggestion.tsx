import React, { useState, useEffect } from 'react';
import { ArrowRight, Dumbbell, Zap, Sparkles } from 'lucide-react';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

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

export const SmartWorkoutSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<WorkoutSuggestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;

  // Fetch workout suggestion from API
  useEffect(() => {
    const fetchSuggestion = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analysis/workout-suggestion`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestion(data);
        } else {
          if (response.status === 401) {
            // 未登录，静默处理
            return;
          }
          logger.warn("API warning:", await response.text());
        }
      } catch (error) {
        logger.error('Error fetching workout suggestion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, []);

  // Handle start workout button click
  const handleStartWorkout = () => {
    router.push(hasActiveSession ? '/workout' : '/intent');
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-secondary rounded w-1/2 mb-4"></div>
          <div className="space-y-2 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-secondary rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center py-6">
          <Dumbbell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm" style={{ color: 'var(--text-low)' }}>暂无训练建议，多记录几次训练后自动生成</p>
        </div>
      </div>
    );
  }

  const isRestDay = suggestion.muscleFocus === 'Rest Day' || suggestion.muscleFocus === '休息日';

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Zap style={{ color: 'var(--accent)' }} size={18} />
          {isRestDay ? '今日建议' : '今日推荐训练'}
        </h2>
        <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: isRestDay ? 'rgba(255,204,0,0.1)' : 'var(--accent-dim)', color: isRestDay ? '#FFCC00' : 'var(--accent)' }}>
          {suggestion.muscleFocus === 'Rest Day' ? '休息日' : suggestion.muscleFocus}
        </div>
      </div>

      <p className="text-sm mb-5 whitespace-pre-line" style={{ color: 'var(--text-low)' }}>
        {suggestion.recommendationReason}
      </p>

      {!isRestDay && (
        <>
          <div className="space-y-2 mb-6">
            {suggestion.exercises.map((exercise, index) => {
              const plan = suggestion.aiPlan?.find(p => p.name === exercise.name) || suggestion.aiPlan?.[index];
              return (
                <div key={exercise.id} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      {index + 1}
                    </div>
                    <span className="font-semibold text-sm flex-1" style={{ color: 'var(--foreground)' }}>{exercise.name}</span>
                    {plan && (
                      <span className="text-xs font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                        {plan.sets}组 × {plan.reps}次
                      </span>
                    )}
                  </div>
                  {plan?.tip && (
                    <div className="flex items-start gap-1.5 pl-10">
                      <Sparkles className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#A855F7' }} />
                      <span className="text-xs" style={{ color: 'var(--text-low)' }}>{plan.tip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full py-3 rounded-lg font-bold text-black flex items-center justify-center gap-2 transition-all group"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
              boxShadow: '0 0 20px var(--accent-glow)'
            }}
          >
            {hasActiveSession ? '继续训练' : '开始训练'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      {isRestDay && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-2)' }}>
            <span className="text-2xl">💤</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-low)' }}>让身体充分恢复，为下一次训练做好准备！</p>
        </div>
      )}
    </div>
  );
};