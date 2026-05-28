"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, RefreshCw, ShieldAlert, Zap, Salad,
  AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown,
  Clock, Activity, Dumbbell, Calendar, Heart, Flame,
} from 'lucide-react';
import { useCachedFetch } from '@/lib/client-cache';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RiskFactor {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  triggered: boolean;
  value?: number;
}

interface HealthData {
  fatigue: {
    score: number;
    level: 'low' | 'moderate' | 'high' | 'very_high';
    acwr: number;
    acuteLoad: number;
    chronicLoad: number;
    monotony: number;
    strain: number;
    daysSinceLastWorkout: number;
    recommendation: string;
  };
  injuryRisk: {
    score: number;
    level: 'low' | 'moderate' | 'high' | 'critical';
    factors: RiskFactor[];
    triggeredFactors: RiskFactor[];
    recommendation: string;
  };
  nutrition: {
    avgDailyCalories: number;
    estimatedTDEE: number;
    calorieBalance: number;
    proteinAdequacy: number;
    carbAdequacy: number;
    fatAdequacy: number;
    macroBalance: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    suggestions: string[];
  };
  generatedAt: string;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────

const FATIGUE_COLOR: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  very_high: '#ef4444',
};

const RISK_COLOR: Record<string, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const MACRO_COLOR: Record<string, string> = {
  excellent: '#22c55e',
  good: '#84cc16',
  fair: '#eab308',
  poor: '#ef4444',
};

const CN_LEVEL: Record<string, string> = {
  low: '良好', moderate: '一般', high: '偏高', very_high: '很高',
  critical: '危险', excellent: '优秀', good: '良好', fair: '一般', poor: '较差',
};

// ── SVG Arc Gauge ──────────────────────────────────────────────────────────────

function ArcGauge({ score, color, label }: { score: number; color: string; label: string }) {
  const R = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = -210;   // degrees, 0° = 3 o'clock
  const totalArc = 240;      // sweep degrees

  function polar(angle: number, r = R) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(from: number, to: number) {
    const s = polar(from);
    const e = polar(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const clamped = Math.max(0, Math.min(100, score));
  const endAngle = startAngle + (clamped / 100) * totalArc;

  return (
    <svg viewBox="0 0 140 100" className="w-36 h-28 mx-auto">
      {/* Track */}
      <path
        d={arcPath(startAngle, startAngle + totalArc)}
        fill="none" stroke="#374151" strokeWidth="10" strokeLinecap="round"
      />
      {/* Fill */}
      {clamped > 0 && (
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        />
      )}
      {/* Score */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
        {clamped}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize="9">
        {label}
      </text>
    </svg>
  );
}

// ── Macro progress bar ─────────────────────────────────────────────────────────

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  const w = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-low)' }}>
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
    </div>
  );
}

// ── Risk factor chip ───────────────────────────────────────────────────────────

