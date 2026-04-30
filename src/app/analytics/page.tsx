"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowLeft, Dumbbell, TrendingUp, Trophy, Calendar, Activity, Target, Flame } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function AnalyticsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSummary()
    } else {
      setLoading(false)
    }
  }, [status, timeRange])

  const fetchSummary = async () => {
    try {
      const [sumRes, prRes] = await Promise.all([
        fetch(`/api/analysis/summary?period=${timeRange}`, {
          credentials: "include"
        }),
        fetch('/api/analysis/personal-records', {
          credentials: "include"
        }),
      ])

      let sumData = {};
      if (sumRes.status === 401) {
        logger.warn("User not authenticated for summary");
      } else if (sumRes.ok) {
        sumData = await sumRes.json();
      } else {
        const text = await sumRes.text();
        logger.warn("Summary API warning:", text);
      }

      let prRecords: any[] = [];
      if (prRes.status === 401) {
        logger.warn("User not authenticated for personal records");
      } else if (prRes.ok) {
        const prData = await prRes.json();
        prRecords = prData.records || [];
      } else {
        const text = await prRes.text();
        logger.warn("Personal records API warning:", text);
      }

      setSummary({ ...sumData, prRecords });
    } catch (error) {
      logger.error('Analytics fetch error:', error);
      setSummary({ totalWorkouts: 0, totalVolume: 0, totalSets: 0, avgDuration: 0, prRecords: [] });
    } finally {
      setLoading(false);
    }
  }

  const strengthData = [
    { date: '1月', bench: 70, squat: 90, deadlift: 100, press: 45 },
    { date: '2月', bench: 75, squat: 95, deadlift: 108, press: 48 },
    { date: '3月', bench: 80, squat: 100, deadlift: 120, press: 52 },
    { date: '4月', bench: 85, squat: 110, deadlift: 140, press: 55 }
  ]

  const volumeData = [
    { week: 'W1', volume: 5200, sets: 35 },
    { week: 'W2', volume: 6100, sets: 42 },
    { week: 'W3', volume: 5800, sets: 38 },
    { week: 'W4', volume: 7200, sets: 48 }
  ]

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
          <button onClick={() => router.push('/auth/signin')} className="px-6 py-2.5 rounded-xl font-bold text-black"
            style={{ background: '#CCFF00' }}>登录</button>
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

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black">数据分析</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>追踪你的进步</p>
            </div>
          </div>

          {/* Time range tabs */}
          <div className="flex gap-1.5 rounded-full p-1" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            {[['week', '本周'], ['month', '本月'], ['year', '年度']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={
                  timeRange === value
                    ? { background: '#CCFF00', color: '#000' }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#0a0a0a' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Calendar, label: '训练次数', value: summary?.totalWorkouts ?? 0, color: '#CCFF00' },
              { icon: Activity, label: '训练总量', value: ((summary?.totalVolume ?? 0) / 1000).toFixed(1) + 't', color: '#00D4FF' },
              { icon: Target, label: '完成组数', value: summary?.totalSets ?? 0, color: '#A855F7' },
              { icon: Flame, label: '平均时长', value: (summary?.avgDuration ?? 0) + '分钟', color: '#FF6B35' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</span>
                </div>
                <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Strength Trend */}
          <div className="rounded-2xl p-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5" style={{ color: '#CCFF00' }} />
              <h3 className="text-lg font-bold">力量趋势 (1RM)</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="bench" stroke="#CCFF00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="squat" stroke="#00D4FF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="deadlift" stroke="#A855F7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Volume */}
          <div className="rounded-2xl p-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5" style={{ color: '#00D4FF' }} />
              <h3 className="text-lg font-bold">每周训练量</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.25)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '12px' }}
                  />
                  <Bar dataKey="volume" fill="#00D4FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PR Records */}
        <div className="rounded-2xl p-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5" style={{ color: '#FFB800' }} />
            <h3 className="text-lg font-bold">个人最佳</h3>
          </div>
          {summary?.prRecords?.length > 0 ? (
            <div className="space-y-3">
              {summary.prRecords.map((pr: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: '#111' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                    style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{pr.exercise}</div>
                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{pr.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black" style={{ color: '#CCFF00' }}>{pr.weight}kg × {pr.reps}次</div>
                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>估算 1RM: {pr.estimated1RM} kg</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
              暂无记录，开始训练后自动生成
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
