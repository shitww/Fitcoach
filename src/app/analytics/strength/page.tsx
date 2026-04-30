"use client";

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { logger } from '@/lib/logger';

interface TrendData {
  date: string;
  volume: number;
  maxWeight: number;
  estimated1RM: number;
}

export default function StrengthTrendsPage() {
  const [selectedExercise, setSelectedExercise] = useState('卧推');
  const [timeRange, setTimeRange] = useState('3个月');
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [selectedExercise, timeRange]);

  const fetchTrends = async () => {
    try {
      const months = timeRange === '1个月' ? 1 : timeRange === '3个月' ? 3 : timeRange === '6个月' ? 6 : 12;
      const response = await fetch(`/api/analysis/trends?exercise=${selectedExercise}&months=${months}`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setTrendData(data.data);
      } else {
        // 模拟数据
        setTrendData([
          { date: '2026-01-01', volume: 2500, maxWeight: 70, estimated1RM: 85 },
          { date: '2026-01-15', volume: 2800, maxWeight: 72, estimated1RM: 87 },
          { date: '2026-02-01', volume: 3000, maxWeight: 75, estimated1RM: 90 },
          { date: '2026-02-15', volume: 3200, maxWeight: 78, estimated1RM: 93 },
          { date: '2026-03-01', volume: 3500, maxWeight: 80, estimated1RM: 95 },
          { date: '2026-03-15', volume: 3800, maxWeight: 82, estimated1RM: 98 },
          { date: '2026-04-01', volume: 4000, maxWeight: 85, estimated1RM: 100 },
        ]);
      }
    } catch (error) {
      logger.error('获取趋势数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const exercises = ['卧推', '深蹲', '硬拉', '肩上推举', '引体向上'];
  const timeRanges = ['1个月', '3个月', '6个月', '1年'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">力量趋势</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-gray-400 mb-2">选择动作</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {exercises.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">时间范围</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-96">
            {loading ? (
              <div className="h-full flex items-center justify-center">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="estimated1RM"
                    name="1RM 估算值"
                    stroke="#10b981"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="最大重量"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">当前 1RM</div>
            <div className="text-3xl font-bold">{trendData.length > 0 ? trendData[trendData.length - 1].estimated1RM.toFixed(1) : 0}kg</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">最大重量</div>
            <div className="text-3xl font-bold">{trendData.length > 0 ? trendData[trendData.length - 1].maxWeight : 0}kg</div>
          </div>
        </div>
      </div>
    </div>
  );
}
