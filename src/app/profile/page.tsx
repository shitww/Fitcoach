"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import {
  User, Calendar, LogOut, ChevronRight, Loader2, Bell, Shield, Flame, Palette, Download,
  Trophy, TrendingUp, Zap, Target, Award, Dumbbell, TrendingDown, TrendingUpDown
} from "lucide-react"
import { logger } from "@/lib/logger";
import { getCached, setCached } from "@/lib/client-cache";
import { clearUserStorage, clearLegacyStorage } from "@/lib/user-storage";
import { useTheme } from "@/contexts/ThemeContext";
import { PageShell, PageHeader, PageContent } from "@/components/layout";
import { isRunningStandalone, showInstallPrompt } from "@/lib/pwa-utils";
import { useToast } from "@/components/Toast";
import { METRICS, type BodyDataRecord, type MetricConfig, findRecordByLocalDay, startOfLocalDay, isSameLocalDay } from "@/lib/body-metrics";
import { MetricEditorSheet } from "./_components/MetricEditorSheet";

const BODY_CACHE = '/api/body-data?limit=30';
const PR_CACHE = '/api/analysis/personal-records';
const WORKOUT_CACHE = '/api/workout?limit=200';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeText(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (isSameLocalDay(d, now)) return "今天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function findLatestMetric(records: BodyDataRecord[], key: keyof BodyDataRecord): { value: number; date: string } | null {
  for (const r of records) {
    const v = r[key];
    if (v != null) return { value: v as number, date: r.date };
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

/** Compute training streak from workout dates */
function computeStreak(workouts: Array<{ date: string }>): number {
  if (!workouts.length) return 0;
  const days = new Set(workouts.map(w => w.date.split('T')[0]));
  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 365; i++) {
    const ds = check.toISOString().split('T')[0];
    if (days.has(ds)) streak++;
    else if (i > 0) break;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

/** Compute level from total workout count */
function computeLevel(workoutCount: number): { level: number; title: string; next: number; progress: number } {
  const thresholds = [0, 5, 15, 30, 60, 100, 150, 220, 300, 400];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (workoutCount >= thresholds[i]) level = i + 1;
    else break;
  }
  const titles = ['新手', '入门', '进阶', '熟练', '精英', '大师', '传奇', '神话', '不朽', '封神'];
  const curr = thresholds[level - 1] ?? 0;
  const next = thresholds[level] ?? 9999;
  const progress = Math.min(100, Math.round(((workoutCount - curr) / (next - curr)) * 100));
  return { level, title: titles[level - 1] ?? '新手', next, progress };
}

/** Mini sparkline SVG from number array */
function Sparkline({ data, color = "hsl(var(--primary))", height = 40, strokeWidth = 2 }: { data: number[]; color?: string; height?: number; strokeWidth?: number }) {
  if (data.length < 2) return <div className="h-[40px] flex items-center justify-center text-[10px] text-muted-foreground">暂无趋势</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ── Components ─────────────────────────────────────────────────────────────────

function AthleteHeader({ name, email, avatar, streak, level }: {
  name?: string | null; email?: string | null; avatar?: string | null;
  streak: number; level: { level: number; title: string; progress: number };
}) {
  return (
    <div className="rounded-2xl p-5 bg-card border border-border">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black overflow-hidden shrink-0 bg-primary/10 border border-primary/20">
          {avatar ? (
            <img src={avatar} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary">{(name?.charAt(0) || 'U').toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black truncate">{name || '健身爱好者'}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Lv.{level.level} {level.title}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {streak} 天连续
            </span>
          </div>
          {email && <p className="text-xs text-muted-foreground truncate mt-1">{email}</p>}
        </div>
      </div>
      {/* Level progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>等级进度</span>
          <span>{level.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${level.progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function TrendCard({ label, value, unit, delta, data, onClick }: {
  label: string; value: string; unit: string; delta?: number | null; data: number[]; onClick?: () => void;
}) {
  const isPos = (delta ?? 0) > 0;
  const isNeg = (delta ?? 0) < 0;
  const deltaText = delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}${unit}` : null;
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl p-4 bg-card border border-border transition-colors active:scale-[0.99]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-black">{value}<span className="text-sm font-bold ml-1 text-muted-foreground">{unit}</span></div>
          {deltaText && (
            <div className="mt-0.5 flex items-center gap-1 text-xs font-bold">
              {isNeg ? <TrendingDown className="w-3.5 h-3.5 text-green-500" /> : isPos ? <TrendingUp className="w-3.5 h-3.5 text-red-400" /> : <TrendingUpDown className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className={isNeg ? 'text-green-500' : isPos ? 'text-red-400' : 'text-muted-foreground'}>{deltaText}</span>
            </div>
          )}
        </div>
        <div className="w-24">
          <Sparkline data={data} />
        </div>
      </div>
    </button>
  );
}

function AchievementBadge({ icon: Icon, label, unlocked }: { icon: React.ComponentType<{ className?: string }>; label: string; unlocked: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${unlocked ? 'bg-card border-border' : 'bg-secondary border-border opacity-40'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
        <Icon className={`w-4 h-4 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [freshAvatar, setFreshAvatar] = useState<string | null>(null)

  const [records, setRecords] = useState<BodyDataRecord[]>(
    () => getCached<{ records: BodyDataRecord[] }>(BODY_CACHE)?.records ?? []
  )
  const [prs, setPrs] = useState<Array<{ exercise: string; weight: number; reps: number; estimated1RM: number }>>(
    () => getCached<{ records: any[] }>(PR_CACHE)?.records ?? []
  )
  const [workoutCount, setWorkoutCount] = useState(0)
  const [streak, setStreak] = useState(0)

  const [activeMetric, setActiveMetric] = useState<MetricConfig | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const user = session?.user

  // Load body data
  useEffect(() => {
    if (status !== "authenticated") return;
    const cached = getCached<{ records: BodyDataRecord[] }>(BODY_CACHE);
    if (cached) {
      setRecords(cached.records ?? []);
      fetch(BODY_CACHE, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) { setCached(BODY_CACHE, d); setRecords(d.records ?? []); } })
        .catch(() => {});
    } else {
      fetch(BODY_CACHE, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) { setCached(BODY_CACHE, d); setRecords(d.records ?? []); } })
        .catch(() => {});
    }
  }, [status]);

  // Load PRs
  useEffect(() => {
    if (status !== "authenticated") return;
    const cached = getCached<{ records: any[] }>(PR_CACHE);
    if (cached) setPrs(cached.records ?? []);
    fetch(PR_CACHE, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setCached(PR_CACHE, d); setPrs(d.records ?? []); } })
      .catch(() => {});
  }, [status]);

  // Load workouts for streak & level
  useEffect(() => {
    if (status !== "authenticated") return;
    const cached = getCached<{ data: Array<{ date: string }> }>(WORKOUT_CACHE);
    const data = cached?.data ?? [];
    setWorkoutCount(data.length);
    setStreak(computeStreak(data));
    fetch(WORKOUT_CACHE, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setCached(WORKOUT_CACHE, d);
          const w = d.data ?? [];
          setWorkoutCount(w.length);
          setStreak(computeStreak(w));
        }
      })
      .catch(() => {});
  }, [status]);

  // Fresh avatar
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' as any })
      .then(r => r.ok ? r.json() : null)
      .then(d => setFreshAvatar(d?.user?.avatar ?? null))
      .catch(() => {})
  }, [status])

  const level = useMemo(() => computeLevel(workoutCount), [workoutCount]);

  const weightInfo = findLatestMetric(records, "weight");
  const bodyFatInfo = findLatestMetric(records, "bodyFat");
  const waistInfo = findLatestMetric(records, "waist");
  const weightDelta = computeWeightDelta(records);

  // Sparkline data from records (reverse chronological → chronological)
  const weightTrend = useMemo(() => {
    return records.filter(r => r.weight != null).map(r => r.weight!).reverse();
  }, [records]);
  const bodyFatTrend = useMemo(() => {
    return records.filter(r => r.bodyFat != null).map(r => r.bodyFat!).reverse();
  }, [records]);

  const openEditor = (metric: MetricConfig) => { setActiveMetric(metric); setEditorOpen(true); };

  const handleSave = async (value: number) => {
    if (!activeMetric) return;
    const metricKey = activeMetric.key as keyof BodyDataRecord;
    const todayISO = startOfLocalDay(new Date()).toISOString();
    const todayRecord = findRecordByLocalDay(records, new Date());
    try {
      if (todayRecord?.id) {
        await fetch(`/api/body-data/${todayRecord.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ [metricKey]: value }),
        });
      } else {
        await fetch("/api/body-data", {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ date: todayISO, [metricKey]: value }),
        });
      }
      const res = await fetch(BODY_CACHE, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setCached(BODY_CACHE, d); setRecords(d.records ?? []); }
    } catch (err) { logger.error("Save error:", err); toast({ message: "保存失败", type: "error" }); }
  };

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      if (user?.id) clearUserStorage(user.id)
      clearLegacyStorage()
      await fetch('/api/auth/logout', { method: 'POST', credentials: "include" })
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

  return (
    <PageShell>
      <PageHeader title="个人中心" onBack={() => router.back()} />
      <PageContent>

        {status === 'authenticated' && user ? (
          <div className="space-y-4">
            {/* ═══════ Athlete Header ═══════ */}
            <AthleteHeader
              name={user.name}
              email={user.email}
              avatar={(freshAvatar ?? user.avatar) as string | null}
              streak={streak}
              level={level}
            />

            {/* ═══════ Body Trends (trend card + sparkline) ═══════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TrendCard
                label="体重"
                value={weightInfo?.value != null ? weightInfo.value.toFixed(1) : '—'}
                unit="kg"
                delta={weightDelta}
                data={weightTrend.length >= 2 ? weightTrend : [70, 70]}
                onClick={() => { const w = METRICS.find(m => m.key === 'weight'); if (w) openEditor(w); }}
              />
              <TrendCard
                label="体脂"
                value={bodyFatInfo?.value != null ? bodyFatInfo.value.toFixed(1) : '—'}
                unit="%"
                data={bodyFatTrend.length >= 2 ? bodyFatTrend : [20, 20]}
                onClick={() => { const m = METRICS.find(m => m.key === 'bodyFat'); if (m) openEditor(m); }}
              />
            </div>

            {/* ═══════ PR Section ═══════ */}
            <div className="rounded-2xl p-4 bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">个人最佳</h2>
                </div>
                <button onClick={() => router.push('/analytics')} className="text-[11px] font-bold text-primary">
                  查看全部
                </button>
              </div>
              {prs.length > 0 ? (
                <div className="space-y-2">
                  {prs.slice(0, 3).map((pr, i) => (
                    <div key={pr.exercise} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{pr.exercise}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{pr.weight}kg × {pr.reps}次</span>
                        <span className="text-[10px] text-muted-foreground ml-1">1RM ≈ {Math.round(pr.estimated1RM)}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">完成训练后自动生成</p>
              )}
            </div>

            {/* ═══════ Achievements ═══════ */}
            <div className="rounded-2xl p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">成就</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <AchievementBadge icon={Flame} label="连续训练" unlocked={streak >= 3} />
                <AchievementBadge icon={Dumbbell} label="百次训练" unlocked={workoutCount >= 100} />
                <AchievementBadge icon={Trophy} label="突破PR" unlocked={prs.length > 0} />
                <AchievementBadge icon={Target} label="目标达成" unlocked={workoutCount >= 10} />
                <AchievementBadge icon={TrendingUp} label="持之以恒" unlocked={streak >= 7} />
                <AchievementBadge icon={Zap} label="力量爆发" unlocked={prs.some(p => p.estimated1RM >= 100)} />
                <AchievementBadge icon={Calendar} label="月度达人" unlocked={workoutCount >= 20} />
                <AchievementBadge icon={Award} label="精英会员" unlocked={level.level >= 5} />
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="rounded-2xl p-4 flex items-center gap-4 bg-card border border-border">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">页面主题</div>
                <div className="text-xs text-muted-foreground">{theme === 'dark' ? '深色模式' : '浅色模式'}</div>
              </div>
              <button onClick={toggle}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all bg-secondary border border-border">
                {['dark', 'light'].map(opt => (
                  <span key={opt}
                    className={`px-2.5 py-1 rounded-lg transition-all ${theme === opt ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    onClick={e => { e.stopPropagation(); if (theme !== opt) toggle(); }}
                  >{opt === 'dark' ? '深色' : '浅色'}</span>
                ))}
              </button>
            </div>

            {/* Menu */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border">
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-4 p-4 transition-colors border-b last:border-b-0 border-border hover:bg-secondary/50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Install PWA */}
            {!isRunningStandalone() && (
              <div className="rounded-2xl overflow-hidden bg-card border border-border">
                <button onClick={showInstallPrompt} className="w-full flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm">添加到主屏幕</div>
                    <div className="text-xs text-muted-foreground">像原生App一样快速启动</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Logout */}
            <button onClick={handleLogout} disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-colors bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
              {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              <span className="font-bold">{loggingOut ? '退出中…' : '退出登录'}</span>
            </button>

            <p className="text-center text-xs text-muted-foreground pb-4">
              XFITX v1.0.0 · AI 健身私人教练
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary border border-border">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">登录后查看个人中心</p>
            <button onClick={() => router.push('/auth/signin')}
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground">
              登录
            </button>
          </div>
        )}
      </PageContent>

      {activeMetric && (
        <MetricEditorSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          metric={activeMetric}
          latestValue={findLatestMetric(records, activeMetric.key as keyof BodyDataRecord)?.value ?? null}
          latestDateText={findLatestMetric(records, activeMetric.key as keyof BodyDataRecord)?.date ? formatTimeText(findLatestMetric(records, activeMetric.key as keyof BodyDataRecord)!.date) : null}
          onSave={handleSave}
        />
      )}
    </PageShell>
  )
}
