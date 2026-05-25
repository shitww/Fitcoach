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
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-secondary rounded mb-4"></div>
          <div className="h-8 bg-secondary rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Trophy size={18} style={{ color: 'var(--accent)' }} />
        渐进超负荷
      </h2>

      {/* 本周 vs 上周 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
          <p className="text-xs" style={{ color: 'var(--text-low)' }}>本周训练量</p>
          <p className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{data.thisWeekVolume.toLocaleString()} <span className="text-sm font-normal" style={{ color: 'var(--text-low)' }}>kg</span></p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
          <p className="text-xs" style={{ color: 'var(--text-low)' }}>上周训练量</p>
          <p className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{data.lastWeekVolume.toLocaleString()} <span className="text-sm font-normal" style={{ color: 'var(--text-low)' }}>kg</span></p>
        </div>
      </div>

      {/* 百分比变化 */}
      <div className="flex items-center mb-4 p-3 rounded-xl" style={{
        background: isPositiveChange ? 'var(--accent-dim)' : 'var(--surface-2)',
        border: '1px solid var(--border)'
      }}>
        {isPositiveChange ? (
          <ArrowUp style={{ color: 'var(--accent)' }} className="mr-2" size={16} />
        ) : (
          <ArrowDown style={{ color: 'var(--text-low)' }} className="mr-2" size={16} />
        )}
        <span className="text-sm font-semibold" style={{ color: isPositiveChange ? 'var(--accent)' : 'var(--text-med)' }}>
          {isPositiveChange ? '+' : ''}{percentageChange}%（较上周）
        </span>
      </div>

      {/* 训练量趋势图 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-med)' }}>近 7 日训练量趋势</h3>
        <div className="h-48 rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} 
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value) => [`${Number(value ?? 0)} kg`, '训练量']}
                labelFormatter={(label) => `日期：${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="var(--accent)" 
                strokeWidth={2} 
                dot={{ fill: 'var(--accent)', r: 3 }} 
                activeDot={{ r: 5, fill: 'var(--accent)' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 新 PR */}
      {data.newPRs.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Trophy size={16} />
            今日新纪录 🎉
          </h3>
          <div className="space-y-1.5">
            {data.newPRs.map((pr) => (
              <div key={pr.exerciseId} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--foreground)' }}>{pr.exerciseName}</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>+{pr.currentWeight}kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};