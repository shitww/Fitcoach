"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Dumbbell, Calendar, Clock, TrendingUp, Trash2 } from 'lucide-react'
import { logger } from "@/lib/logger";

export default function HistoryPage() {
  const router = useRouter()
  const { status } = useSession()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkouts()
    } else {
      setLoading(false)
    }
  }, [status])

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workout?limit=50', {
        credentials: "include"
      })
      if (res.status === 401) {
        logger.warn("User not authenticated");
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json()
        setWorkouts(data.data || [])
      }
    } catch (error) {
      logger.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条训练记录？')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
        credentials: "include"
      })
      if (res.ok) {
        setWorkouts(workouts.filter(w => w.id !== id))
      }
    } catch (error) {
      logger.error('Delete error:', error)
    } finally {
      setDeleting(null)
    }
  }

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

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"><svg width="44" height="44" viewBox="0 0 70 44" fill="none">
              <text x="0" y="36" fontFamily="'Space Grotesk', sans-serif" fontSize="36" fontWeight="900" fill="#000">
                <tspan>X</tspan><tspan fontWeight="800" fontSize="30">FIT</tspan><tspan>X</tspan>
              </text>
            </svg></div>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>请先登录</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-2.5 rounded-xl font-bold text-black"
            style={{ background: '#CCFF00' }}>
            登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: '#111', border: '1px solid #1e1e1e' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">训练历史</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{workouts.length} 条记录</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: '#0a0a0a' }} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
              <Dumbbell className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p className="mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>还没有训练记录</p>
            <button
              onClick={() => router.push('/workout')}
              className="px-6 py-2.5 rounded-xl font-bold text-black"
              style={{ background: '#CCFF00' }}>
              开始训练
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map(workout => {
              const groupedExercises = groupSetsByExercise(workout.workoutSets || [])
              return (
                <div key={workout.id} className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(204,255,0,0.1)' }}>
                        <Calendar className="w-5 h-5" style={{ color: '#CCFF00' }} />
                      </div>
                      <div>
                        <div className="font-bold">{new Date(workout.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div className="text-sm flex items-center gap-3 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{workout.duration || 0}分钟</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{(workout.totalVolume / 1000).toFixed(1)}吨</span>
                        </div>
                        {groupedExercises.length > 0 && groupedExercises.some((log: any) => log.muscleGroup) && (
                          <div className="text-xs mt-1 flex flex-wrap gap-1">
                            {Array.from(new Set(groupedExercises.map((log: any) => log.muscleGroup).filter(Boolean))).map((group: any, index) => (
                              <span key={index} className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                                {group}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      disabled={deleting === workout.id}
                      className="p-2 rounded-xl transition-all"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {groupedExercises.length > 0 ? (
                    <div className="space-y-2">
                      {groupedExercises.map((log: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl"
                          style={{ background: '#111' }}>
                          <Dumbbell className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{log.exercise}</div>
                            {log.muscleGroup && (
                              <div className="text-xs" style={{ color: 'rgba(204,255,0,0.6)' }}>{log.muscleGroup}</div>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{log.sets.length} 组</span>
                          <span className="text-sm font-semibold" style={{ color: '#CCFF00' }}>
                            {log.sets.reduce((sum: number, s: any) => sum + s.weight * s.reps, 0)}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>暂无动作数据</p>
                  )}

                  {workout.notes && (
                    <p className="mt-3 text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{workout.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}