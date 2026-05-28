"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Dumbbell, Flame, AlertCircle, Zap, RefreshCw, Activity, Trophy } from 'lucide-react';
import { logger } from "@/lib/logger";
import { SkeletonList, SkeletonStatGrid } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PageShell, PageHeader, PageContent } from "@/components/layout";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackChecked, setFeedbackChecked] = useState(false);

  useEffect(() => { fetchWorkout(); }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/analysis/workout-feedback?workoutId=${params.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.cached && d.feedback?.coach) setAiFeedback(d.feedback.coach); })
      .catch(() => {})
      .finally(() => setFeedbackChecked(true));
  }, [params.id]);

  const generateFeedback = async () => {
    if (!workout || !params.id || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      const exercises = (workout.exercises || []).map((ex: any) => ({
        name: ex.name,
        sets: (ex.sets || []).map((s: any) => ({ weight: s.weight, reps: s.reps, rir: s.rir, isFailure: s.isFailure, isWarmup: s.isWarmup }))
      }));
      const totalSets = exercises.reduce((n: number, ex: any) => n + ex.sets.length, 0);
      const maxWeight = exercises.reduce((m: number, ex: any) => ex.sets.reduce((mm: number, s: any) => Math.max(mm, s.weight || 0), m), 0);
      const r = await fetch('/api/analysis/workout-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ workoutId: params.id, workoutType: 'strength', duration: workout.duration, totalVolume: workout.totalVolume, totalSets, maxWeight, exercises }),
      });
      const data = await r.json();
      if (data.success && data.feedback?.coach) setAiFeedback(data.feedback.coach);
    } catch (e) { logger.error('feedback generate error:', e); }
    finally { setFeedbackLoading(false); }
  };

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

  if (loading) {
    return (
      <PageShell>
        <PageContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl animate-pulse bg-secondary" />
            <div className="w-40 h-5 rounded-lg animate-pulse bg-secondary" />
          </div>
          <SkeletonStatGrid cols={3} />
          <SkeletonList rows={4} />
        </PageContent>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={<AlertCircle className="w-8 h-8" />} title="加载失败" description="请检查网络后重试" action={{ label: '重新加载', onClick: fetchWorkout }} />
        </div>
      </PageShell>
    );
  }

  if (!workout) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={<Dumbbell className="w-8 h-8" />} title="训练记录不存在" description="该记录已被删除或不存在" action={{ label: '返回历史', onClick: () => router.push('/history') }} />
        </div>
      </PageShell>
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
    <PageShell>
      <PageHeader
        title="训练详情"
        onBack={() => router.back()}
        action={
          <div className="flex gap-2">
            <button onClick={() => router.push(`/workout/${params.id}/edit`)}
              className="px-3.5 py-2 rounded-xl font-semibold text-sm text-primary-foreground bg-primary transition-all active:scale-95 hover:bg-primary/90">
              <Edit className="w-4 h-4 inline mr-1" />编辑
            </button>
            <button onClick={deleteWorkout}
              className="px-3.5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-danger/10 text-danger border border-danger/30">
              <Trash2 className="w-4 h-4 inline mr-1" />删除
            </button>
          </div>
        }
      />
      <PageContent>

        {/* Summary */}
        <div className={`gap-3 mb-6 ${isFreeRecord ? 'flex' : 'grid grid-cols-2'}`}>
          {(isFreeRecord ? [
            { icon: Calendar, label: '日期', value: new Date(workout.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { icon: Clock, label: '训练时长', value: Math.round((workout.duration || 0) / 60) + ' 分钟' },
          ] : [
            { icon: Calendar, label: '日期', value: new Date(workout.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { icon: Clock, label: '训练时长', value: Math.round((workout.duration || 0) / 60) + ' 分钟' },
            { icon: Dumbbell, label: '总训练量', value: workout.totalVolume > 0 ? workout.totalVolume + 'kg' : '—' },
            { icon: Dumbbell, label: '动作数量', value: groupedExercises.length + ' 个' },
          ]).map((item, i) => (
            <div key={i} className={`rounded-xl p-4 bg-card border border-border ${isFreeRecord ? 'flex-1' : ''}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className="font-bold text-sm text-primary">{item.value}</div>
            </div>
          ))}
        </div>

        {workout.notes && (() => {
          let noteText = workout.notes;
          try { const p = JSON.parse(workout.notes); noteText = p.memo || ''; } catch {}
          return noteText ? (
            isFreeRecord ? (
              <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-sm font-bold text-primary">训练记录</div>
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">{noteText}</p>
              </div>
            ) : (
              <div className="rounded-xl p-4 mb-6 bg-card border border-border">
                <div className="text-xs mb-1 text-muted-foreground">备注</div>
                <div className="text-sm text-foreground">{noteText}</div>
              </div>
            )
          ) : null;
        })()}

        {/* Exercises */}
        {groupedExercises.map((exerciseLog: any, index: number) => (
          <div key={index} className={`rounded-2xl p-5 mb-4 bg-card border ${exerciseLog.isWarmup ? 'border-warning/35' : 'border-border'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${exerciseLog.isWarmup ? 'bg-warning/15' : 'bg-primary/10'}`}>
                {exerciseLog.isCardio
                  ? <Activity className="w-4 h-4 text-primary" />
                  : exerciseLog.isWarmup
                    ? <Flame className="w-4 h-4 text-warning" />
                    : <Dumbbell className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <h3 className={`text-base font-black ${exerciseLog.isWarmup ? 'text-warning' : 'text-primary'}`}>
                  {exerciseLog.exercise}
                </h3>
                {exerciseLog.muscleGroup && exerciseLog.muscleGroup !== 'cardio' && (
                  <span className="text-xs text-muted-foreground">{exerciseLog.muscleGroup}</span>
                )}
              </div>
            </div>

            {exerciseLog.isWarmup ? (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 bg-warning/10 border border-warning/25">
                <Flame className="w-3.5 h-3.5 text-warning" />
                <span className="text-sm text-warning">热身完成</span>
              </div>
            ) : exerciseLog.isCardio && exerciseLog.sets[0] ? (
              <div className="grid grid-cols-3 gap-2">
                {exerciseLog.sets[0].weight > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center bg-secondary">
                    <p className="text-lg font-black text-primary">{exerciseLog.sets[0].weight}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">km</p>
                  </div>
                )}
                {exerciseLog.sets[0].reps > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center bg-secondary">
                    <p className="text-lg font-black text-primary">{exerciseLog.sets[0].reps}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">bpm</p>
                  </div>
                )}
                {exerciseLog.sets[0].rir > 0 && (
                  <div className="rounded-xl px-3 py-2.5 text-center bg-secondary">
                    <p className="text-lg font-black text-primary">{exerciseLog.sets[0].rir}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">m 爬升</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left text-muted-foreground font-medium">组</th>
                      <th className="py-2 px-3 text-left text-muted-foreground font-medium">重量</th>
                      <th className="py-2 px-3 text-left text-muted-foreground font-medium">次数</th>
                      <th className="py-2 px-3 text-left text-muted-foreground font-medium">RIR</th>
                      <th className="py-2 px-3 text-left text-muted-foreground font-medium">PR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseLog.sets.map((set: any) => (
                      <tr key={set.id} className="border-b border-border">
                        <td className="py-2.5 px-3 text-muted-foreground">{set.setNumber}</td>
                        <td className="py-2.5 px-3 font-semibold">{set.weight}kg</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{set.reps}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{set.rir ?? '未记录'}</td>
                        <td className="py-2.5 px-3">
                          {set.isPR
                            ? <Trophy className="w-3.5 h-3.5 text-primary inline" />
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* AI Coach Feedback */}
        {feedbackChecked && (
          <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary">AI 教练反馈</span>
              </div>
              {aiFeedback && (
                <button onClick={generateFeedback} disabled={feedbackLoading}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground border border-border hover:bg-muted transition-colors">
                  <RefreshCw className="w-3 h-3" />重新生成
                </button>
              )}
            </div>
            {feedbackLoading ? (
              <div className="flex items-center gap-2 py-2 text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-sm">AI 分析中…</span>
              </div>
            ) : aiFeedback ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{aiFeedback}</p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">暂无 AI 反馈</span>
                <button onClick={generateFeedback}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                  <Zap className="w-3.5 h-3.5" />生成反馈
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl font-bold transition-all active:scale-95 bg-secondary border border-border text-foreground hover:bg-muted">
            返回首页
          </button>
        </div>
      </PageContent>
    </PageShell>
  );
}