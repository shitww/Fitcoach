"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Dumbbell, Flame, AlertCircle, Zap } from 'lucide-react';
import { logger } from "@/lib/logger";
import { SkeletonList, SkeletonStatGrid } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { AmbientGlow } from "@/components/AmbientGlow";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  useEffect(() => { fetchWorkout(); }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/analysis/workout-feedback?workoutId=${params.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.cached && d.feedback?.coach) setAiFeedback(d.feedback.coach); })
      .catch(() => {});
  }, [params.id]);

  const fetchWorkout = async () => {
    if (!params.id) return;
    setError(false);
    try {
      const response = await fetch(`/api/workout?id=${params.id}`, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      setWorkout(body.data);
    } catch (err) {
      logger.error('获取训练详情失败:', err);
      setError(true);
    } finally { setLoading(false); }
  };

  const deleteWorkout = async () => {
    if (!params.id) return;
    if (confirm('确定要删除这个训练记录吗？')) {
      try {
        const response = await fetch(`/api/workout?id=${params.id}`, {
          method: 'DELETE',
          credentials: "include"
        });
        if (response.ok) router.push('/history');
      } catch (error) { logger.error('删除训练记录失败:', error); }
    }
  };

  const CARDIO_ICONS: Record<string, string> = { '跑步机': '🏃', '爬楼机': '🧗', '跑步': '🏃', '骑行': '🚴', '爬坡登山': '🧗' };


  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            <div className="w-40 h-5 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)' }} />
          </div>
          <SkeletonStatGrid cols={3} />
          <SkeletonList rows={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <EmptyState icon={<AlertCircle className="w-8 h-8" />} title="加载失败" description="请检查网络后重试" action={{ label: '重新加载', onClick: fetchWorkout }} />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <EmptyState icon={<Dumbbell className="w-8 h-8" />} title="训练记录不存在" description="该记录已被删除或不存在" action={{ label: '返回历史', onClick: () => router.push('/history') }} />
      </div>
    );
  }

  const groupedExercises = (workout.exercises || []).map((ex: any) => ({
    exercise: ex.name,
    muscleGroup: ex.muscleGroup,
    sets: ex.sets,
    isCardio: ex.sets.length > 0 && ex.sets.every((s: any) => s.isCardio),
    isWarmup: ex.sets.length > 0 && ex.sets.every((s: any) => s.isWarmup),
  }));
  const isFreeRecord = groupedExercises.length === 0 && !!workout.notes && !workout.notes.trim().startsWith('{');

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <AmbientGlow />
      <div className="relative max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </button>
            <h1 className="text-2xl font-black" style={{ color: 'var(--accent)' }}>训练详情</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push(`/workout/${params.id}/edit`)}
              className="px-3.5 py-2 rounded-xl font-semibold text-sm text-black transition-all active:scale-95"
              style={{ background: 'var(--accent)' }}>
              <Edit className="w-4 h-4 inline mr-1" />编辑
            </button>
            <button onClick={deleteWorkout}
              className="px-3.5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 className="w-4 h-4 inline mr-1" />删除
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className={`gap-3 mb-6 ${isFreeRecord ? 'flex' : 'grid grid-cols-2'}`}>
          {(isFreeRecord ? [
            { icon: Calendar, label: '日期', value: new Date(workout.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }), color: 'var(--accent)' },
            { icon: Clock, label: '训练时长', value: Math.round((workout.duration || 0) / 60) + ' 分钟', color: 'var(--accent-text)' },
          ] : [
            { icon: Calendar, label: '日期', value: new Date(workout.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }), color: 'var(--accent)' },
            { icon: Clock, label: '训练时长', value: Math.round((workout.duration || 0) / 60) + ' 分钟', color: 'var(--accent-text)' },
            { icon: Dumbbell, label: '总训练量', value: workout.totalVolume > 0 ? workout.totalVolume + 'kg' : '—', color: 'var(--accent)' },
            { icon: Dumbbell, label: '动作数量', value: groupedExercises.length + ' 个', color: 'var(--accent)' },
          ]).map((item, i) => (
            <div key={i} className={`rounded-xl p-4 ${isFreeRecord ? 'flex-1' : ''}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <span className="text-xs" style={{ color: 'var(--text-low)' }}>{item.label}</span>
              </div>
              <div className="font-bold text-sm" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {workout.notes && (() => {
          let noteText = workout.notes;
          try { const p = JSON.parse(workout.notes); noteText = p.memo || ''; } catch {}
          return noteText ? (
            isFreeRecord ? (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--accent-glow)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📝</span>
                  <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>训练记录</div>
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{noteText}</p>
              </div>
            ) : (
              <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-low)' }}>备注</div>
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>{noteText}</div>
              </div>
            )
          ) : null;
        })()}

        {/* Exercises */}
        {groupedExercises.map((exerciseLog: any, index: number) => (
          <div key={index} className="rounded-2xl p-5 mb-4" style={{
            background: 'var(--surface)',
            border: `1px solid ${exerciseLog.isCardio ? 'var(--accent-glow)' : exerciseLog.isWarmup ? 'rgba(251,146,60,0.35)' : 'var(--border)'}`
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{
                background: exerciseLog.isCardio ? 'var(--accent-dim)' : exerciseLog.isWarmup ? 'rgba(251,146,60,0.15)' : 'var(--accent-dim)'
              }}>
                {exerciseLog.isCardio
                  ? CARDIO_ICONS[exerciseLog.exercise] ?? '🏃'
                  : exerciseLog.isWarmup
                    ? <Flame className="w-4 h-4" style={{ color: '#FB923C' }} />
                    : <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
              </div>
              <div>
                <h3 className="text-base font-black" style={{ color: exerciseLog.isCardio ? 'var(--accent)' : exerciseLog.isWarmup ? '#FB923C' : 'var(--accent)' }}>
                  {exerciseLog.exercise}
                </h3>
                {exerciseLog.muscleGroup && exerciseLog.muscleGroup !== 'cardio' && (
                  <span className="text-xs" style={{ color: 'var(--text-low)' }}>{exerciseLog.muscleGroup}</span>
                )}
              </div>
            </div>

            {exerciseLog.isWarmup ? (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)' }}>
                <Flame className="w-3.5 h-3.5" style={{ color: '#FB923C' }} />
                <span className="text-sm" style={{ color: '#FB923C' }}>热身完成</span>
              </div>
            ) : exerciseLog.isCardio && exerciseLog.sets[0] ? (
              <div className="grid grid-cols-3 gap-2">
                {exerciseLog.sets[0].weight > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-lg font-black" style={{ color: 'var(--accent)' }}>{exerciseLog.sets[0].weight}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>km</p>
                  </div>
                )}
                {exerciseLog.sets[0].reps > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-lg font-black" style={{ color: 'var(--accent)' }}>{exerciseLog.sets[0].reps}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>bpm</p>
                  </div>
                )}
                {exerciseLog.sets[0].rir > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-lg font-black" style={{ color: 'var(--accent)' }}>{exerciseLog.sets[0].rir}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>m 爬升</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="py-2 px-3 text-left" style={{ color: 'var(--text-low)' }}>组</th>
                      <th className="py-2 px-3 text-left" style={{ color: 'var(--text-low)' }}>重量</th>
                      <th className="py-2 px-3 text-left" style={{ color: 'var(--text-low)' }}>次数</th>
                      <th className="py-2 px-3 text-left" style={{ color: 'var(--text-low)' }}>RIR</th>
                      <th className="py-2 px-3 text-left" style={{ color: 'var(--text-low)' }}>PR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseLog.sets.map((set: any) => (
                      <tr key={set.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2.5 px-3" style={{ color: 'var(--text-med)' }}>{set.setNumber}</td>
                        <td className="py-2.5 px-3 font-semibold">{set.weight}kg</td>
                        <td className="py-2.5 px-3" style={{ color: 'var(--text-med)' }}>{set.reps}</td>
                        <td className="py-2.5 px-3" style={{ color: 'var(--text-med)' }}>{set.rir ?? '未记录'}</td>
                        <td className="py-2.5 px-3">{set.isPR ? <span style={{ color: 'var(--accent)' }}>🏆</span> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* AI Coach Feedback */}
        {aiFeedback && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--accent-dim)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>AI 教练反馈</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-med)' }}>{aiFeedback}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-med)' }}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}