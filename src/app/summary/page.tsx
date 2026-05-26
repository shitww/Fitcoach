"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Activity, Trophy, Zap, Target, Clock, 
  Dumbbell, Flame, CheckCircle, AlertTriangle,
  Calendar, Loader2, BookOpen,
  Edit2, Save, X, RefreshCw
} from 'lucide-react';
import { logger } from "@/lib/logger";
import { SkeletonCard } from '@/components/Skeleton';
import { AmbientGlow } from "@/components/AmbientGlow";

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

  const [aiFeedback, setAiFeedback] = useState<AIResponse | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'checking'|'none'|'generating'|'done'>('checking');
  const [fetching, setFetching] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [newPRs, setNewPRs] = useState<PRRecord[]>([]);
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editedSets, setEditedSets] = useState<Record<string, { weight: number; reps: number; rir: number; isFailure: boolean }>>({});
  const [editedNotes, setEditedNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

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

  // Build payload for AI generation
  const buildPayload = (w: Workout) => {
    if (isFreeRecord) return { workoutId: workoutId!, workoutType: 'free', duration: w.duration, notes: w.notes };
    if (isCardioRecord) {
      const ex0 = w.exercises[0];
      const s0 = ex0?.sets[0] as any;
      const machineName = ex0?.name?.toLowerCase().includes('stair') ? 'stairclimber' : 'treadmill';
      let notesData: any = {};
      try { notesData = w.notes ? JSON.parse(w.notes) : {}; } catch {}
      return { workoutId: workoutId!, workoutType: 'cardio', duration: w.duration, cardioData: { machine: notesData.activity ?? machineName, speed: notesData.speed ?? s0?.weight ?? 0, incline: notesData.incline ?? 0, level: notesData.level ?? 0, distance: notesData.distance ?? s0?.weight ?? 0, calories: notesData.calories ?? s0?.rir ?? 0 } };
    }
    const totalSets = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
    const maxWeight = w.exercises.reduce((m, ex) => ex.sets.reduce((mm, s) => Math.max(mm, s.weight), m), 0);
    return { workoutId: workoutId!, workoutType: 'strength', duration: w.duration, totalVolume: w.totalVolume, totalSets, maxWeight, exercises: w.exercises };
  };

  // Check feedback cache, then auto-generate if nothing cached
  useEffect(() => {
    if (!workout || !workoutId) return;
    setFeedbackStatus('checking');
    fetch(`/api/analysis/workout-feedback?workoutId=${workoutId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.cached && d.feedback) { setAiFeedback(d.feedback); setFeedbackStatus('done'); }
        else autoGenerate(workout);
      })
      .catch(() => autoGenerate(workout));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout]);

  const autoGenerate = async (w: Workout) => {
    setFeedbackStatus('generating');
    try {
      const r = await fetch('/api/analysis/workout-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(buildPayload(w)),
      });
      const data = await r.json();
      if (data.success && data.feedback?.coach) { setAiFeedback(data.feedback); setFeedbackStatus('done'); }
      else setFeedbackStatus('none');
    } catch {
      setFeedbackStatus('none');
    }
  };

  const handleGenerateFeedback = async () => {
    if (!workout) return;
    autoGenerate(workout);
  };

  // Enter edit mode
  const enterEdit = () => {
    if (!workout) return;
    const map: Record<string, { weight: number; reps: number; rir: number; isFailure: boolean }> = {};
    workout.exercises.forEach(ex => ex.sets.forEach(s => { map[s.id] = { weight: s.weight, reps: s.reps, rir: s.rir ?? 0, isFailure: s.isFailure }; }));
    setEditedSets(map);
    setEditedNotes(workout.notes ?? '');
    setEditMode(true);
  };

  // Save edits
  const saveEdit = async () => {
    if (!workout || !workoutId) return;
    setSaveLoading(true);
    try {
      const sets = Object.entries(editedSets).map(([id, v]) => ({ id, ...v }));
      const r = await fetch(`/api/workout?id=${workoutId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ notes: editedNotes, sets }),
      });
      if (r.ok) {
        const d = await r.json();
        setWorkout(d.data);
        setEditMode(false);
        setAiFeedback(null);
        setFeedbackStatus('none');
      }
    } finally { setSaveLoading(false); }
  };



  if (showWorkoutSelection) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <AmbientGlow />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black">选择训练记录</h1>
              <div className="text-sm" style={{ color: 'var(--text-low)' }}>请从历史记录中选择一次训练</div>
            </div>
          </div>

          <div className="space-y-4">
            {workouts.map((workout) => {
              const exerciseCount = workout.exercises?.length || 0;
              const totalSets = workout.exercises?.reduce((sum: any, ex: any) => sum + ex.sets.length, 0) || 0;
              return (
                <div 
                  key={workout.id} 
                  className="rounded-2xl p-5 cursor-pointer transition-all hover:border-blue-500"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  onClick={() => router.push(`/summary?id=${workout.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold mb-1">{new Date(workout.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                      <div className="text-sm flex items-center gap-3" style={{ color: 'var(--text-faint)' }}>
                        <span>{exerciseCount} 个动作</span>
                        <span>{totalSets} 组</span>
                        <span>{workout.totalVolume} kg</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                      查看详情 →
                    </div>
                  </div>
                  <div className="space-y-2">
                    {workout.exercises?.slice(0, 3).map((ex: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent-glow)' }} />
                        <span className="text-sm">{ex.name}</span>
                        <span className="ml-auto text-sm" style={{ color: 'var(--text-faint)' }}>{ex.sets.length} 组</span>
                      </div>
                    ))}
                    {workout.exercises?.length > 3 && (
                      <div className="text-center text-sm" style={{ color: 'var(--text-faint)' }}>
                        还有 {workout.exercises.length - 3} 个动作...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black" style={{ background: 'var(--accent)' }}>
              <Zap className="w-4 h-4" />开始新训练
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"><svg width="44" height="44" viewBox="0 0 70 44" fill="none">
              <text x="0" y="36" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="900" fill="#000">
                <tspan>X</tspan><tspan fontWeight="800" fontSize="30">FIT</tspan><tspan>X</tspan>
              </text>
            </svg></div>
          <h1 className="text-2xl font-black mb-4">没有找到训练记录</h1>
          <p className="mb-6" style={{ color: 'var(--text-low)' }}>暂无训练记录，请先开始一次训练</p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href="/workout" className="text-sm font-semibold px-4 py-2 rounded-xl text-black" style={{ background: 'var(--accent)' }}>去开始一次训练</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <AmbientGlow />
      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black">训练总结</h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-low)' }}>
              <Calendar className="w-4 h-4" />
              {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
          {!isFreeRecord && !isCardioRecord && (
            editMode ? (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="px-3 py-2 rounded-xl text-sm flex items-center gap-1.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-low)' }}>
                  <X className="w-3.5 h-3.5" />取消
                </button>
                <button onClick={saveEdit} disabled={saveLoading} className="px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                  {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}保存
                </button>
              </div>
            ) : (
              <button onClick={enterEdit} className="px-3 py-2 rounded-xl text-sm flex items-center gap-1.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)' }}>
                <Edit2 className="w-3.5 h-3.5" />编辑
              </button>
            )
          )}
        </div>

        {/* PR Banner */}
        {newPRs.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.08) 100%)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.2)' }}>
                <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#FFD700' }}>🏆 新纪录！</div>
                <div className="text-sm" style={{ color: 'var(--text-med)' }}>恭喜打破个人最佳！</div>
              </div>
            </div>
            <div className="space-y-2">
              {newPRs.map((pr, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" style={{ color: '#FFD700' }} />
                    <span className="font-medium">{pr.exerciseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-low)' }}>上次: {pr.previousMax}kg</span>
                    <span className="font-bold" style={{ color: '#FFD700' }}>
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
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#00D4FF' }} />
            <span className="text-sm" style={{ color: '#00D4FF' }}>正在加载训练记录...</span>
          </div>
        ) : workout ? (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <span className="text-sm" style={{ color: 'var(--accent)' }}>✅ 训练记录已保存</span>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#FFB800' }} />
            <span className="text-sm" style={{ color: '#FFB800' }}>⚠️ 记录加载失败，请检查登录状态</span>
          </div>
        )}

        {/* Stats */}
        <div className={`grid gap-3 mb-8 ${isFreeRecord ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {(isFreeRecord ? [
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', color: '#A855F7' },
            { icon: BookOpen, label: '记录类型', value: '自由记录', unit: '', color: '#A855F7' },
          ] : isCardioRecord ? [
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', color: '#60A5FA' },
            { icon: Flame, label: '消耗热量', value: (exercises[0]?.sets[0] as any)?.rir ?? 0, unit: 'kcal', color: '#f97316' },
            { icon: Activity, label: '距离', value: (exercises[0]?.sets[0] as any)?.weight ?? 0, unit: 'km', color: '#60A5FA' },
            { icon: Target, label: '平均心率', value: (exercises[0]?.sets[0] as any)?.reps ?? 0, unit: 'bpm', color: '#ef4444' },
          ] : [
            { icon: Activity, label: '训练总量', value: workout.totalVolume, unit: 'kg', color: 'var(--accent)' },
            { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', color: '#00D4FF' },
            { icon: Target, label: '完成组数', value: stats.totalSets, unit: '组', color: '#A855F7' },
            { icon: Trophy, label: '最大重量', value: stats.maxWeight, unit: 'kg', color: '#FFB800' },
          ]).map((stat, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{stat.label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}<span className="text-sm text-foreground/30 ml-0.5">{stat.unit}</span></div>
            </div>
          ))}
        </div>

        {/* Free-record notes display */}
        {isFreeRecord && workout.notes && (
          <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--surface)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📝</span>
              <h3 className="text-base font-bold text-foreground">训练记录</h3>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-med)' }}>
              {workout.notes}
            </p>
          </div>
        )}

        {/* Muscle Groups */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h3 className="text-lg font-bold">训练部位</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((group, index) => (
                <span key={index} className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        <div className="rounded-2xl p-6 mb-8" style={{
          background: 'var(--surface)',
          border: `1px solid ${isFreeRecord ? 'rgba(168,85,247,0.2)' : isCardioRecord ? 'rgba(96,165,250,0.2)' : 'var(--accent-dim)'}`
        }}>
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: isFreeRecord ? 'rgba(168,85,247,0.1)' : isCardioRecord ? 'rgba(96,165,250,0.1)' : 'var(--accent-dim)'
              }}>
                {isFreeRecord ? <span className="text-lg">🧠</span> : isCardioRecord ? <Flame className="w-5 h-5" style={{ color: '#60A5FA' }} /> : <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />}
              </div>
              <div>
                <h3 className="text-lg font-black" style={{ color: isFreeRecord ? '#A855F7' : isCardioRecord ? '#60A5FA' : 'var(--accent)' }}>
                  {isFreeRecord ? 'AI 智能解读' : 'AI 教练反馈'}
                </h3>
                {feedbackStatus === 'done' && (
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>已缓存 · 编辑后可重新生成</div>
                )}
              </div>
            </div>
            {feedbackStatus === 'done' && (
              <button onClick={handleGenerateFeedback} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-low)' }}>
                <RefreshCw className="w-3 h-3" />重新生成
              </button>
            )}
          </div>
          {(feedbackStatus === 'checking' || feedbackStatus === 'generating' || fetching) ? (
            <div>
              <SkeletonCard />
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-faint)' }}>
                {feedbackStatus === 'generating' ? 'AI 教练分析中…' : '读取缓存…'}
              </p>
            </div>
          ) : feedbackStatus === 'none' ? (
            <div className="text-center py-4">
              <p className="text-sm mb-4" style={{ color: 'var(--text-low)' }}>AI 分析暂时不可用</p>
              <button onClick={handleGenerateFeedback}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm mx-auto"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                <RefreshCw className="w-3.5 h-3.5" />重试
              </button>
            </div>
          ) : aiFeedback?.coach ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-med)' }}>
              {aiFeedback.coach}
            </p>
          ) : null}
        </div>

        {/* Training Notes — hide for free records (already shown in the record card above) */}
        {(workout.notes || editMode) && !isFreeRecord && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--surface)', border: `1px solid ${editMode ? 'rgba(0,212,255,0.3)' : '#1e1e1e'}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <BookOpen className="w-5 h-5" style={{ color: '#00D4FF' }} />
              </div>
              <h3 className="text-lg font-black" style={{ color: '#00D4FF' }}>训练心得</h3>
            </div>
            {editMode ? (
              <textarea
                value={editedNotes}
                onChange={e => setEditedNotes(e.target.value)}
                rows={4}
                placeholder="写下本次训练感受、注意事项…"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)' }}
              />
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-med)' }}>{workout.notes}</div>
            )}
          </div>
        )}

        {/* Detail — compact history style matching workout recording */}
        {exercises.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-black mb-3 flex items-center gap-2" style={{ color: 'var(--text-high)' }}>
            <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
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
                <div key={ei} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isWarmupEx ? 'rgba(251,146,60,0.12)' : 'rgba(52,211,153,0.12)' }}>
                    <span className="text-xs" style={{ color: isWarmupEx ? '#fb923c' : '#34D399' }}>
                      {isWarmupEx ? '热' : isCardioEx ? '氧' : '✓'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-med)' }}>
                      {ex.name.split(' (')[0]}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-low)' }}>
                      {editMode && !isWarmupEx && !isCardioEx ? (
                        ex.sets.map((set: any, si: number) => {
                          const draft = editedSets[set.id] ?? { weight: set.weight, reps: set.reps, rir: set.rir ?? 0, isFailure: set.isFailure };
                          return (
                            <span key={si} className="inline-flex items-center gap-1 mr-2">
                              <span style={{ color: 'var(--text-faint)' }}>{si + 1}.</span>
                              {!set.isBodyweight && (
                                <input type="text" inputMode="decimal" value={draft.weight}
                                  onChange={e => setEditedSets(p => ({ ...p, [set.id]: { ...p[set.id], weight: Number(e.target.value) } }))}
                                  className="w-12 text-xs text-center font-bold bg-transparent outline-none border-b"
                                  style={{ borderColor: 'var(--color-accent)', color: 'var(--foreground)' }} />
                              )}
                              <input type="text" inputMode="numeric" value={draft.reps}
                                onChange={e => setEditedSets(p => ({ ...p, [set.id]: { ...p[set.id], reps: Number(e.target.value) } }))}
                                className="w-10 text-xs text-center font-bold bg-transparent outline-none border-b"
                                style={{ borderColor: 'var(--color-accent)', color: 'var(--foreground)' }} />
                            </span>
                          );
                        })
                      ) : isCardioEx ? (
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
                            {s.isFailure ? '🔥' : ''}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  {vol > 0 && !editMode && (
                    <div className="text-xs font-bold shrink-0" style={{ color: 'var(--text-faint)' }}>
                      {vol}kg
                    </div>
                  )}
                  {editMode && !isWarmupEx && !isCardioEx && (
                    <button onClick={() => setEditedSets(p => {
                      const s0 = ex.sets[0] as any;
                      const d = p[s0?.id];
                      if (!d) return p;
                      return { ...p, [s0.id]: { ...d, isFailure: !d.isFailure } };
                    })}
                      className="px-2 py-0.5 rounded-full text-xs shrink-0"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-low)', border: '1px solid var(--border)' }}>
                      力竭
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Bottom */}
        <div className="flex justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black" style={{ background: 'var(--accent)' }}>
            <Zap className="w-4 h-4" />开始新训练
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4" style={{ border: '4px solid var(--accent)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-low)' }}>加载中...</p>
        </div>
      </div>
    }
    >
      <SummaryContent />
    </Suspense>
  );
}
