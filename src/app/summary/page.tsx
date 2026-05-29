"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Activity, Trophy, Zap, Target, Clock, 
  Dumbbell, Flame, CheckCircle, AlertTriangle,
  Calendar, Loader2, BookOpen
} from 'lucide-react';
import { logger } from "@/lib/logger";
import { SkeletonCard } from '@/components/Skeleton';
import { PageShell, PageHeader, PageContent } from "@/components/layout";

interface Set {
  id: string; weight: number; reps: number; rir: number | null;
  isFailure: boolean; estimated1RM: number;
}

interface Exercise {
  id: string; name: string; sets: Set[];
  restTime: number; totalVolume: number; muscleGroup?: string;
}

interface Workout {
  exercises: Exercise[];
  totalVolume: number;
  totalSets: number;
  maxWeight: number;
  duration: number;
  date: string;
  muscleGroups?: string[];
  notes?: string | null;
}

interface AIResponse {
  coach: string;
}

interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  previousMax: number;
}

// ─────────────────────────────────────────────────────────────────────────────
const TIMED_EXERCISES = new Set([
  '平板支撑', '侧平板支撑', '俯撑', '单臂平板支撑',
  '靠墙蹲', '靠墙静蹲', '壁坐',
  '悬挂', '死亡悬挂', '悬垂保持',
  'L坐', 'L-sit', '超人式保持', 'Superman保持',
  '单腿平衡', '瑜伽保持',
]);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};


