import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ExercisePR {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  currentWeight: number;
}

interface VolumeTrendData {
  date: string;
  volume: number;
}

interface ProgressiveOverloadData {
  thisWeekVolume: number;
  lastWeekVolume: number;
  volumeTrend: VolumeTrendData[];
  newPRs: ExercisePR[];
}

export const ProgressiveOverloadPanel: React.FC = () => {
  const [data, setData] = useState<ProgressiveOverloadData>({
    thisWeekVolume: 0,
    lastWeekVolume: 0,
    volumeTrend: [],
    newPRs: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analysis/progressive-overload`, {
          credentials: "include"
        });
        if (response.ok) {
          const result = await response.json();
          setData({
            thisWeekVolume: result.thisWeekVolume,
            lastWeekVolume: result.lastWeekVolume,
            volumeTrend: result.volumeTrend,
            newPRs: result.newPRs
          });
        } else {
          if (response.status === 401) {
            // 未登录，静默处理
            return;
          }
          logger.warn("API warning:", await response.text());
        }
      } catch (error) {
        logger.error('Error fetching progressive overload data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate percentage change
  const getPercentageChange = () => {
    if (data.lastWeekVolume === 0) return 100;
    return Math.round(((data.thisWeekVolume - data.lastWeekVolume) / data.lastWeekVolume) * 100);
  };

  const percentageChange = getPercentageChange();
  const isPositiveChange = percentageChange >= 0;

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-zinc-800 rounded mb-4"></div>
          <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <Trophy className="mr-2 text-lime-400" size={20} />
        Progressive Overload
      </h2>

      {/* Weekly Volume Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">This Week</p>
          <p className="text-white text-2xl font-bold">{data.thisWeekVolume.toLocaleString()} kg</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Last Week</p>
          <p className="text-white text-2xl font-bold">{data.lastWeekVolume.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Percentage Change */}
      <div className={`flex items-center mb-6 p-3 rounded-lg ${isPositiveChange ? 'bg-lime-900/30' : 'bg-zinc-800'}`}>
        {isPositiveChange ? (
          <ArrowUp className="text-lime-400 mr-2" size={16} />
        ) : (
          <ArrowDown className="text-zinc-400 mr-2" size={16} />
        )}
        <span className={`font-medium ${isPositiveChange ? 'text-lime-400' : 'text-zinc-400'}`}>
          {isPositiveChange ? '+' : ''}{percentageChange}% from last week
        </span>
      </div>

      {/* Volume Trend Chart */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3">Volume Trend (Last 7 Days)</h3>
        <div className="h-64 bg-zinc-800 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }} 
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value} kg`, 'Volume']}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ fill: '#10b981', r: 4 }} 
                activeDot={{ r: 6, fill: '#10b981' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Detection */}
      {data.newPRs.length > 0 && (
        <div className="bg-lime-900/20 rounded-lg p-4 border border-lime-800">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Trophy className="mr-2 text-lime-400" size={18} />
            New PRs 🎉
          </h3>
          <div className="space-y-2">
            {data.newPRs.map((pr) => (
              <div key={pr.exerciseId} className="flex items-center justify-between">
                <span className="text-white">{pr.exerciseName}</span>
                <span className="text-lime-400 font-medium">+{pr.currentWeight}kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};