"use client";

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
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

interface VolumeData {
  week: string;
  volume: number;
  trend: number;
}

export default function VolumeTrendsPage() {
  const [timeRange, setTimeRange] = useState('4周');
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolumeData();
  }, [timeRange]);

  const fetchVolumeData = async () => {
    try {
      // 模拟数据
      const weeks = timeRange === '4周' ? 4 : timeRange === '8周' ? 8 : 12;
      const data: VolumeData[] = [];
      
      for (let i = weeks; i > 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}-${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
        const volume = 5000 + Math.random() * 3000;
        
        data.push({
          week: weekLabel,
          volume: Math.round(volume),
          trend: data.length > 0 ? data[data.length - 1].volume : volume
        });
      }
      
      setVolumeData(data);
    } catch (error) {
      logger.warn('获取训练量数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = ['4周', '8周', '12周'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">训练量趋势</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6">
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
                <BarChart
                  data={volumeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="week" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="volume" name="周训练量" fill="#10b981" />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    name="趋势线"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">平均周训练量</div>
            <div className="text-3xl font-bold">
              {volumeData.length > 0 ? 
                (volumeData.reduce((sum, item) => sum + item.volume, 0) / volumeData.length).toFixed(0) : 
                0
              }kg
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">最高周训练量</div>
            <div className="text-3xl font-bold">
              {volumeData.length > 0 ? 
                Math.max(...volumeData.map(item => item.volume)) : 
                0
              }kg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
