"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Dumbbell } from 'lucide-react';
import { logger } from "@/lib/logger";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWorkout(); }, [params.id]);

  const fetchWorkout = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`/api/workouts/${params.id}`, {
        credentials: "include"
      });
      if (response.ok) { const data = await response.json(); setWorkout(data.workout); }
    } catch (error) { logger.error('获取训练详情失败:', error); }
    finally { setLoading(false); }
  };

  const deleteWorkout = async () => {
    if (!params.id) return;
    if (confirm('确定要删除这个训练记录吗？')) {
      try {
        const response = await fetch(`/api/workouts/${params.id}`, {
          method: 'DELETE',
          credentials: "include"
        });
        if (response.ok) router.push('/');
      } catch (error) { logger.error('删除训练记录失败:', error); }
    }
  };

  const groupSetsByExercise = (sets: any[]) => {
    const groups: Record<string, any[]> = {}
    sets.forEach(set => {
      if (!groups[set.exercise]) {
        groups[set.exercise] = []
      }
      groups[set.exercise].push(set)
    })
    return Object.entries(groups).map(([exercise, sets]) => ({
      exercise,
      muscleGroup: sets[0].muscleGroup,
      sets
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>训练记录不存在</div>
      </div>
    );
  }

  const groupedExercises = groupSetsByExercise(workout.workoutSets || [])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)' }} />
      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2.5 rounded-xl" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black" style={{ color: '#CCFF00' }}>训练详情</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/workout/${params.id}/edit`)}
              className="px-4 py-2 rounded-xl font-semibold text-sm text-black transition-all"
              style={{ background: '#CCFF00' }}>
              <Edit className="w-4 h-4 inline mr-1" />编辑
            </button>
            <button onClick={deleteWorkout}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.2)' }}>
              <Trash2 className="w-4 h-4 inline mr-1" />删除
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Calendar, label: '日期', value: new Date(workout.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }), color: '#CCFF00' },
            { icon: Clock, label: '训练时长', value: (workout.duration || 0) + ' 分钟', color: '#00D4FF' },
            { icon: Dumbbell, label: '总训练量', value: workout.totalVolume + 'kg', color: '#FFB800' },
            { icon: Dumbbell, label: '动作数量', value: groupedExercises.length + ' 个', color: '#A855F7' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
              </div>
              <div className="font-bold text-sm" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {workout.notes && (
          <div className="rounded-xl p-4 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>备注</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{workout.notes}</div>
          </div>
        )}

        {/* Exercises */}
        {groupedExercises.map((exerciseLog: any, index: number) => (
          <div key={index} className="rounded-2xl p-5 mb-4" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <h3 className="text-lg font-black mb-4" style={{ color: '#CCFF00' }}>
              {exerciseLog.exercise}
              {exerciseLog.muscleGroup && <span className="text-sm font-normal ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>({exerciseLog.muscleGroup})</span>}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                    <th className="py-2 px-3 text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>组</th>
                    <th className="py-2 px-3 text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>重量</th>
                    <th className="py-2 px-3 text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>次数</th>
                    <th className="py-2 px-3 text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>RIR</th>
                    <th className="py-2 px-3 text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>PR</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseLog.sets.map((set: any) => (
                    <tr key={set.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                      <td className="py-2.5 px-3">{set.setNumber}</td>
                      <td className="py-2.5 px-3 font-semibold">{set.weight}kg</td>
                      <td className="py-2.5 px-3">{set.reps}</td>
                      <td className="py-2.5 px-3">{set.rir ?? '未记录'}</td>
                      <td className="py-2.5 px-3">{set.isPR ? <span style={{ color: '#CCFF00' }}>🏆</span> : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-center">
          <button onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl font-bold" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}