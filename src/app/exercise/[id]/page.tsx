'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, Trophy, TrendingUp, Clock, Dumbbell, Calendar,
  ChevronRight, Activity
} from 'lucide-react';
import { logger } from '@/lib/logger';
import VolumeChartMini from '@/components/workout/VolumeChartMini';

interface HistoryEntry {
  workoutId: string;
  date: string;
  sets: { weight: number; reps: number; setNumber: number }[];
  volume: number;
  maxWeight: number;
}

interface ExerciseHistory {
  history: HistoryEntry[];
  prs: {
    maxWeight: number | null;
    maxReps: number | null;
    maxVolume: number | null;
  };
  totalSessions: number;
}

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const reduce = useReducedMotion();

  const rawId = params.id as string;
  const exerciseName = decodeURIComponent(rawId);

  const [data, setData] = useState<ExerciseHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/exercises/${encodeURIComponent(rawId)}/history`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) { router.push('/auth/signin'); return; }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      logger.error('加载动作历史失败:', e);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  }, [rawId, router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ background: 'var(--background)', color: 'var(--text-low)' }}>
        <p>{error ?? '暂无数据'}</p>
        <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3 flex items-center gap-3"
        style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black truncate" style={{ color: 'var(--text-high)' }}>
            {exerciseName}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-low)' }}>
            {data.totalSessions > 0 ? `${data.totalSessions} 次训练记录` : '暂无训练记录'}
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* PR Cards */}
        {data.prs.maxWeight && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="flex flex-col items-center gap-1 py-4 rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <span className="text-base font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
                {data.prs.maxWeight}kg
              </span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>最大重量</span>
            </div>
            {data.prs.maxReps && (
              <div className="flex flex-col items-center gap-1 py-4 rounded-2xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-base font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
                  {data.prs.maxReps}次
                </span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>最大次数</span>
              </div>
            )}
            {data.prs.maxVolume && (
              <div className="flex flex-col items-center gap-1 py-4 rounded-2xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-base font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
                  {data.prs.maxVolume >= 1000 ? `${(data.prs.maxVolume / 1000).toFixed(1)}t` : `${data.prs.maxVolume}kg`}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-low)' }}>最大容量</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Volume trend mini chart */}
        {data.history.length > 2 && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <VolumeChartMini
              data={data.history.slice(-7).map(h => ({
                label: h.date.slice(5),
                value: h.volume,
              }))}
            />
          </div>
        )}

        {/* History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-med)' }}>最近训练</span>
          </div>

          {data.history.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-low)' }}>暂无训练记录</p>
              <button
                onClick={() => router.push('/workout')}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                去训练
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.history.map((entry, i) => (
                <motion.div
                  key={entry.workoutId}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-low)' }}>
                      {entry.date}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}>
                      {entry.sets.length}组 · {entry.volume >= 1000 ? `${(entry.volume / 1000).toFixed(1)}t` : `${entry.volume}kg`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.sets.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-med)' }}
                      >
                        {s.weight}kg × {s.reps}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Trend entry */}
        {data.history.length > 2 && (
          <button
            onClick={() => router.push('/analytics/strength')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-med)' }}
          >
            <span>查看力量趋势</span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
