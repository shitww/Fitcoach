"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Calendar, TrendingUp, Dumbbell, Clock, ChevronDown, ChevronUp, Flame } from "lucide-react";

const MUSCLE_LABEL: Record<string, string> = {
  chest: "胸部", back: "背部", legs: "腿部", shoulders: "肩部", arms: "手臂",
};

const MUSCLE_ACCENT: Record<string, string> = {
  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399", shoulders: "#FBBF24", arms: "#F87171",
};

const MUSCLE_EMOJI: Record<string, string> = {
  chest: "💪", back: "🦾", legs: "🦵", shoulders: "🏋️", arms: "💪",
};

interface SetRecord { weight: number; reps: number; setNumber: number }
interface ExerciseRecord { name: string; sets: SetRecord[] }
interface WorkoutRecord {
  id: string;
  date: string;
  duration: number | null;
  volume: number;
  exercises: ExerciseRecord[];
}
interface MuscleHistory {
  muscle: string;
  label: string;
  totalVolume: number;
  sessions: number;
  totalSets: number;
  lastTrainedAt: string | null;
  daysSinceLast: number | null;
  recentWorkouts: WorkoutRecord[];
}

export default function MuscleHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const muscle = (params?.muscle as string) || "chest";

  const [history, setHistory] = useState<MuscleHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");

  const accent = MUSCLE_ACCENT[muscle] || "var(--accent)";
  const label = MUSCLE_LABEL[muscle] || muscle;
  const emoji = MUSCLE_EMOJI[muscle] || "💪";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analysis/muscle-history?muscle=${muscle}&period=${period}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setHistory(data); })
      .finally(() => setLoading(false));
  }, [muscle, period]);

  const formatVolume = (v: number) =>
    v >= 1000000 ? (v / 1000000).toFixed(1) + "t" : v >= 1000 ? (v / 1000).toFixed(1) + "t" : v + " kg";

  const formatDaysSince = (days: number | null) => {
    if (days === null) return "本期未训练";
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    return `${days} 天前`;
  };

  const PERIODS = [
    { key: "week", label: "本周" },
    { key: "month", label: "本月" },
    { key: "3months", label: "3个月" },
    { key: "year", label: "全年" },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-10 pb-4"
        style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl transition-all active:scale-95"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-med)' }} />
          </button>
          <span className="text-xl">{emoji}</span>
          <h1 className="text-lg font-black" style={{ color: accent }}>{label} 训练历史</h1>
        </div>
      </div>

      <div className="px-4 pb-24 max-w-2xl mx-auto">
        {/* Period pills */}
        <div className="flex gap-2 mt-5 mb-5">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: period === p.key ? 'var(--accent-dim)' : 'var(--surface-2)',
                border: `1px solid ${period === p.key ? accent : 'var(--border)'}`,
                color: period === p.key ? accent : 'var(--text-low)',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: 'var(--surface)' }} />)}
            </div>
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl" style={{ background: 'var(--surface)' }} />)}
          </div>
        ) : history ? (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Calendar, label: '上次训练', value: formatDaysSince(history.daysSinceLast) },
                { icon: Flame, label: '训练次数', value: `${history.sessions} 次` },
                { icon: TrendingUp, label: '总训练量', value: formatVolume(history.totalVolume) },
              ].map(({ icon: Icon, label: l, value }) => (
                <div key={l} className="rounded-2xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: accent }} />
                  <div className="text-[11px] mb-1" style={{ color: 'var(--text-faint)' }}>{l}</div>
                  <div className="text-sm font-black" style={{ color: accent }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Total sets */}
            <div className="rounded-2xl px-4 py-3 mb-5 flex items-center justify-between"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" style={{ color: accent }} />
                <span className="text-sm" style={{ color: 'var(--text-low)' }}>总完成组数</span>
              </div>
              <span className="text-sm font-black" style={{ color: accent }}>{history.totalSets} 组</span>
            </div>

            {/* Workout list */}
            <h2 className="text-xs font-bold mb-3" style={{ color: 'var(--text-faint)' }}>
              {history.recentWorkouts.length > 0 ? `最近 ${history.recentWorkouts.length} 次训练` : '暂无训练记录'}
            </h2>

            {history.recentWorkouts.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-4xl mb-3 block">🏃</span>
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>本期还没有 {label} 的训练记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.recentWorkouts.map((w, idx) => {
                  const date = new Date(w.date);
                  const durMin = w.duration ? Math.round(w.duration / 60) : null;
                  const isOpen = expandedWorkout === w.id;
                  const isLatest = idx === 0;

                  return (
                    <div key={w.id} className="rounded-2xl overflow-hidden"
                      style={{ background: 'var(--surface)', border: `1px solid ${isLatest ? accent + '55' : 'var(--border)'}` }}>
                      <button className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all active:bg-white/5"
                        onClick={() => setExpandedWorkout(isOpen ? null : w.id)}>
                        {/* Date badge */}
                        <div className="rounded-xl px-2.5 py-2 text-center shrink-0"
                          style={{ background: isLatest ? 'var(--accent-dim)' : 'var(--surface-2)', minWidth: 50 }}>
                          <div className="text-[10px] font-bold" style={{ color: isLatest ? accent : 'var(--text-low)' }}>
                            {date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                          </div>
                          <div className="text-[10px]" style={{ color: isLatest ? accent : 'var(--text-faint)' }}>
                            {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {isLatest && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                style={{ background: 'var(--accent-dim)', color: accent }}>最近</span>
                            )}
                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                              {w.exercises.map(e => e.name).join('、')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-low)' }}>
                            <span>{formatVolume(w.volume)}</span>
                            {durMin && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{durMin} min</span>}
                            <span>{w.exercises.reduce((s, e) => s + e.sets.length, 0)} 组</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isOpen
                            ? <ChevronUp className="w-4 h-4" style={{ color: accent }} />
                            : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          {w.exercises.map(ex => (
                            <div key={ex.name} className="pt-3">
                              <div className="text-xs font-bold mb-2" style={{ color: accent }}>{ex.name}</div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {ex.sets.map((s, si) => (
                                  <div key={si} className="rounded-xl py-2 text-center"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                    <div className="text-[10px] font-bold" style={{ color: 'var(--foreground)' }}>
                                      {s.weight > 0 ? `${s.weight}kg` : '自重'}
                                    </div>
                                    <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>×{s.reps}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-sm" style={{ color: 'var(--text-faint)' }}>加载失败，请返回重试</div>
        )}
      </div>
    </div>
  );
}
