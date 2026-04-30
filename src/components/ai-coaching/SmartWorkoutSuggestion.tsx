import React, { useState, useEffect } from 'react';
import { ArrowRight, Dumbbell, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutSuggestion {
  muscleFocus: string;
  exercises: Exercise[];
  recommendationReason: string;
}

export const SmartWorkoutSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<WorkoutSuggestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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
    if (suggestion) {
      // Create a new workout session with the suggested exercises
      const exerciseNames = suggestion.exercises.map(ex => ex.name).join(',');
      router.push(`/workout?exercises=${encodeURIComponent(exerciseNames)}&focus=${encodeURIComponent(suggestion.muscleFocus)}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="space-y-2 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-zinc-800 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">无法生成训练建议</p>
        </div>
      </div>
    );
  }

  const isRestDay = suggestion.muscleFocus === 'Rest Day';

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Zap className="mr-2 text-lime-400" size={20} />
          {isRestDay ? '今日建议' : '今日推荐训练'}
        </h2>
        <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: isRestDay ? 'rgba(255,204,0,0.1)' : 'rgba(204,255,0,0.1)', color: isRestDay ? '#FFCC00' : '#CCFF00' }}>
          {suggestion.muscleFocus}
        </div>
      </div>

      <p className="text-zinc-400 text-sm mb-6 whitespace-pre-line">
        {suggestion.recommendationReason}
      </p>

      {!isRestDay && (
        <>
          <div className="space-y-3 mb-8">
            {suggestion.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                  {index + 1}
                </div>
                <span className="text-white">{exercise.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full py-3 rounded-lg font-bold text-black flex items-center justify-center gap-2 transition-all group"
            style={{
              background: 'linear-gradient(135deg, #CCFF00 0%, #b3e600 100%)',
              boxShadow: '0 0 20px rgba(204,255,0,0.2)'
            }}
          >
            开始训练
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      {isRestDay && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-zinc-400">💤</span>
          </div>
          <p className="text-zinc-400">让身体充分恢复，为下一次训练做好准备！</p>
        </div>
      )}
    </div>
  );
};