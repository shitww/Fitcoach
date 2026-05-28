"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  User, Calendar, LogOut, ChevronRight, Loader2, Bell, Shield, Flame, Palette, Download
} from "lucide-react"
import { logger } from "@/lib/logger";
import { clearUserStorage, clearLegacyStorage } from "@/lib/user-storage";
import { useTheme } from "@/contexts/ThemeContext";
import { AmbientGlow } from "@/components/AmbientGlow";
import { isRunningStandalone, showInstallPrompt } from "@/lib/pwa-utils";
import { useToast } from "@/components/Toast";
import { METRICS, type BodyDataRecord, type MetricConfig, findRecordByLocalDay, startOfLocalDay, isSameLocalDay, formatMetricValue } from "@/lib/body-metrics";
import { IdentityCard } from "./_components/IdentityCard";
import { BodyKpiCard } from "./_components/BodyKpiCard";
import { MetricCard } from "./_components/MetricCard";
import { MetricEditorSheet } from "./_components/MetricEditorSheet";
import BottomTabBar from "@/components/BottomTabBar";

function formatTimeText(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (isSameLocalDay(d, now)) return "今天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function findLatestMetric(records: BodyDataRecord[], key: keyof BodyDataRecord): { value: number; date: string } | null {
  for (const r of records) {
    const v = r[key];
    if (v != null) {
      return { value: v as number, date: r.date };
    }
  }
  return null;
}

function computeWeightDelta(records: BodyDataRecord[]): number | null {
  const withWeight = records.filter((r) => r.weight != null);
  if (withWeight.length < 2) return null;
  const latest = withWeight[0].weight!;
  const prev = withWeight[1].weight!;
  return Math.round((latest - prev) * 10) / 10;
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [freshAvatar, setFreshAvatar] = useState<string | null>(null)

  const [records, setRecords] = useState<BodyDataRecord[]>([])
  const [bodyDataLoading, setBodyDataLoading] = useState(false)

  const [activeMetric, setActiveMetric] = useState<MetricConfig | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const user = session?.user

  const reloadBodyData = async () => {
    if (status !== "authenticated") return;
    setBodyDataLoading(true);
    try {
      const res = await fetch("/api/body-data?limit=30", { credentials: "include" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch (err) {
      logger.error("Body data reload error:", err);
      toast({ message: "身体数据加载失败", type: "error" });
    } finally {
      setBodyDataLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      reloadBodyData();
    }
  }, [status]);

  // 头像更新后，NextAuth JWT 可能需要一段时间才刷新到 session。
  // 为了避免“刷新仍显示旧头像，必须重新登录”，在个人中心额外从 DB 拉一次最新头像。
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' as any })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const a = data?.user?.avatar ?? null
        setFreshAvatar(a)
      })
      .catch(() => {
        // ignore
      })
  }, [status])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      if (user?.id) {
        clearUserStorage(user.id)
      }
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

  const todayRecord = findRecordByLocalDay(records, new Date());
  const weightInfo = findLatestMetric(records, "weight");
  const bodyFatInfo = findLatestMetric(records, "bodyFat");
  const waistInfo = findLatestMetric(records, "waist");
  const weightDelta = computeWeightDelta(records);

  const openEditor = (metric: MetricConfig) => {
    setActiveMetric(metric);
    setEditorOpen(true);
  };

  const handleSave = async (value: number) => {
    if (!activeMetric) return;
    const metricKey = activeMetric.key as keyof BodyDataRecord;
    const todayISO = startOfLocalDay(new Date()).toISOString();

    if (todayRecord?.id) {
      const res = await fetch(`/api/body-data/${todayRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [metricKey]: value }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } else {
      const res = await fetch("/api/body-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: todayISO, [metricKey]: value }),
      });
      if (!res.ok) throw new Error("POST failed");
    }
    await reloadBodyData();
  };

  const latestForMetric = (cfg: MetricConfig) => {
    const info = findLatestMetric(records, cfg.key as keyof BodyDataRecord);
    return {
      value: info?.value ?? null,
      dateText: info?.date ? formatTimeText(info.date) : null,
    };
  };

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.text }}>
      <AmbientGlow />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
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
            {/* Identity */}
            <IdentityCard
              name={user.name}
              email={user.email}
              avatar={(freshAvatar ?? user.avatar) as string | null}
            />

            {/* Body KPI */}
            <div className="mt-4">
              <BodyKpiCard
                weight={weightInfo?.value ?? null}
                weightDelta={weightDelta}
                bodyFat={bodyFatInfo?.value ?? null}
                waist={waistInfo?.value ?? null}
                updatedAtText={weightInfo?.date ? formatTimeText(weightInfo.date) : null}
                onRecordClick={() => {
                  const w = METRICS.find((m) => m.key === "weight");
                  if (w) openEditor(w);
                }}
                onTrendClick={() => toast({ message: "趋势功能即将上线", type: "info" })}
              />
            </div>

            {/* Metrics Grid */}
            <div className="mt-5">
              <div className="text-sm font-black mb-3" style={{ color: "var(--text-low)" }}>
                身体数据
              </div>
              {bodyDataLoading && records.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {METRICS.filter((m) => m.key !== "weight").map((metric) => {
                    const { value, dateText } = latestForMetric(metric);
                    return (
                      <MetricCard
                        key={metric.key}
                        label={metric.label}
                        valueText={value != null ? formatMetricValue(value, metric.unit) : "未记录"}
                        timeText={dateText ?? undefined}
                        onClick={() => openEditor(metric)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="rounded-2xl p-4 mt-6 mb-4 flex items-center gap-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
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

            {/* Install PWA */}
            {!isRunningStandalone() && (
              <div className="rounded-2xl overflow-hidden mb-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <button
                  onClick={showInstallPrompt}
                  className="w-full flex items-center gap-4 p-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: t.accentDim }}>
                    <Download className="w-5 h-5" style={{ color: t.accent }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm" style={{ color: t.text }}>添加到主屏幕</div>
                    <div className="text-xs" style={{ color: t.textMuted }}>像原生App一样快速启动</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: t.textFaint }} />
                </button>
              </div>
            )}

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

      <BottomTabBar active="profile" />

      {activeMetric && (
        <MetricEditorSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          metric={activeMetric}
          latestValue={latestForMetric(activeMetric).value}
          latestDateText={latestForMetric(activeMetric).dateText}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