function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workoutId = searchParams.get("id");
  const prsParam = searchParams.get("prs");

  const [fetching, setFetching] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [newPRs, setNewPRs] = useState<PRRecord[]>([]);

  // 从 URL 参数解析 PRs
  useEffect(() => {
    if (prsParam) {
      try {
        const parsedPRs = JSON.parse(decodeURIComponent(prsParam));
        setNewPRs(parsedPRs);
      } catch (e) {
        logger.error('Failed to parse PRs:', e);
      }
    }
  }, [prsParam]);

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [showWorkoutSelection, setShowWorkoutSelection] = useState(false);

  const exercises = workout?.exercises || [];
  const date = workout?.date || new Date().toISOString().split('T')[0];
  const duration = workout?.duration || 0;

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        if (!workoutId) {
          logger.warn("No workoutId provided");
          // Fetch latest workouts for selection
          const response = await fetch(`/api/workout`, {
            credentials: "include"
          });

          if (response.status === 401) {
            logger.warn("User not authenticated");
            return;
          }

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              setWorkouts(data.data);
              setShowWorkoutSelection(true);
            }
          }
          return;
        }

        const response = await fetch(`/api/workout?id=${workoutId}`, {
          credentials: "include"
        });

        if (response.status === 401) {
          logger.warn("User not authenticated");
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          logger.warn("API warning:", text);
          // Fetch latest workouts for selection
          const fallbackResponse = await fetch(`/api/workout`, {
            credentials: "include"
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.data && fallbackData.data.length > 0) {
              setWorkouts(fallbackData.data);
              setShowWorkoutSelection(true);
            }
          }
          return;
        }

        const data = await response.json();
        setWorkout(data.data);

      } catch (error) {
        logger.error("Fetch workout failed:", error);
        // Try to get the latest workouts for selection
        try {
          const fallbackResponse = await fetch(`/api/workout`, {
            credentials: "include"
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.data && fallbackData.data.length > 0) {
              setWorkouts(fallbackData.data);
              setShowWorkoutSelection(true);
            }
          }
        } catch (fallbackError) {
          logger.error("Fallback fetch failed:", fallbackError);
        }
      } finally {
        setFetching(false);
      }
    };
    fetchWorkout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  const stats = useMemo(() => {
    let maxWeight = 0, maxOneRM = 0, failureCount = 0, totalSets = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set: any) => {
        if (set.isWarmup || set.isCardio) return; // 热身/有氧不计入力量统计
        if (set.weight > maxWeight) maxWeight = set.weight;
        const oneRM = set.weight * (1 + set.reps / 30);
        if (oneRM > maxOneRM) maxOneRM = oneRM;
        if (set.isFailure) failureCount++;
        totalSets++;
      });
    });
    return { maxWeight, maxOneRM: Math.round(maxOneRM), failureCount, totalSets };
  }, [exercises]);

  // 判断训练类型
  const isFreeRecord = !!workout && workout.exercises.length === 0 &&
    !!workout.notes && !workout.notes.trim().startsWith('{');
  const isCardioRecord = !!workout && workout.exercises.some((ex: any) =>
    ex.sets.some((s: any) => s.isCardio));




  if (showWorkoutSelection) {
    return (
      <PageShell>
        <PageHeader title="选择训练记录" onBack={() => router.push('/')} />
        <PageContent>

          <div className="space-y-4">
            {workouts.map((workout) => {
              const exerciseCount = workout.exercises?.length || 0;
              const totalSets = workout.exercises?.reduce((sum: any, ex: any) => sum + ex.sets.length, 0) || 0;
              return (
                <div 
                  key={workout.id} 
                  className="rounded-2xl p-5 bg-card border border-border cursor-pointer transition-all hover:border-primary/50"
                  onClick={() => router.push(`/summary?id=${workout.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold mb-1">{new Date(workout.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                      <div className="text-sm flex items-center gap-3 text-muted-foreground">
                        <span>{exerciseCount} 个动作</span>
                        <span>{totalSets} 组</span>
                        <span>{workout.totalVolume} kg</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      查看详情 →
                    </div>
                  </div>
                  <div className="space-y-2">
                    {workout.exercises?.slice(0, 3).map((ex: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-secondary">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        <span className="text-sm">{ex.name}</span>
                        <span className="ml-auto text-sm text-muted-foreground">{ex.sets.length} 组</span>
                      </div>
                    ))}
                    {workout.exercises?.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        还有 {workout.exercises.length - 3} 个动作...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90">
              <Zap className="w-4 h-4" />开始新训练
            </Link>
          </div>
        </PageContent>
      </PageShell>
    );
  }

  if (!workout) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"><svg width="44" height="44" viewBox="0 0 70 44" fill="none">
              <text x="0" y="36" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="900" fill="#000">
                <tspan>X</tspan><tspan fontWeight="800" fontSize="30">FIT</tspan><tspan>X</tspan>
              </text>
            </svg></div>
          <h1 className="text-2xl font-black mb-4">没有找到训练记录</h1>
          <p className="mb-6 text-muted-foreground">暂无训练记录，请先开始一次训练</p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href="/workout" className="text-sm font-semibold px-4 py-2 rounded-xl text-primary-foreground bg-primary">去开始一次训练</Link>
          </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="训练总结"
        onBack={() => router.push('/')}
        action={undefined}
      />
      <PageContent>

        {/* PR Banner */}
        {newPRs.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/20">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-lg font-bold text-warning">新纪录！</div>
                <div className="text-sm text-foreground">恭喜打破个人最佳！</div>
              </div>
            </div>
            <div className="space-y-2">
              {newPRs.map((pr, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-warning" />
                    <span className="font-medium">{pr.exerciseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">上次: {pr.previousMax}kg</span>
                    <span className="font-bold text-warning">
                      {pr.weight}kg × {pr.reps}次
                      <span className="ml-2 text-sm">(+{pr.weight - pr.previousMax}kg)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save status */}
        {fetching ? (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-primary/10 border border-primary/20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-primary">正在加载训练记录...</span>
          </div>
        ) : workout ? (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-success/10 border border-success/20">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-success">训练记录已保存</span>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm text-warning">记录加载失败，请检查登录状态</span>
          </div>
        )}

        {/* Stats */}
        <div className={`grid gap-3 mb-8 ${isFreeRecord ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {(isFreeRecord ? [
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', colorClass: 'text-recovery' },
            { icon: BookOpen, label: '记录类型', value: '自由记录', unit: '', colorClass: 'text-recovery' },
          ] : isCardioRecord ? [
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', colorClass: 'text-blue-400' },
            { icon: Flame, label: '消耗热量', value: (exercises[0]?.sets[0] as any)?.rir ?? 0, unit: 'kcal', colorClass: 'text-warning' },
            { icon: Activity, label: '距离', value: (exercises[0]?.sets[0] as any)?.weight ?? 0, unit: 'km', colorClass: 'text-blue-400' },
            { icon: Target, label: '平均心率', value: (exercises[0]?.sets[0] as any)?.reps ?? 0, unit: 'bpm', colorClass: 'text-danger' },
          ] : [
            { icon: Activity, label: '训练总量', value: workout.totalVolume, unit: 'kg', colorClass: 'text-primary' },
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', colorClass: 'text-primary' },
            { icon: Target, label: '完成组数', value: stats.totalSets, unit: '组', colorClass: 'text-recovery' },
            { icon: Trophy, label: '最大重量', value: stats.maxWeight, unit: 'kg', colorClass: 'text-warning' },
          ]).map((stat, i) => (
            <div key={i} className="rounded-2xl p-5 bg-card border border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className={`text-2xl font-black ${stat.colorClass}`}>{stat.value}<span className="text-sm text-muted-foreground ml-0.5">{stat.unit}</span></div>
            </div>
          ))}
        </div>

        {/* Free-record notes display */}
        {isFreeRecord && workout.notes && (
          <div className="rounded-2xl p-5 mb-8 bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-bold text-foreground">训练记录</h3>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {workout.notes}
            </p>
          </div>
        )}

        {/* Muscle Groups */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <div className="rounded-2xl p-5 mb-8 bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">训练部位</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((group, index) => (
                <span key={index} className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all bg-primary/10 text-primary">
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Training Notes — hide for free records (already shown in the record card above) */}
        {workout.notes && !isFreeRecord && (
          <div className="rounded-2xl p-6 mb-8 bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black text-primary">训练心得</h3>
            </div>
            <div className="text-sm text-foreground">{workout.notes}</div>
          </div>
        )}

        {/* Detail — compact history style matching workout recording */}
        {exercises.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-black mb-3 flex items-center gap-2 text-foreground">
            <Dumbbell className="w-4 h-4 text-primary" />
            训练详情
          </h3>
          <div className="space-y-2">
            {exercises.map((ex: any, ei: number) => {
              const isWarmupEx = ex.sets.every((s: any) => s.isWarmup);
              const isCardioEx = ex.sets.every((s: any) => s.isCardio);
              const exIsTimed = TIMED_EXERCISES.has(ex.name.split(' (')[0]);
              const vol = (isWarmupEx || isCardioEx || exIsTimed)
                ? 0
                : ex.sets.reduce((s: number, st: any) => s + (st.isBodyweight ? 0 : st.weight * st.reps), 0);
              return (
                <div key={ei} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isWarmupEx ? 'bg-warning/12' : 'bg-success/12'}`}>
                    <span className={`text-xs font-bold ${isWarmupEx ? 'text-warning' : 'text-success'}`}>
                      {isWarmupEx ? '热' : isCardioEx ? '氧' : '✓'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-foreground">
                      {ex.name.split(' (')[0]}
                    </div>
                    <div className="text-xs mt-0.5 truncate text-muted-foreground">
                      {isCardioEx ? (
                        (() => {
                          const s = ex.sets[0] as any;
                          const parts: string[] = [];
                          if (s?.weight > 0) parts.push(`${s.weight}km`);
                          if (s?.reps > 0) parts.push(`${s.reps}bpm`);
                          if (s?.rir > 0) parts.push(`${s.rir}kcal`);
                          return parts.join(' · ');
                        })()
                      ) : (
                        ex.sets.map((s: any, i: number) => (
                          <span key={i}>{i > 0 ? ' · ' : ''}
                            {exIsTimed ? `${s.reps}秒` : (s.isBodyweight ? `${s.reps}次` : `${s.weight}×${s.reps}`)}
                            {s.isFailure ? ' ⚡' : ''}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  {vol > 0 && (
                    <div className="text-xs font-bold shrink-0 text-muted-foreground">
                      {vol}kg
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Bottom */}
        <div className="flex justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-secondary border border-border text-foreground hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90">
            <Zap className="w-4 h-4" />开始新训练
          </Link>
        </div>
      </PageContent>
    </PageShell>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="page-shell items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }
    >
      <SummaryContent />
    </Suspense>
  );
}
