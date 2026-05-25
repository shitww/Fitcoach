"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  User, Mail, Calendar, LogOut, Dumbbell, Clock,
  TrendingUp, ChevronRight, Loader2, Bell, Shield, Flame, Palette
} from "lucide-react"
import { logger } from "@/lib/logger";
import { clearUserStorage, clearLegacyStorage } from "@/lib/user-storage";
import { useTheme } from "@/contexts/ThemeContext";
import { AmbientGlow } from "@/components/AmbientGlow";

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileStats, setProfileStats] = useState<any>(null)

  const user = session?.user

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/analysis/summary?period=year', {
        credentials: "include"
      })
        .then(r => {
          if (r.status === 401) {
            logger.warn("User not authenticated for profile stats");
            return null;
          } else if (r.ok) {
            return r.json();
          } else {
            return r.text().then(text => {
              logger.warn("Profile stats API warning:", text);
              return null;
            });
          }
        })
        .then(data => { if (data) setProfileStats(data); })
        .catch((error) => {
          logger.error("Profile stats fetch error:", error);
        })
    }
  }, [status])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // 清除当前用户的本地缓存数据
      if (user?.id) {
        clearUserStorage(user.id)
      }
      // 清除旧版非隔离数据
      clearLegacyStorage()

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: "include"
      })
      await signOut({ redirect: false })
      router.push('/auth/signin')
      router.refresh()
    } catch (error) {
      logger.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  const { t, theme, toggle } = useTheme()

  const menuItems = [
    { icon: User, label: '个人资料', desc: '查看和编辑个人信息', path: '/profile/edit' },
    { icon: Flame, label: '营养目标', desc: '设置每日热量和宏量目标', path: '/settings?tab=nutrition' },
    { icon: Bell, label: '通知设置', desc: '训练提醒和系统通知', path: '/settings?tab=notifications' },
    { icon: Shield, label: '账号安全', desc: '修改密码和隐私设置', path: '/settings?tab=security' },
    { icon: Calendar, label: '训练目标', desc: '设置周训练计划和目标', path: '/goals' },
  ]

  const formatVol = (v: number) => {
    if (v >= 1000) return (v / 1000).toFixed(1) + 't'
    return v + 'kg'
  }

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.text }}>

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
            <h1 className="text-xl font-black">个人中心</h1>
          </div>
        </header>

        {status === 'loading' ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : status === 'authenticated' && user ? (
          <>

            {/* User Card */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
                    boxShadow: '0 0 24px var(--accent-glow)'
                  }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: 'var(--accent)' }}>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black">{user.name || '健身爱好者'}</h2>
                  <p className="text-sm flex items-center gap-1 mt-1" style={{ color: 'var(--text-low)' }}>
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
                      已验证
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-low)', border: '1px solid var(--border)' }}>
                      初级训练者
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Flame, label: '训练天数', value: profileStats?.trainingDays ?? '—', color: 'var(--accent)' },
                { icon: Dumbbell, label: '训练次数', value: profileStats?.totalCount ?? '—', unit: '次', color: 'var(--accent)' },
                { icon: TrendingUp, label: '累计训练量', value: formatVol(profileStats?.allTotalVolume ?? 0), color: 'var(--accent)' },
                { icon: Clock, label: '累计组数', value: profileStats?.allTotalSets ?? '—', unit: '组', color: 'var(--accent)' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-xl font-black" style={{ color: stat.color }}>
                    {stat.value}{stat.unit && <span className="text-sm ml-0.5" style={{ color: 'var(--text-faint)' }}>{stat.unit}</span>}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-low)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="rounded-2xl p-4 mb-4 flex items-center gap-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.accentDim }}>
                <Palette className="w-5 h-5" style={{ color: t.accent }} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: t.text }}>页面主题</div>
                <div className="text-xs" style={{ color: t.textMuted }}>{theme === 'dark' ? '深色模式' : '浅色模式'}</div>
              </div>
              <button onClick={toggle}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                style={{ background: t.surface2, border: `1px solid ${t.border}`, color: t.text }}>
                {[
                  { id: 'dark', label: '深色' },
                  { id: 'light', label: '浅色' },
                ].map(opt => (
                  <span key={opt.id}
                    className="px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      background: theme === opt.id ? t.accent : 'transparent',
                      color: theme === opt.id ? t.accentText : t.textMuted,
                    }}
                    onClick={e => { e.stopPropagation(); if (theme !== opt.id) toggle(); }}
                  >{opt.label}</span>
                ))}
              </button>
            </div>

            {/* Menu */}
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-4 p-4 transition-colors border-b last:border-b-0"
                  style={{ borderColor: t.border }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: t.accentDim }}>
                    <item.icon className="w-5 h-5" style={{ color: t.accent }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm" style={{ color: t.text }}>{item.label}</div>
                    <div className="text-xs" style={{ color: t.textMuted }}>{item.desc}</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: t.textFaint }} />
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-colors"
              style={{ background: 'rgba(255,59,92,0.08)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.2)' }}
            >
              {loggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              <span className="font-bold">{loggingOut ? '退出中…' : '退出登录'}</span>
            </button>

            {/* Version */}
            <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
              XFITX v1.0.0 · AI 健身私人教练
            </p>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <User className="w-8 h-8" style={{ color: 'var(--text-faint)' }} />
            </div>
            <p className="mb-6" style={{ color: 'var(--text-low)' }}>登录后查看您的个人中心</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-8 py-3 font-bold rounded-xl text-black"
              style={{ background: 'var(--accent)' }}>
              立即登录
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
