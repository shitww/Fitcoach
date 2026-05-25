"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, AlertCircle, BarChart2 } from 'lucide-react';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { logger } from '@/lib/logger';
import { SkeletonChart, SkeletonStatGrid } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { AmbientGlow } from "@/components/AmbientGlow";

interface VolumeData {
  week: string;
  volume: number;
  trend: number;
}

export default function VolumeTrendsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState(4);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchVolumeData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/workout?limit=200', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const workouts: Array<{ date: string; totalVolume: number }> = json.data || [];

      const now = new Date();
      const buckets: VolumeData[] = [];

      for (let i = timeRange; i > 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i - 1) * 7);
        weekEnd.setHours(23, 59, 59, 999);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7 + 1);
        weekStart.setHours(0, 0, 0, 0);

        const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        const volume = workouts
          .filter(w => { const d = new Date(w.date); return d >= weekStart && d <= weekEnd; })
          .reduce((sum, w) => sum + (w.totalVolume || 0), 0);

        buckets.push({ week: label, volume: Math.round(volume), trend: 0 });
      }

      buckets.forEach((b, i) => {
        const slice = buckets.slice(Math.max(0, i - 2), i + 1);
        b.trend = Math.round(slice.reduce((s, x) => s + x.volume, 0) / slice.length);
      });

      setVolumeData(buckets);
    } catch (err) {
      logger.error('获取训练量数据失败:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchVolumeData(); }, [fetchVolumeData]);

  const avgVolume = volumeData.length
    ? Math.round(volumeData.reduce((s, d) => s + d.volume, 0) / volumeData.length) : 0;
  const maxVolume = volumeData.length ? Math.max(...volumeData.map(d => d.volume)) : 0;
  const hasData = volumeData.some(d => d.volume > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AmbientGlow />
      <div className="relative max-w-2xl mx-auto px-4 py-6 pb-20">

        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl transition-all hover:bg-white/5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">训练量趋势</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>按周统计真实训练量</p>
          </div>
        </header>

        <div className="flex gap-2 mb-6">
          {[4, 8, 12].map(w => (
            <button key={w} onClick={() => setTimeRange(w)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: timeRange === w ? 'var(--accent)' : 'var(--surface)',
                color: timeRange === w ? '#000' : 'rgba(255,255,255,0.5)',
                border: '1px solid var(--border)'
              }}>
              {w}周
            </button>
          ))}
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
            action={{ label: '重新加载', onClick: fetchVolumeData }}
          />
        ) : !hasData ? (
          <EmptyState
            icon={<BarChart2 className="w-8 h-8" />}
            title="暂无数据"
            description={`过去 ${timeRange} 周内无训练记录，完成训练后自动统计`}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>平均周训练量</p>
                <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                  {avgVolume >= 1000 ? (avgVolume / 1000).toFixed(1) + 't' : avgVolume + 'kg'}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>最高周训练量</p>
                <p className="text-2xl font-black" style={{ color: '#A855F7' }}>
                  {maxVolume >= 1000 ? (maxVolume / 1000).toFixed(1) + 't' : maxVolume + 'kg'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold">周训练量（kg）</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="volume" name="训练量" fill="var(--accent)" radius={[4,4,0,0]} opacity={0.85} />
                  <Line type="monotone" dataKey="trend" name="3周均线" stroke="#A855F7" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
