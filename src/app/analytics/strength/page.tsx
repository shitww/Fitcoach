"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { logger } from '@/lib/logger';
import { SkeletonChart, SkeletonStatGrid } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PageShell, PageHeader, PageContent } from "@/components/layout";

interface TrendData {
  date: string;
  volume: number;
  maxWeight: number;
  estimated1RM: number;
}

export default function StrengthTrendsPage() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState('卧推');
  const [timeRange, setTimeRange] = useState('3个月');
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { fetchTrends(); }, [selectedExercise, timeRange]);

  const fetchTrends = async () => {
    setLoading(true);
    setError(false);
    try {
      const months = timeRange === '1个月' ? 1 : timeRange === '3个月' ? 3 : timeRange === '6个月' ? 6 : 12;
      const response = await fetch(`/api/analysis/trends?exercise=${selectedExercise}&months=${months}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTrendData(data.data || []);
    } catch (err) {
      logger.error('获取趋势数据失败:', err);
      setError(true);
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  const exercises = ['卧推', '深蹲', '硬拉', '肩上推举', '引体向上'];
  const timeRanges = ['1个月', '3个月', '6个月', '1年'];

  const latest = trendData[trendData.length - 1];

  return (
    <PageShell>
      <PageHeader title="力量趋势" onBack={() => router.back()} />
      <PageContent>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {exercises.map(ex => (
              <button key={ex} onClick={() => setSelectedExercise(ex)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: selectedExercise === ex ? 'var(--accent)' : 'var(--surface)',
                  color: selectedExercise === ex ? '#000' : 'rgba(255,255,255,0.5)',
                  border: '1px solid var(--border)'
                }}>
                {ex}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {timeRanges.map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: timeRange === r ? '#A855F7' : 'var(--surface)',
                  color: timeRange === r ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: '1px solid var(--border)'
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <>
            <SkeletonStatGrid cols={2} className="mb-4" />
            <SkeletonChart />
          </>
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="w-8 h-8" />}
            title="加载失败"
            description="请检查网络后重试"
            action={{ label: '重新加载', onClick: fetchTrends }}
          />
        ) : trendData.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-8 h-8" />}
            title="暂无数据"
            description={`未找到「${selectedExercise}」在过去 ${timeRange}的训练记录`}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>当前估算 1RM</p>
                <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                  {latest?.estimated1RM.toFixed(1) ?? 0}kg
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>最大重量</p>
                <p className="text-2xl font-black" style={{ color: '#A855F7' }}>
                  {latest?.maxWeight ?? 0}kg
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold">{selectedExercise} 力量趋势</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="estimated1RM" name="1RM 估算" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="maxWeight" name="最大重量" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </PageContent>
    </PageShell>
  );
}
