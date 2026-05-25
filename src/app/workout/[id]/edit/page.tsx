"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { calculate1RM } from '@/core/calc';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { logger } from "@/lib/logger";
import { AmbientGlow } from "@/components/AmbientGlow";

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...</div>
    </div>
  );

  if (!workout) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div style={{ color: 'rgba(255,255,255,0.3)' }}>训练记录不存在</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <AmbientGlow />
      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black" style={{ color: 'var(--accent)' }}>编辑训练</h1>
          </div>
          <button onClick={saveWorkout} disabled={isSaving || (!isFreeRecord && exercises.length === 0)}
            className="px-5 py-2 rounded-xl font-bold text-sm text-black transition-all"
            style={{ background: 'var(--accent)' }}>
            {isSaving ? '保存中…' : <><Save className="w-4 h-4 inline mr-1" />保存</>}
          </button>
        </div>

        {/* Meta */}
        <div className="rounded-xl p-5 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <div className="mb-4">
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>训练时长（分钟）</div>
            <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-40 rounded-xl px-4 py-2.5 text-foreground" style={{ background: '#111', border: '1px solid #1e1e1e' }} />
          </div>
          {!isFreeRecord && (
            <div>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>备注</div>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="可选备注…"
                className="w-full rounded-xl px-4 py-2.5 text-foreground text-sm" style={{ background: '#111', border: '1px solid #1e1e1e' }} />
            </div>
          )}
        </div>

        {/* Free record: full-width notes textarea */}
        {isFreeRecord && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: '#0a0a0a', border: '1px solid rgba(168,85,247,0.3)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📝</span>
              <div className="text-sm font-bold" style={{ color: 'rgba(168,85,247,0.9)' }}>训练记录</div>
              <div className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{notes.length} 字</div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
              placeholder="记录今天的训练内容、感受和注意事项…"
              className="w-full rounded-xl px-4 py-3 text-base leading-relaxed outline-none resize-none"
              style={{ background: '#111', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(255,255,255,0.85)', lineHeight: '1.75' }}
            />
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.6)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>修改后需重新生成 AI 反馈</span>
            </div>
          </div>
        )}

        {/* Add set — hidden for free records */}
        {!isFreeRecord && <div className="rounded-xl p-4 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>动作名称</div>
              <input type="text" value={currentExercise} onChange={(e) => setCurrentExercise(e.target.value)}
                placeholder="如 卧推"
                className="w-full rounded-xl px-4 py-2.5 text-foreground text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }} />
            </div>
            <div className="w-20">
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>重量kg</div>
              <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }} />
            </div>
            <div className="w-16">
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>次数</div>
              <input type="number" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }} />
            </div>
            <div className="w-16">
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>RIR</div>
              <input type="number" value={currentRir} onChange={(e) => setCurrentRir(e.target.value)}
                placeholder="0" className="w-full rounded-xl px-4 py-2.5 text-foreground" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }} />
            </div>
            <button onClick={addSet} disabled={!currentExercise || !currentWeight || !currentReps}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-black" style={{ background: 'var(--accent)' }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>}

        {/* Exercises */}
        {exercises.map((exercise, ei) => (
          <div key={exercise.id} className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black" style={{ color: 'var(--accent)' }}>{exercise.name}</h3>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{exercise.totalVolume}kg</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <th className="py-2 px-2 text-left" style={{ color: 'var(--text-secondary)' }}>#</th>
                  <th className="py-2 px-2 text-left" style={{ color: 'var(--text-secondary)' }}>重量</th>
                  <th className="py-2 px-2 text-left" style={{ color: 'var(--text-secondary)' }}>次数</th>
                  <th className="py-2 px-2 text-left" style={{ color: 'var(--text-secondary)' }}>RIR</th>
                  <th className="py-2 px-2 text-left" style={{ color: 'var(--text-secondary)' }}>PR</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, si) => (
                  <tr key={si} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td className="py-2.5 px-2" style={{ color: 'var(--text-secondary)' }}>{si + 1}</td>
                    <td className="py-2.5 px-2 font-semibold">{set.weight}kg</td>
                    <td className="py-2.5 px-2">{set.reps}</td>
                    <td className="py-2.5 px-2">{set.rir ?? '未记录'}</td>
                    <td className="py-2.5 px-2">
                      <input type="checkbox" checked={set.isPR} onChange={() => togglePR(ei, si)}
                        className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
                    </td>
                    <td className="py-2.5 px-2">
                      <button onClick={() => removeSet(ei, si)} className="text-xs font-semibold" style={{ color: 'var(--text-error)' }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Total — hidden for free records */}
        {!isFreeRecord && (
          <div className="rounded-xl p-5 mt-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-dim)' }}>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>本次训练总量</div>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{totalVolume}kg</div>
          </div>
        )}
      </div>
    </div>
  );
}