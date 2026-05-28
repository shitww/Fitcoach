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
import { PageShell, PageHeader, PageContent } from "@/components/layout"

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
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    )
  }

  if (!user) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">请先登录</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-8 py-3 font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90"
            >
              立即登录
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="训练目标"
        onBack={() => router.back()}
        action={
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            保存目标
          </button>
        }
      />
      <PageContent>

        {/* Weekly Progress */}
        <div className="rounded-2xl p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">本周训练进度</h2>
              <p className="text-sm mt-1 text-muted-foreground">
                {weekStart} - {weekEnd}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">
                {weeklyProgress}/{goals.weeklyWorkouts}
              </span>
              <span className="text-sm text-muted-foreground">次</span>
            </div>
          </div>
          
          <div className="w-full h-3 rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all bg-primary"
              style={{ width: `${Math.min((weeklyProgress / goals.weeklyWorkouts) * 100, 100)}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{weeklyProgress}</div>
              <div className="text-xs mt-1 text-muted-foreground">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-primary/70">
                {Math.max(0, goals.weeklyWorkouts - weeklyProgress)}
              </div>
              <div className="text-xs mt-1 text-muted-foreground">剩余</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-primary">
                {Math.round((weeklyProgress / goals.weeklyWorkouts) * 100)}%
              </div>
              <div className="text-xs mt-1 text-muted-foreground">完成率</div>
            </div>
          </div>
        </div>

        {/* Goal Settings */}
        <div className="rounded-2xl p-6 mb-6 bg-card border border-border">
          <h2 className="text-lg font-bold mb-6">设置训练目标</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/70">
                每周训练频率
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="weeklyWorkouts"
                  value={goals.weeklyWorkouts}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                  min="1"
                  max="7"
                />
                <span className="text-sm text-muted-foreground">次/周</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/70">
                每次训练时长
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="workoutDuration"
                  value={goals.workoutDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                  min="15"
                  max="180"
                />
                <span className="text-sm text-muted-foreground">分钟</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/70">
                每周训练量目标
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="weeklyVolume"
                  value={goals.weeklyVolume}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-4 text-foreground/70">
                特定动作目标
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/70">
                    目标动作
                  </label>
                  <input
                    type="text"
                    name="targetExercise"
                    value={goals.targetExercise}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                    placeholder="例如：卧推"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/70">
                    目标重量
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="targetWeight"
                      value={goals.targetWeight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                      placeholder="kg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/70">
                    目标次数
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="targetReps"
                      value={goals.targetReps}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-foreground bg-secondary border border-border"
                      placeholder="次"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tips */}
        <div className="rounded-2xl p-6 bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 flex-shrink-0 text-primary" />
            <div>
              <h3 className="font-medium text-sm text-primary">目标设置建议</h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-xs text-foreground/70">
                    每周训练3-5次是大多数人的理想频率
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-xs text-foreground/70">
                    每次训练45-90分钟效果最佳
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-xs text-foreground/70">
                    设定具体、可衡量的目标，如"每周训练4次"而不是"多训练"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-xs text-foreground/70">
                    定期回顾和调整目标，根据实际情况进行修改
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  )
}
