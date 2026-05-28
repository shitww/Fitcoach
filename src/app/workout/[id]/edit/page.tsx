"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { calculate1RM } from '@/core/calc';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { logger } from "@/lib/logger";
import { PageShell, PageHeader, PageContent } from "@/components/layout";

interface Set { weight: number; reps: number; rir: number | null; isPR: boolean; }
interface Exercise { id: string; name: string; muscleGroup: string; sets: Set[]; totalVolume: number; }

export default function EditWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRir, setCurrentRir] = useState('0');
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [totalVolume, setTotalVolume] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFreeRecord, setIsFreeRecord] = useState(false);

  useEffect(() => { fetchWorkout(); }, [params.id]);
  useEffect(() => { setTotalVolume(exercises.reduce((sum, e) => sum + e.totalVolume, 0)); }, [exercises]);

  const fetchWorkout = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`/api/workout?id=${params.id}`, {
        credentials: "include"
      });
      if (response.ok) {
        const body = await response.json();
        const w = body.data;
        setWorkout(w);
        setDuration(w.duration || 0);
        setNotes(w.notes || '');
        setIsFreeRecord(
          (w.exercises || []).length === 0 &&
          !!w.notes?.trim() &&
          !w.notes.trim().startsWith('{')
        );

        const mappedExercises = (w.exercises || []).map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup || '',
          sets: ex.sets.map((set: any) => ({
            weight: set.weight,
            reps: set.reps,
            rir: set.rir || 0,
            isPR: set.isPR || false,
          })),
          totalVolume: ex.sets.reduce((sum: number, s: any) => sum + s.weight * s.reps, 0),
        }));

        setExercises(mappedExercises);
      }
    } catch (error) { logger.error('获取训练详情失败:', error); }
    finally { setLoading(false); }
  };

  const addSet = () => {
    if (!currentExercise || !currentWeight || !currentReps) return;
    const weight = parseFloat(currentWeight), reps = parseInt(currentReps);
    const newSet: Set = { weight, reps, rir: parseInt(currentRir) || 0, isPR: false };
    const idx = exercises.findIndex(e => e.name === currentExercise);
    if (idx >= 0) {
      const updated = [...exercises];
      updated[idx].sets.push(newSet);
      updated[idx].totalVolume = updated[idx].sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      setExercises(updated);
    } else {
      setExercises([...exercises, { id: Date.now().toString(), name: currentExercise, muscleGroup: '', sets: [newSet], totalVolume: weight * reps }]);
    }
    setCurrentWeight(''); setCurrentReps('');
  };

  const removeSet = (ei: number, si: number) => {
    const updated = [...exercises];
    updated[ei].sets.splice(si, 1);
    updated[ei].totalVolume = updated[ei].sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    setExercises(updated);
  };

  const togglePR = (ei: number, si: number) => {
    const updated = [...exercises];
    updated[ei].sets[si].isPR = !updated[ei].sets[si].isPR;
    setExercises(updated);
  };

  const saveWorkout = async () => {
    if (!isFreeRecord && exercises.length === 0) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/workout?id=${params.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: workout.date, duration, notes,
          exercises: isFreeRecord ? [] : exercises.map(ex => ({
            name: ex.name, muscleGroup: ex.muscleGroup,
            sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, rir: s.rir, isPR: s.isPR }))
          }))
        }),
        credentials: "include"
      });
      if (response.ok) router.push(`/workout/${params.id}`);
    } catch (error) { logger.error('更新训练记录失败:', error); }
    finally { setIsSaving(false); }
  };

  if (loading) return (
    <PageShell><div className="flex-1 flex items-center justify-center"><div className="text-muted-foreground">加载中...</div></div></PageShell>
  );

  if (!workout) return (
    <PageShell><div className="flex-1 flex items-center justify-center"><div className="text-muted-foreground">训练记录不存在</div></div></PageShell>
  );

  return (
    <PageShell>
      <PageHeader
        title="编辑训练"
        onBack={() => router.back()}
        action={
          <button onClick={saveWorkout} disabled={isSaving || (!isFreeRecord && exercises.length === 0)}
            className="px-5 py-2 rounded-xl font-bold text-sm text-primary-foreground bg-primary transition-all hover:bg-primary/90 disabled:opacity-60">
            {isSaving ? '保存中…' : <><Save className="w-4 h-4 inline mr-1" />保存</>}
          </button>
        }
      />
      <PageContent>

        {/* Meta */}
        <div className="rounded-xl p-5 mb-6 bg-card border border-border">
          <div className="mb-4">
            <div className="text-xs mb-1 text-muted-foreground">训练时长（分钟）</div>
            <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-40 rounded-xl px-4 py-2.5 text-foreground bg-secondary border border-border" />
          </div>
          {!isFreeRecord && (
            <div>
              <div className="text-xs mb-1 text-muted-foreground">备注</div>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="可选备注…"
                className="w-full rounded-xl px-4 py-2.5 text-foreground text-sm bg-secondary border border-border" />
            </div>
          )}
        </div>

        {/* Free record: full-width notes textarea */}
        {isFreeRecord && (
          <div className="rounded-2xl p-5 mb-6 bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-bold text-primary">训练记录</div>
              <div className="ml-auto text-xs text-muted-foreground">{notes.length} 字</div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
              placeholder="记录今天的训练内容、感受和注意事项…"
              className="w-full rounded-xl px-4 py-3 text-base leading-relaxed outline-none resize-none bg-secondary border border-border text-foreground"
            />
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">修改后需重新生成 AI 反馈</span>
            </div>
          </div>
        )}

        {/* Add set — hidden for free records */}
        {!isFreeRecord && <div className="rounded-xl p-4 mb-6 bg-card border border-border">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-xs mb-1 text-muted-foreground">动作名称</div>
              <input type="text" value={currentExercise} onChange={(e) => setCurrentExercise(e.target.value)}
                placeholder="如 卧推"
                className="w-full rounded-xl px-4 py-2.5 text-foreground text-sm bg-secondary border border-border" />
            </div>
            <div className="w-20">
              <div className="text-xs mb-1 text-muted-foreground">重量kg</div>
              <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground bg-secondary border border-border" />
            </div>
            <div className="w-16">
              <div className="text-xs mb-1 text-muted-foreground">次数</div>
              <input type="number" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground bg-secondary border border-border" />
            </div>
            <div className="w-16">
              <div className="text-xs mb-1 text-muted-foreground">RIR</div>
              <input type="number" value={currentRir} onChange={(e) => setCurrentRir(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground bg-secondary border border-border" />
            </div>
            <button onClick={addSet} disabled={!currentExercise || !currentWeight || !currentReps}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-primary-foreground bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>}

        {/* Exercises */}
        {exercises.map((exercise, ei) => (
          <div key={exercise.id} className="rounded-2xl p-5 mb-4 bg-secondary border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-primary">{exercise.name}</h3>
              <span className="text-sm font-bold text-primary">{exercise.totalVolume}kg</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left text-muted-foreground">#</th>
                  <th className="py-2 px-2 text-left text-muted-foreground">重量</th>
                  <th className="py-2 px-2 text-left text-muted-foreground">次数</th>
                  <th className="py-2 px-2 text-left text-muted-foreground">RIR</th>
                  <th className="py-2 px-2 text-left text-muted-foreground">PR</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, si) => (
                  <tr key={si} className="border-b border-border">
                    <td className="py-2.5 px-2 text-muted-foreground">{si + 1}</td>
                    <td className="py-2.5 px-2 font-semibold">{set.weight}kg</td>
                    <td className="py-2.5 px-2">{set.reps}</td>
                    <td className="py-2.5 px-2">{set.rir ?? '未记录'}</td>
                    <td className="py-2.5 px-2">
                      <input type="checkbox" checked={set.isPR} onChange={() => togglePR(ei, si)}
                        className="w-4 h-4 rounded accent-primary" />
                    </td>
                    <td className="py-2.5 px-2">
                      <button onClick={() => removeSet(ei, si)} className="text-xs font-semibold text-danger">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Total — hidden for free records */}
        {!isFreeRecord && (
          <div className="rounded-xl p-5 mt-4 bg-secondary border border-border">
            <div className="text-sm text-muted-foreground">本次训练总量</div>
            <div className="text-2xl font-black text-primary">{totalVolume}kg</div>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}