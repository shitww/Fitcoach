"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Calendar, ChevronRight, Loader2, Save, Target,
  Dumbbell, Clock, TrendingUp, Flame, BarChart3,
  Check, X, Award
} from "lucide-react"
import { logger } from '@/lib/logger'
import { useToast } from '@/components/Toast'
import { AmbientGlow } from "@/components/AmbientGlow"

const GOALS_KEY = 'fitcoach_goals'

export default function GoalsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState({
    weeklyWorkouts: 3,
    workoutDuration: 60,
    weeklyVolume: 5000,
    targetExercise: '',
    targetWeight: '',
    targetReps: ''
  })
  const [weeklyProgress, setWeeklyProgress] = useState(0)
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')

  const user = session?.user

  // 计算本周日期范围 + 获取真实训练次数
  useEffect(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const start = new Date(today)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    setWeekStart(start.toLocaleDateString('zh-CN'))
    setWeekEnd(end.toLocaleDateString('zh-CN'))

    if (status === 'authenticated') {
      fetch('/api/workout?limit=50', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (!json) return
          const count = (json.data || []).filter((w: { date: string }) => {
            const d = new Date(w.date)
            return d >= start && d <= end
          }).length
          setWeeklyProgress(count)
        })
        .catch(err => logger.warn('本周训练次数获取失败:', err))
    }
  }, [status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGoals(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
      toast({ message: '训练目标已保存', type: 'success' })
    } catch (err) {
      logger.warn('保存失败:', err)
      toast({ message: '保存失败，请重试', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>请先登录</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-8 py-3 font-bold rounded-xl text-black"
            style={{ background: 'var(--accent)' }}
          >
            立即登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <AmbientGlow />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-xl font-black">训练目标</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all"
            style={{ 
              background: 'var(--accent)', 
              color: 'var(--accent-text)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            保存目标
          </button>
        </header>

        {/* Weekly Progress */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">本周训练进度</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {weekStart} - {weekEnd}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                {weeklyProgress}/{goals.weeklyWorkouts}
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>次</span>
            </div>
          </div>
          
          <div className="w-full h-3 rounded-full" style={{ background: 'var(--surface-2)' }}>
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-glow) 100%)',
                width: `${Math.min((weeklyProgress / goals.weeklyWorkouts) * 100, 100)}%`
              }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{weeklyProgress}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: 'var(--accent-glow)' }}>
                {Math.max(0, goals.weeklyWorkouts - weeklyProgress)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>剩余</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                {Math.round((weeklyProgress / goals.weeklyWorkouts) * 100)}%
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>完成率</div>
            </div>
          </div>
        </div>

        {/* Goal Settings */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold mb-6">设置训练目标</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                每周训练频率
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="weeklyWorkouts"
                  value={goals.weeklyWorkouts}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  min="1"
                  max="7"
                />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>次/周</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                每次训练时长
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="workoutDuration"
                  value={goals.workoutDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  min="15"
                  max="180"
                />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>分钟</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                每周训练量目标
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="weeklyVolume"
                  value={goals.weeklyVolume}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  min="0"
                />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>kg</span>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                特定动作目标
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    目标动作
                  </label>
                  <input
                    type="text"
                    name="targetExercise"
                    value={goals.targetExercise}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-foreground"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    placeholder="例如：卧推"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    目标重量
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="targetWeight"
                      value={goals.targetWeight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-foreground"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      placeholder="kg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    目标次数
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="targetReps"
                      value={goals.targetReps}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-foreground"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      placeholder="次"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tips */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <div>
              <h3 className="font-medium text-sm" style={{ color: 'var(--accent)' }}>目标设置建议</h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    每周训练3-5次是大多数人的理想频率
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    每次训练45-90分钟效果最佳
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    设定具体、可衡量的目标，如"每周训练4次"而不是"多训练"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    定期回顾和调整目标，根据实际情况进行修改
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
