"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, RefreshCw, ShieldAlert, Zap, Salad,
  AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown,
  Clock, Activity,
} from 'lucide-react';
import { useCachedFetch } from '@/lib/client-cache';
import { SkeletonScoreCard, SkeletonCard } from '@/components/Skeleton';

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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function HealthDashboardPage() {
  const router = useRouter();
  const { status } = useSession();

  const url = status === 'authenticated' ? '/api/analysis/health-snapshot' : null;
  const { data: raw, isLoading, error, refresh } = useCachedFetch<{ data: HealthData }>(
    url,
    { credentials: 'include' }
  );
  const data = raw?.data ?? null;

  if (status === 'unauthenticated') {
    router.replace('/auth/signin');
    return null;
  }

  // ── Loading (no cache) ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-shell bg-background text-foreground">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl animate-pulse bg-secondary" />
            <div className="w-32 h-5 rounded-lg animate-pulse bg-secondary" />
          </div>
          <SkeletonScoreCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // ── Error / empty (never had data) ───────────────────────────────────────
  if (error || !data) {
    return (
      <div className="page-shell bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm text-muted-foreground">{error?.message ?? '暂无数据，完成几次训练后再来查看。'}</p>
        <button onClick={refresh} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground">
          重试
        </button>
      </div>
    );
  }

  const { fatigue, injuryRisk, nutrition } = data;
  const fatigueColor  = FATIGUE_COLOR[fatigue.level] ?? '#9ca3af';
  const riskColor     = RISK_COLOR[injuryRisk.level] ?? '#9ca3af';
  const macroColor    = MACRO_COLOR[nutrition.macroBalance] ?? '#9ca3af';

  const calBalance = nutrition.calorieBalance;
  const calSign = calBalance >= 0 ? '+' : '';

  return (
    <div className="page-shell bg-background text-foreground pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 backdrop-blur px-4 py-3 flex items-center gap-3 bg-background/80 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-lg transition-all active:scale-95 bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-base font-semibold">健康状态</h1>
        <button onClick={refresh} className="p-2 rounded-lg transition-all active:scale-95 bg-secondary">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Overall banner ── */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">综合健康指数</span>
            <span className="text-xs flex items-center gap-1 text-muted-foreground/60">
              <Clock className="w-3 h-3" />
              {new Date(data.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-end gap-6 mt-2">
            <ArcGauge score={fatigue.score} color={fatigueColor} label="疲劳评分" />
            <div className="flex-1 space-y-3 pb-1">
              <div>
                <p className="text-xs mb-0.5 text-muted-foreground">ACWR（急慢负荷比）</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{fatigue.acwr.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">安全区 0.8-1.3</span>
                </div>
              </div>
              <div>
                <p className="text-xs mb-0.5 text-muted-foreground">距上次训练</p>
                <span className="text-xl font-bold">{fatigue.daysSinceLastWorkout}</span>
                <span className="text-xs ml-1 text-muted-foreground">天</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Fatigue ── */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <SectionTitle icon={<Zap className="w-4 h-4" style={{ color: fatigueColor }} />} title="训练疲劳" />

          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: fatigueColor + '22', color: fatigueColor, border: `1px solid ${fatigueColor}55` }}>
              {CN_LEVEL[fatigue.level]}
            </span>
            <span className="text-xs text-muted-foreground">疲劳评分 {fatigue.score} / 100</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: '7天训练量', value: `${(fatigue.acuteLoad / 1000).toFixed(1)}t` },
              { label: '均周训练量', value: `${(fatigue.chronicLoad / 1000).toFixed(1)}t` },
              { label: '训练单调性', value: fatigue.monotony.toFixed(2) },
              { label: '训练应激', value: `${Math.round(fatigue.strain / 1000)}k` },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3 bg-secondary">
                <p className="text-xs mb-0.5 text-muted-foreground">{m.label}</p>
                <p className="text-lg font-semibold">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 flex gap-2 bg-secondary">
            <Activity className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
            <p className="text-sm text-foreground">{fatigue.recommendation}</p>
          </div>
        </div>

        {/* ── Injury Risk ── */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <SectionTitle icon={<ShieldAlert className="w-4 h-4" style={{ color: riskColor }} />} title="受伤风险" />

          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="26" fill="none" style={{ stroke: 'var(--border)' }} strokeWidth="8" />
                <circle cx="32" cy="32" r="26" fill="none" stroke={riskColor} strokeWidth="8"
                  strokeDasharray={`${(injuryRisk.score / 100) * 163.4} 163.4`} strokeLinecap="round"
                  transform="rotate(-90 32 32)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {injuryRisk.score}
              </span>
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-1"
                style={{ backgroundColor: riskColor + '22', color: riskColor, border: `1px solid ${riskColor}55` }}>
                {CN_LEVEL[injuryRisk.level]}风险
              </span>
              <p className="text-xs text-muted-foreground">{injuryRisk.triggeredFactors.length} 个风险因子触发</p>
            </div>
          </div>

          {injuryRisk.triggeredFactors.length > 0 ? (
            <div className="space-y-2 mb-4">
              {injuryRisk.triggeredFactors.map(f => (
                <FactorChip key={f.id} factor={f} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl p-3 mb-4 bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />
              <p className="text-sm text-green-500">所有风险因子均在安全范围内</p>
            </div>
          )}

          <div className="rounded-xl p-3 flex gap-2 bg-secondary">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
            <p className="text-sm text-foreground">{injuryRisk.recommendation}</p>
          </div>
        </div>

        {/* ── Nutrition ── */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <SectionTitle icon={<Salad className="w-4 h-4" style={{ color: macroColor }} />} title="营养平衡" />

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 rounded-xl p-3 bg-secondary">
              <p className="text-xs mb-0.5 text-muted-foreground">日均热量</p>
              <p className="text-lg font-bold">{nutrition.avgDailyCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
            </div>
            <div className="flex-1 rounded-xl p-3 bg-secondary">
              <p className="text-xs mb-0.5 text-muted-foreground">热量缺口</p>
              <div className="flex items-center gap-1">
                {calBalance >= 0
                  ? <TrendingUp className="w-4 h-4 text-orange-400" />
                  : <TrendingDown className="w-4 h-4 text-green-500" />
                }
                <p className={`text-lg font-bold ${calBalance > 300 ? 'text-orange-400' : calBalance < -500 ? 'text-red-400' : 'text-green-500'}`}>
                  {calSign}{calBalance} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </p>
              </div>
            </div>
            <div className="flex-1 rounded-xl p-3 bg-secondary">
              <p className="text-xs mb-0.5 text-muted-foreground">估算 TDEE</p>
              <p className="text-lg font-bold">{nutrition.estimatedTDEE} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <MacroBar label="蛋白质达标率" value={nutrition.proteinAdequacy}
              color={nutrition.proteinAdequacy >= 80 ? '#22c55e' : nutrition.proteinAdequacy >= 60 ? '#eab308' : '#ef4444'} />
            <MacroBar label="碳水达标率" value={nutrition.carbAdequacy}
              color={nutrition.carbAdequacy >= 80 ? '#22c55e' : nutrition.carbAdequacy >= 60 ? '#eab308' : '#ef4444'} />
            <MacroBar label="脂肪达标率" value={nutrition.fatAdequacy}
              color={nutrition.fatAdequacy >= 80 ? '#22c55e' : nutrition.fatAdequacy >= 60 ? '#eab308' : '#ef4444'} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">宏量平衡：</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: macroColor + '22', color: macroColor, border: `1px solid ${macroColor}55` }}>
              {CN_LEVEL[nutrition.macroBalance]}
            </span>
          </div>

          {nutrition.issues.length > 0 && (
            <div className="space-y-2 mb-3">
              {nutrition.issues.map((issue, i) => (
                <div key={i} className="flex gap-2 rounded-xl p-3 bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <p className="text-xs text-red-400">{issue}</p>
                </div>
              ))}
            </div>
          )}

          {nutrition.suggestions.length > 0 && (
            <div className="space-y-2">
              {nutrition.suggestions.map((s, i) => (
                <div key={i} className="flex gap-2 rounded-xl p-3 bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                  <p className="text-xs text-blue-400">{s}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
