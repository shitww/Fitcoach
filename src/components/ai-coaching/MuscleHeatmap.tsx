import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { logger } from '@/lib/logger';

interface MuscleVolumeData {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
}

export const MuscleHeatmap: React.FC = () => {
  const [muscleVolumes, setMuscleVolumes] = useState<MuscleVolumeData>({
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch muscle volume data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analysis/muscle-volume`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setMuscleVolumes(data);
        } else {
          if (response.status === 401) {
            // 未登录，静默处理
            return;
          }
          logger.warn("API warning:", await response.text());
        }
      } catch (error) {
        logger.error('Error fetching muscle volume data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate heat level based on training volume (kg)
  // 0 → gray, < 5000 → light green, ≥ 5000 → red
  const normalizeHeatLevel = (volume: number): 'none' | 'low' | 'high' => {
    if (volume === 0) return 'none';
    if (volume < 5000) return 'low';
    return 'high';
  };

  // Get color based on heat level
  const getHeatColor = (level: 'none' | 'low' | 'high') => {
    switch (level) {
      case 'none':
        return 'bg-zinc-800';
      case 'low':
        return 'bg-lime-500/60';
      case 'high':
        return 'bg-red-500/70';
      default:
        return 'bg-zinc-800';
    }
  };

  // Format volume for display
  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 't';
    }
    return volume + 'kg';
  };

  // Get muscle group label (Chinese)
  const getMuscleGroupLabel = (muscleGroup: keyof MuscleVolumeData) => {
    const labels: Record<keyof MuscleVolumeData, string> = {
      chest: '胸部',
      back: '背部',
      legs: '腿部',
      shoulders: '肩部',
      arms: '手臂'
    };
    return labels[muscleGroup];
  };

  // Handle muscle group click
  const handleMuscleClick = (muscleGroup: string) => {
    router.push(`/workout?muscle=${muscleGroup}`);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-zinc-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">💪 肌群训练热力图</h2>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.entries(muscleVolumes).map(([muscleGroup, volume]) => {
          const heatLevel = normalizeHeatLevel(volume);
          const heatColor = getHeatColor(heatLevel);
          const label = getMuscleGroupLabel(muscleGroup as keyof MuscleVolumeData);
          
          return (
            <button
              key={muscleGroup}
              onClick={() => handleMuscleClick(muscleGroup)}
              className={`${heatColor} rounded-xl h-24 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer`}
            >
              <span className="text-white font-bold text-base">{label}</span>
              <div className="mt-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white/90">
                {formatVolume(volume)}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zinc-800 rounded"></div>
          <span>未训练</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-lime-500/60 rounded"></div>
          <span>&lt; 5t</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/70 rounded"></div>
          <span>≥ 5t</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-500">点击肌群开始针对性训练</p>
      </div>
    </div>
  );
};