function FactorChip({ factor }: { factor: RiskFactor }) {
  const Icon = factor.severity === 'danger' ? AlertTriangle
    : factor.severity === 'warning' ? Info : CheckCircle;
  const colors: Record<string, string> = {
    danger: 'bg-red-900/50 border-red-700 text-red-300',
    warning: 'bg-yellow-900/40 border-yellow-700 text-yellow-300',
    info: 'bg-blue-900/40 border-blue-700 text-blue-300',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[factor.severity]}`}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{factor.name}</p>
          <p className="text-xs opacity-80 mt-0.5">{factor.description}</p>
        </div>
      </div>
    </div>
  );
}

// ── Athletic metric card ────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon, tone = 'neutral',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: 'good' | 'warn' | 'danger' | 'neutral';
}) {
  const toneCls = {
    good: 'border-green-500/20',
    warn: 'border-yellow-400/20',
    danger: 'border-red-500/20',
    neutral: 'border-border',
  }[tone];
  return (
    <div className={`rounded-2xl p-4 bg-card border ${toneCls}`}>
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-foreground">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function HealthDashboardPage() {
  const router = useRouter();
  const { status } = useSession();

  const url = status === 'authenticated' ? '/api/analysis/health-snapshot' : null;
  const { data: raw, isLoading, isStale, error, refresh } = useCachedFetch<{ data: HealthData }>(
    url,
    { credentials: 'include' }
  );
  const data = raw?.data ?? null;

  if (status === 'unauthenticated') {
    router.replace('/auth/signin');
    return null;
  }

  const fatigue = data?.fatigue;
  const injuryRisk = data?.injuryRisk;
  const nutrition = data?.nutrition;

  // ── Derived athletic metrics ──
  const frequencyLabel = fatigue
    ? fatigue.daysSinceLastWorkout === 0 ? '今日训练' : `${fatigue.daysSinceLastWorkout}天前`
    : '—';
  const volumeLabel = fatigue ? `${(fatigue.acuteLoad / 1000).toFixed(1)}t` : '—';
  const recoveryLevel = fatigue ? CN_LEVEL[fatigue.level] : '—';
  const recoveryTone: 'good' | 'warn' | 'danger' | 'neutral' = fatigue
    ? fatigue.level === 'low' ? 'good' : fatigue.level === 'moderate' ? 'warn' : 'danger'
    : 'neutral';
  const consistencyLabel = fatigue ? `${Math.max(0, Math.round((1 - Math.abs(fatigue.monotony - 1.2) / 1.2) * 100))}%` : '—';

  const fatigueColor = fatigue ? (FATIGUE_COLOR[fatigue.level] ?? '#9ca3af') : '#9ca3af';
  const riskColor = injuryRisk ? (RISK_COLOR[injuryRisk.level] ?? '#9ca3af') : '#9ca3af';
  const macroColor = nutrition ? (MACRO_COLOR[nutrition.macroBalance] ?? '#9ca3af') : '#9ca3af';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 backdrop-blur px-4 py-3 flex items-center gap-3 bg-background/80 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-lg transition-all active:scale-95 bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-base font-bold">训练状态</h1>
        <button onClick={refresh} className="p-2 rounded-lg transition-all active:scale-95 bg-secondary">
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${isStale ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-5">

        {/* ═══════ FIRST SCREEN — Hero + 4 Core Metrics ═══════ */}

        {/* Hero: composite status score */}
        <div className="rounded-2xl p-5 bg-card border border-border relative overflow-hidden">
          {isLoading && !data && <div className="absolute inset-0 bg-card animate-pulse rounded-2xl" />}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">综合状态</span>
            {(isLoading || isStale) && data && (
              <span className="text-[10px] text-muted-foreground animate-pulse">更新中…</span>
            )}
          </div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-black leading-none" style={{ color: fatigueColor }}>
              {fatigue ? fatigue.score : '—'}
            </div>
            <div className="pb-1">
              <div className="text-sm font-bold" style={{ color: fatigueColor }}>
                {fatigue ? CN_LEVEL[fatigue.level] : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground">疲劳评分 / 100</div>
            </div>
          </div>
          {fatigue && (
            <div className="mt-3 flex items-start gap-2 rounded-xl p-2.5 bg-secondary">
              <Activity className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">{fatigue.recommendation}</p>
            </div>
          )}
        </div>

        {/* 4 Athletic metric cards */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="训练频率"
            value={frequencyLabel}
            sub={fatigue ? `ACWR ${fatigue.acwr.toFixed(2)}` : undefined}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
          <MetricCard
            label="本周容量"
            value={volumeLabel}
            sub={fatigue ? `均周 ${(fatigue.chronicLoad / 1000).toFixed(1)}t` : undefined}
            icon={<Dumbbell className="w-3.5 h-3.5" />}
          />
          <MetricCard
            label="恢复状态"
            value={recoveryLevel}
            sub={fatigue ? `应激 ${Math.round(fatigue.strain / 1000)}k` : undefined}
            icon={<Heart className="w-3.5 h-3.5" />}
            tone={recoveryTone}
          />
          <MetricCard
            label="训练一致性"
            value={consistencyLabel}
            sub={fatigue ? `单调性 ${fatigue.monotony.toFixed(2)}` : undefined}
            icon={<Flame className="w-3.5 h-3.5" />}
          />
        </div>

        {/* ═══════ SCROLL DOWN — Supporting Metrics ═══════ */}

        {/* Injury Risk — compact */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4" style={{ color: riskColor }} />
            <h2 className="text-sm font-bold text-foreground">受伤风险</h2>
            {injuryRisk && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: riskColor + '22', color: riskColor }}>
                {injuryRisk.score}
              </span>
            )}
          </div>

          {injuryRisk ? (
            <>
              {injuryRisk.triggeredFactors.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {injuryRisk.triggeredFactors.slice(0, 3).map(f => (
                    <FactorChip key={f.id} factor={f} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl p-3 mb-3 bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />
                  <p className="text-sm text-green-500">所有风险因子均在安全范围内</p>
                </div>
              )}
              <div className="rounded-xl p-3 flex gap-2 bg-secondary">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                <p className="text-sm text-foreground">{injuryRisk.recommendation}</p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-8 bg-secondary rounded-xl animate-pulse" />
              <div className="h-8 bg-secondary rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {/* Nutrition — compact trend section */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Salad className="w-4 h-4" style={{ color: macroColor }} />
            <h2 className="text-sm font-bold text-foreground">营养平衡</h2>
            {nutrition && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: macroColor + '22', color: macroColor }}>
                {CN_LEVEL[nutrition.macroBalance]}
              </span>
            )}
          </div>

          {nutrition ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 rounded-xl p-3 bg-secondary">
                  <p className="text-[11px] mb-0.5 text-muted-foreground">日均热量</p>
                  <p className="text-lg font-bold text-foreground">{nutrition.avgDailyCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                </div>
                <div className="flex-1 rounded-xl p-3 bg-secondary">
                  <p className="text-[11px] mb-0.5 text-muted-foreground">热量平衡</p>
                  <div className="flex items-center gap-1">
                    {nutrition.calorieBalance >= 0
                      ? <TrendingUp className="w-4 h-4 text-orange-400" />
                      : <TrendingDown className="w-4 h-4 text-green-500" />
                    }
                    <p className={`text-lg font-bold ${nutrition.calorieBalance > 300 ? 'text-orange-400' : nutrition.calorieBalance < -500 ? 'text-red-400' : 'text-green-500'}`}>
                      {nutrition.calorieBalance >= 0 ? '+' : ''}{nutrition.calorieBalance}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <MacroBar label="蛋白质" value={nutrition.proteinAdequacy} color={nutrition.proteinAdequacy >= 80 ? '#22c55e' : nutrition.proteinAdequacy >= 60 ? '#eab308' : '#ef4444'} />
                <MacroBar label="碳水" value={nutrition.carbAdequacy} color={nutrition.carbAdequacy >= 80 ? '#22c55e' : nutrition.carbAdequacy >= 60 ? '#eab308' : '#ef4444'} />
                <MacroBar label="脂肪" value={nutrition.fatAdequacy} color={nutrition.fatAdequacy >= 80 ? '#22c55e' : nutrition.fatAdequacy >= 60 ? '#eab308' : '#ef4444'} />
              </div>
              {nutrition.issues.length > 0 && (
                <div className="space-y-2">
                  {nutrition.issues.map((issue, i) => (
                    <div key={i} className="flex gap-2 rounded-xl p-3 bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                      <p className="text-xs text-red-400">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-8 bg-secondary rounded-xl animate-pulse" />
              <div className="h-8 bg-secondary rounded-xl animate-pulse" />
              <div className="h-8 bg-secondary rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {/* Inline error */}
        {error && (
          <div className="rounded-2xl p-4 bg-red-500/10 border border-red-500/20 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-red-400 mb-2">{error.message ?? '加载失败'}</p>
            <button onClick={refresh} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">
              重试
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
