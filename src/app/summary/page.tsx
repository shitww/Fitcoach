"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Activity, Trophy, Zap, Target, Clock, 
  TrendingUp, Dumbbell, Flame, CheckCircle, AlertTriangle,
  Lightbulb, Calendar, Loader2, BookOpen
} from 'lucide-react';
import { logger } from "@/lib/logger";

interface Set {
  weight: number; reps: number; rir: number | null;
  isFailure: boolean; estimated1RM: number;
}

interface Exercise {
  id: string; name: string; sets: Set[];
  restTime: number; totalVolume: number; muscleGroup?: string;
}

interface Workout { exercises: Exercise[]; totalVolume: number; totalSets: number; maxWeight: number; duration: number; date: string; muscleGroups?: string[]; }

interface AIResponse {
  summary: string; progress: string; fatigue: string;
  suggestions: string[]; nextSteps: string[];
}

interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  previousMax: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const generateSimpleFeedback = (workout: Workout): AIResponse => {
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const failureCount = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.isFailure).length, 0);
  const failureRate = totalSets > 0 ? (failureCount / totalSets) * 100 : 0;
  const exerciseNames = workout.exercises.map(ex => ex.name.split(' ')[0]).join('、');
  const muscleGroups = workout.muscleGroups?.join('、') || '多个部位';
  let fatigueStatus = '恢复良好';
  if (failureRate > 25) fatigueStatus = '轻度疲劳';
  else if (failureRate > 35) fatigueStatus = '需要休息';
  return {
    summary: `本次训练总训练量 ${workout.totalVolume}kg，完成 ${workout.exercises.length} 个动作（${exerciseNames}），训练时长 ${formatTime(workout.duration)}。主要训练了${muscleGroups}等部位。`,
    progress: `本次训练共完成 ${totalSets} 组，最大重量 ${workout.maxWeight}kg。训练强度适中，保持规律训练会让你持续进步！`,
    fatigue: `本次力竭 ${failureCount} 次，力竭占比 ${failureRate.toFixed(1)}%，${fatigueStatus}。`,
    suggestions: ['保持当前训练节奏，继续稳步提升', '建议每周安排 1-2 天完全休息日', '注意训练后的营养补充和睡眠质量', '可以考虑在下一次训练中适当增加重量'],
    nextSteps: ['下次训练可以尝试增加 2.5-5kg 重量', '保持每周 3-4 次的训练频率', '记录每次训练数据，追踪进步']
  };
};

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workoutId = searchParams.get("id");
  const prsParam = searchParams.get("prs");

  const [aiFeedback, setAiFeedback] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
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

  const exercises = workout?.exercises || [];
  const date = workout?.date || new Date().toISOString().split('T')[0];
  const duration = workout?.duration || 0;

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [showWorkoutSelection, setShowWorkoutSelection] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const workoutId = searchParams.get("id");

        if (!workoutId) {
          logger.warn("No workoutId provided");
          // Fetch latest workouts for selection
          const response = await fetch(`/api/workout`, {
            credentials: "include"
          });

          if (response.status === 401) {
            logger.warn("User not authenticated");
            setFetching(false);
            return;
          }

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              setWorkouts(data.data);
              setShowWorkoutSelection(true);
            }
          }
          setFetching(false);
          return;
        }

        const response = await fetch(`/api/workout?id=${workoutId}`, {
          credentials: "include"
        });

        if (response.status === 401) {
          logger.warn("User not authenticated");
          setFetching(false);
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
          setFetching(false);
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
        } finally {
          setFetching(false);
        }
      } finally {
        setFetching(false);
      }
    };
    fetchWorkout();
  }, []);

  const stats = useMemo(() => {
    let maxWeight = 0, maxOneRM = 0, failureCount = 0, totalSets = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.weight > maxWeight) maxWeight = set.weight;
        const oneRM = set.weight * (1 + set.reps / 30);
        if (oneRM > maxOneRM) maxOneRM = oneRM;
        if (set.isFailure) failureCount++;
        totalSets++;
      });
    });
    return { maxWeight, maxOneRM: Math.round(maxOneRM), failureCount, totalSets };
  }, [exercises]);

  // 当workout加载完成后生成AI反馈
  useEffect(() => {
    if (workout) {
      const feedback = generateSimpleFeedback(workout);
      setAiFeedback(feedback);
    }
  }, [workout]);



  if (showWorkoutSelection) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2.5 rounded-xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black">选择训练记录</h1>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>请从历史记录中选择一次训练</div>
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
                  style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}
                  onClick={() => router.push(`/summary?id=${workout.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold mb-1">{new Date(workout.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                      <div className="text-sm flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span>{exerciseCount} 个动作</span>
                        <span>{totalSets} 组</span>
                        <span>{workout.totalVolume} kg</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#CCFF00' }}>
                      查看详情 →
                    </div>
                  </div>
                  <div className="space-y-2">
                    {workout.exercises?.slice(0, 3).map((ex: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: '#111' }}>
                        <Dumbbell className="w-4 h-4" style={{ color: 'rgba(204,255,0,0.5)' }} />
                        <span className="text-sm">{ex.name}</span>
                        <span className="ml-auto text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{ex.sets.length} 组</span>
                      </div>
                    ))}
                    {workout.exercises?.length > 3 && (
                      <div className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        还有 {workout.exercises.length - 3} 个动作...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black" style={{ background: '#CCFF00' }}>
              <Zap className="w-4 h-4" />开始新训练
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"><svg width="44" height="44" viewBox="0 0 70 44" fill="none">
              <text x="0" y="36" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="900" fill="#000">
                <tspan>X</tspan><tspan fontWeight="800" fontSize="30">FIT</tspan><tspan>X</tspan>
              </text>
            </svg></div>
          <h1 className="text-2xl font-black mb-4">没有找到训练记录</h1>
          <p className="mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>暂无训练记录，请先开始一次训练</p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href="/workout" className="text-sm font-semibold px-4 py-2 rounded-xl text-black" style={{ background: '#CCFF00' }}>去开始一次训练</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)' }} />
      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2.5 rounded-xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">训练总结</h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Calendar className="w-4 h-4" />
              {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
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
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>恭喜打破个人最佳！</div>
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
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>上次: {pr.previousMax}kg</span>
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
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)' }}>
            <CheckCircle className="w-5 h-5" style={{ color: '#CCFF00' }} />
            <span className="text-sm" style={{ color: '#CCFF00' }}>✅ 训练记录已保存</span>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#FFB800' }} />
            <span className="text-sm" style={{ color: '#FFB800' }}>⚠️ 记录加载失败，请检查登录状态</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {
            [
              { icon: Activity, label: '训练总量', value: workout.totalVolume, unit: 'kg', color: '#CCFF00' },
              { icon: Clock, label: '训练时长', value: formatTime(duration), unit: '', color: '#00D4FF' },
              { icon: Target, label: '完成组数', value: stats.totalSets, unit: '组', color: '#A855F7' },
              { icon: Trophy, label: '最大重量', value: stats.maxWeight, unit: 'kg', color: '#FFB800' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</span>
                </div>
                <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}<span className="text-sm text-white/30 ml-0.5">{stat.unit}</span></div>
              </div>
            ))
          }
        </div>

        {/* Muscle Groups */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <div className="rounded-2xl p-5 mb-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5" style={{ color: '#CCFF00' }} />
              <h3 className="text-lg font-bold">训练部位</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((group, index) => (
                <span key={index} className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid rgba(204,255,0,0.15)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204,255,0,0.1)' }}>
              <Zap className="w-5 h-5" style={{ color: '#CCFF00' }} />
            </div>
            <h3 className="text-lg font-black" style={{ color: '#CCFF00' }}>AI 教练反馈</h3>
          </div>
          {loading ? (
            <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-4 rounded w-3/4" style={{ background: '#111' }} />)}</div>
          ) : aiFeedback ? (
            <div className="space-y-5">
              {[
                { icon: Activity, color: '#00D4FF', title: '训练总结', text: aiFeedback.summary },
                { icon: TrendingUp, color: '#A855F7', title: '进步分析', text: aiFeedback.progress },
                { icon: Flame, color: '#FFB800', title: '疲劳评估', text: aiFeedback.fatigue },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: item.color }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(204,255,0,0.1)' }}>
                  <Lightbulb className="w-4 h-4" style={{ color: '#CCFF00' }} />
                </div>
                <div>
                  <h4 className="font-bold mb-2" style={{ color: '#CCFF00' }}>训练建议</h4>
                  <ul className="space-y-2">
                    {aiFeedback.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CCFF00' }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Training Notes */}
        {workout.notes && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <BookOpen className="w-5 h-5" style={{ color: '#00D4FF' }} />
              </div>
              <h3 className="text-lg font-black" style={{ color: '#00D4FF' }}>训练心得</h3>
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{workout.notes}</div>
          </div>
        )}

        {/* Detail */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5" style={{ color: '#CCFF00' }} />
            训练详情
          </h3>
          <div className="space-y-4">
            {exercises.map((ex: any, ei: number) => (
              <div key={ei} className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204,255,0,0.1)' }}>
                      <Dumbbell className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{ex.name}</h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {ex.sets.length} 组 · {ex.muscleGroup || '未知部位'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: '#CCFF00' }}>{ex.totalVolume}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>kg 总量</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {ex.sets.map((set: any, si: number) => (
                    <div key={si} className="flex justify-between items-center rounded-xl px-4 py-3" style={{ background: '#111' }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>第 {si + 1} 组</span>
                      <span className="font-semibold text-sm">{set.weight} kg × {set.reps}</span>
                      {set.isFailure && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,59,92,0.15)', color: '#FF3B5C' }}>力竭</span>}
                      <span className="text-sm" style={{ color: 'rgba(204,255,0,0.5)' }}>1RM: {(set.estimated1RM || set.weight * (1 + set.reps/30)).toFixed(1)}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <Link href="/workout" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black" style={{ background: '#CCFF00' }}>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4" style={{ border: '4px solid #CCFF00', borderTopColor: 'transparent' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...</p>
        </div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
