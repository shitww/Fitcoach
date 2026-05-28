'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, Trophy, TrendingUp, Calendar,
  ChevronRight, Activity, AlertCircle
} from 'lucide-react';
import { useCachedFetch } from '@/lib/client-cache';
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

function ExerciseSkeleton({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3 flex items-center gap-3 bg-background border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-32 rounded bg-secondary animate-pulse mb-1" />
          <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
        </div>
      </div>
      <div className="px-5 pt-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
        <div className="h-40 rounded-2xl bg-secondary animate-pulse" />
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}
      </div>
    </div>
  );
}

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const reduce = useReducedMotion();

  const rawId = params.id as string;
  const exerciseName = decodeURIComponent(rawId);

  const url = status === 'authenticated'
    ? `/api/exercises/${encodeURIComponent(rawId)}/history`
    : null;

  const { data: raw, isLoading, error, refresh } = useCachedFetch<{ data: ExerciseHistory }>(url, { credentials: 'include' });
  const data = raw?.data ?? null;

  if (status === 'unauthenticated') { router.push('/auth/signin'); return null; }
  if (isLoading) return <ExerciseSkeleton name={exerciseName} />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-background">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error?.message ?? '暂无数据'}</p>
        <button onClick={refresh} className="text-sm font-semibold text-primary">重试</button>
        <button onClick={() => router.back()} className="text-sm text-muted-foreground">返回</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3 flex items-center gap-3 bg-background border-b border-border">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-secondary border border-border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black truncate">
            {exerciseName}
          </h1>
          <p className="text-xs text-muted-foreground">
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
            <div className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-card border border-border">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-base font-black tabular-nums">{data.prs.maxWeight}kg</span>
              <span className="text-[10px] font-semibold text-muted-foreground">最大重量</span>
            </div>
            {data.prs.maxReps && (
              <div className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-card border border-border">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-base font-black tabular-nums">{data.prs.maxReps}次</span>
                <span className="text-[10px] font-semibold text-muted-foreground">最大次数</span>
              </div>
            )}
            {data.prs.maxVolume && (
              <div className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-card border border-border">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-base font-black tabular-nums">
                  {data.prs.maxVolume >= 1000 ? `${(data.prs.maxVolume / 1000).toFixed(1)}t` : `${data.prs.maxVolume}kg`}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">最大容量</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Volume trend mini chart */}
        {data.history.length > 2 && (
          <div className="rounded-2xl p-4 bg-card border border-border">
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
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">最近训练</span>
          </div>

          {data.history.length === 0 ? (
            <div className="rounded-2xl p-6 text-center bg-card border border-border">
              <p className="text-sm text-muted-foreground">暂无训练记录</p>
              <button
                onClick={() => router.push('/workout')}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-primary/10 text-primary"
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
                  className="rounded-2xl p-4 bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground">{entry.date}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      {entry.sets.length}组 · {entry.volume >= 1000 ? `${(entry.volume / 1000).toFixed(1)}t` : `${entry.volume}kg`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.sets.map((s, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary">
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] bg-card border border-border"
          >
            <span>查看力量趋势</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
