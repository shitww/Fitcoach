"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Dumbbell, Activity, TrendingUp, Zap, Clock, Calendar,
  ChevronRight, Play, BarChart3, Trophy, Flame,
  Settings, Users, Target, Plus, Check, X, Layers
} from "lucide-react"
import { ProgressiveOverloadPanel } from "@/components/ai-coaching/ProgressiveOverloadPanel"
import { MuscleHeatmap } from "@/components/ai-coaching/MuscleHeatmap"
import { SmartWorkoutSuggestion } from "@/components/ai-coaching/SmartWorkoutSuggestion"
import { FatigueScore } from "@/components/ai-coaching/FatigueScore"
import { logger } from "@/lib/logger";

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return "凌晨好"
  if (hour < 9) return "早上好"
  if (hour < 12) return "上午好"
  if (hour < 14) return "中午好"
  if (hour < 18) return "下午好"
  if (hour < 22) return "晚上好"
  return "夜深了"
}

function getDayOfWeek(date: Date) {
  return date.toLocaleDateString("zh-CN", { weekday: "long" })
}

function formatVolume(vol: number) {
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + "t"
  if (vol >= 1000) return (vol / 1000).toFixed(1) + "t"
  return vol + "kg"
}

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [summary, setSummary] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clockTime, setClockTime] = useState(() => new Date())
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [creatingPlan, setCreatingPlan] = useState(false)

  // 实时时钟，每秒更新
  useEffect(() => {
    setClockTime(new Date())
    const interval = setInterval(() => setClockTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  const fetchDashboard = async () => {
    try {
      const [sumRes, recRes, wRes, plansRes] = await Promise.all([
        fetch("/api/analysis/summary?period=week", {
          credentials: "include"
        }),
        fetch("/api/analysis/personal-records", {
          credentials: "include"
        }),
        fetch("/api/workout?limit=3", {
          credentials: "include"
        }),
        fetch("/api/plans", {
          credentials: "include"
        })
      ])

      if (sumRes.status === 401) {
        logger.warn("User not authenticated for summary");
      } else if (sumRes.ok) {
        setSummary(await sumRes.json());
      } else {
        const text = await sumRes.text();
        logger.warn("Summary API warning:", text);
      }

      if (recRes.status === 401) {
        logger.warn("User not authenticated for records");
      } else if (recRes.ok) {
        const data = await recRes.json();
        setRecords((data.records || []).slice(0, 5));
      } else {
        const text = await recRes.text();
        logger.warn("Records API warning:", text);
      }

      if (wRes.status === 401) {
        logger.warn("User not authenticated for workouts");
      } else if (wRes.ok) {
        const data = await wRes.json();
        setRecentWorkouts(data.data || []);
      } else {
        const text = await wRes.text();
        logger.warn("Workouts API warning:", text);
      }

      if (plansRes.status === 401) {
        logger.warn("User not authenticated for plans");
      } else if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      } else {
        const text = await plansRes.text();
        logger.warn("Plans API warning:", text);
      }
    } catch (e) {
      logger.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  // 本周第几次训练（从1开始计数）
  const weekCount = summary?.totalWorkouts ?? 0
  const user = session?.user
  const userName = user?.name || "健身者"
  const firstName = userName.length > 0 ? userName.split(" ")[0] : "健身者"

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, Space Grotesk, sans-serif" }}>

      {/* Ambient top glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(204,255,0,0.06) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Logo Mark: XFITX 核心设计 */}
            <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="900"
                fill="#CCFF00" style={{ filter: 'drop-shadow(0 0 6px rgba(204,255,0,0.6))' }}>
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>

            {/* 分隔线 */}
            <div className="w-px h-6" style={{ background: 'rgba(204,255,0,0.2)' }} />

            {/* 品牌全称 */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '0.3em', fontFamily: "Space Grotesk, sans-serif" }}>
                XFITX
              </span>
              <span className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', fontFamily: "Space Grotesk, sans-serif" }}>
                AI FITNESS COACH
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/history")}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <Activity className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <Settings className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>
        </header>

        {/* ── Authenticated ── */}
        {status === "authenticated" && (
          <>

            {/* Greeting */}
            <div className="mb-8">
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                {clockTime.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}&nbsp;
                <span style={{ color: '#CCFF00' }}>
                  {clockTime.getHours().toString().padStart(2,'0')}:{clockTime.getMinutes().toString().padStart(2,'0')}:{clockTime.getSeconds().toString().padStart(2,'0')}
                </span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {getGreeting()}，<span style={{ color: '#CCFF00' }}>{firstName}</span> 👋
              </h1>
            </div>

            {/* Hero CTA */}
            <button
              onClick={() => router.push("/workout")}
              className="w-full mb-8 p-6 rounded-2xl transition-all group"
              style={{
                background: 'linear-gradient(135deg, #CCFF00 0%, #b3e600 100%)',
                boxShadow: '0 0 30px rgba(204,255,0,0.2), 0 8px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <Play className="w-7 h-7 text-black" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-black text-black">开始今日训练</div>
                    <div className="mt-0.5 text-sm" style={{ color: 'rgba(0,0,0,0.55)' }}>
                      {weekCount > 0 ? `本周第 ${weekCount} 次训练，继续加油！` : "开启你的第一次训练吧"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-black/40 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Fatigue Score */}
            <div className="mb-6">
              <FatigueScore />
            </div>

            {/* Progressive Overload Panel */}
            <div className="mb-8">
              <ProgressiveOverloadPanel />
            </div>

            {/* Muscle Heatmap */}
            <div className="mb-8">
              <MuscleHeatmap />
            </div>

            {/* Smart Workout Suggestion */}
            <div className="mb-8">
              <SmartWorkoutSuggestion />
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#111' }} />
                ))}
              </div>
            ) : (
              <>

                {/* Week Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Dumbbell, label: '本周训练', value: summary?.totalWorkouts ?? 0, unit: '次', color: '#CCFF00' },
                    { icon: TrendingUp, label: '训练总量', value: formatVolume(summary?.totalVolume ?? 0), unit: '', color: '#00D4FF' },
                    { icon: Zap, label: '完成组数', value: summary?.totalSets ?? 0, unit: '组', color: '#FFB800' },
                    { icon: Clock, label: '平均时长', value: summary?.avgDuration ?? 0, unit: '分钟', color: '#A855F7' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-2xl p-4" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</span>
                      </div>
                      <div className="text-2xl font-black" style={{ color: stat.color }}>
                        {stat.value}<span className="text-sm text-white/40 ml-0.5">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Workouts */}
                {recentWorkouts.length > 0 && (
                  <div className="rounded-2xl p-5 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5" style={{ color: '#FF6B35' }} />
                        <h3 className="font-bold">最近训练</h3>
                      </div>
                      <button
                        onClick={() => router.push("/history")}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: '#CCFF00' }}
                      >
                        全部记录 →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentWorkouts.map((w) => (
                        <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                          style={{ background: '#111' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(204,255,0,0.1)' }}>
                            <Calendar className="w-5 h-5" style={{ color: '#CCFF00' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {new Date(w.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                            </div>
                            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {w.exerciseLogs?.map((l: any) => l.exerciseName).join(" · ") || "训练日"}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm" style={{ color: '#CCFF00' }}>{formatVolume(w.totalVolume)}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{w.duration || 0} 分钟</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PR + Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                  {/* Personal Records */}
                  <div className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" style={{ color: '#FFB800' }} />
                        <h3 className="font-bold">个人最佳</h3>
                      </div>
                      <button
                        onClick={() => router.push("/analytics")}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: '#CCFF00' }}
                      >
                        全部 →
                      </button>
                    </div>
                    {records.length === 0 ? (
                      <p className="text-center py-6 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>暂无记录，开始训练后自动生成</p>
                    ) : (
                      <div className="space-y-2">
                        {records.map((rec, i) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                            style={{ background: '#111' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                              style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800' }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{rec.exercise}</div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{rec.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black" style={{ color: '#FFB800' }}>{rec.weight}kg × {rec.reps}次</div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>估算 1RM: {Math.round(rec.estimated1RM)} kg</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Plans */}
                  <div className="rounded-2xl p-5" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5" style={{ color: '#CCFF00' }} />
                        <h3 className="font-bold">我的计划</h3>
                      </div>
                      <button
                        onClick={() => router.push('/plans')}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: '#CCFF00' }}
                      >
                        管理 →
                      </button>
                    </div>

                    {plans.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'rgba(204,255,0,0.06)' }}>
                          <Layers className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>还没有训练计划</p>
                        <button
                          onClick={() => router.push('/plans')}
                          className="px-5 py-2 rounded-xl text-sm font-bold text-black transition-all"
                          style={{ background: '#CCFF00' }}
                        >
                          创建计划
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {plans.slice(0, 2).map((plan) => {
                          const days = plan.days || [];
                          const todayDow = new Date().getDay(); // 0=周日
                          const dayMap = [6, 0, 1, 2, 3, 4, 5]; // 周一=0, 周二=1... 周日=6
                          const todayIdx = todayDow === 0 ? 6 : todayDow - 1;
                          const todayDay = days[todayIdx];
                          return (
                            <div key={plan.id} className="rounded-xl p-3" style={{ background: '#111' }}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4" style={{ color: '#CCFF00' }} />
                                  <span className="font-semibold text-sm">{plan.name}</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                                  周{['一','二','三','四','五','六','日'][todayIdx]}训练
                                </span>
                              </div>
                              {todayDay ? (
                                <div className="mb-3">
                                  <div className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    📋 {todayDay.dayName}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {(JSON.parse(todayDay.exercises || '[]') as string[]).slice(0, 3).map((ex, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.5)' }}>
                                        {ex}
                                      </span>
                                    ))}
                                    {(JSON.parse(todayDay.exercises || '[]') as string[]).length > 3 && (
                                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                        +{(JSON.parse(todayDay.exercises || '[]') as string[]).length - 3}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => router.push(`/workout?plan=${plan.id}&day=${todayIdx}`)}
                                    className="mt-3 w-full py-2 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2"
                                    style={{ background: '#CCFF00' }}
                                  >
                                    <Play className="w-4 h-4" />
                                    今日训练
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs py-1" style={{ color: 'rgba(255,255,255,0.25)' }}>今日休息日</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Unauthenticated ── */}
        {status === "unauthenticated" && (
          <div className="text-center py-24">
            {/* Logo */}
            <svg className="mx-auto mb-6" width="140" height="80" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' }}>
              <text x="0" y="62" fontFamily="Space Grotesk, sans-serif" fontSize="56" fontWeight="900"
                fill="#CCFF00">
                <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="44">FIT</tspan><tspan fill="#CCFF00">X</tspan>
              </text>
            </svg>
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              欢迎使用 XFITX
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              智能健身训练记录与 AI 分析系统<br />记录每一次进步，助你达成目标
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <button
                onClick={() => router.push("/auth/signup")}
                className="flex-1 px-8 py-3.5 font-bold rounded-xl transition-all"
                style={{ background: '#CCFF00', color: '#000', boxShadow: '0 0 20px rgba(204,255,0,0.2)' }}
              >
                立即开始
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="flex-1 px-8 py-3.5 font-bold rounded-xl transition-all"
                style={{ background: '#111', color: '#fff', border: '1px solid #1e1e1e' }}
              >
                登录账号
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #1e1e1e'
      }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {/* Home */}
            <button className="flex flex-col items-center gap-0.5 py-2 px-4">
              <svg className="w-6 h-6" style={{ color: '#CCFF00' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span className="text-xs font-semibold" style={{ color: '#CCFF00' }}>首页</span>
            </button>
            {/* Exercises */}
            <button
              onClick={() => router.push("/exercises")}
              className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors"
            >
              <Dumbbell className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>动作库</span>
            </button>
            {/* Workout FAB */}
            <button
              onClick={() => router.push("/workout")}
              className="flex flex-col items-center gap-0.5"
              style={{ marginTop: '-24px' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: '#CCFF00',
                  boxShadow: '0 0 28px rgba(204,255,0,0.4), 0 8px 32px rgba(0,0,0,0.5)'
                }}>
                <Play className="w-6 h-6 text-black ml-0.5" />
              </div>
              <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>训练</span>
            </button>
            {/* Analytics */}
            <button
              onClick={() => router.push("/analytics")}
              className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors"
            >
              <BarChart3 className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>分析</span>
            </button>
            {/* Profile */}
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center gap-0.5 py-2 px-4 transition-colors"
            >
              <Users className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>我的</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
