"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AmbientGlow } from '@/components/AmbientGlow';
import { generatePlan, type PlanIntent } from '@/lib/planning/planningEngine';
import { PENDING_PLAN_KEY, type MuscleGroup, type CardioType, type RecoveryFocus } from '@/types/workout-plan';

// ── Config ────────────────────────────────────────────────────────────────────

const MUSCLE_OPTIONS: { key: MuscleGroup; label: string; emoji: string }[] = [
  { key: 'chest',    label: '胸部', emoji: '🫀' },
  { key: 'back',     label: '背部', emoji: '🏋️' },
  { key: 'legs',     label: '腿部', emoji: '🦵' },
  { key: 'shoulders',label: '肩部', emoji: '💪' },
  { key: 'arms',     label: '手臂', emoji: '💪' },
  { key: 'abs',      label: '腹部', emoji: '⚡' },
  { key: 'fullbody', label: '全身', emoji: '🔥' },
];

const CARDIO_OPTIONS: { key: CardioType; label: string; emoji: string; desc: string }[] = [
  { key: 'treadmill',    label: '跑步机', emoji: '🏃', desc: '速度 + 坡度 · 自动计算距离与卡路里' },
  { key: 'stairclimber', label: '爬楼机', emoji: '🧗', desc: '档位 · 高效消耗热量' },
];

const RECOVERY_OPTIONS: { key: RecoveryFocus; label: string; emoji: string; desc: string }[] = [
  { key: 'full_body',  label: '全身放松',  emoji: '🧘', desc: '全方位拉伸，适合训练后通用恢复' },
  { key: 'upper_body', label: '上肢恢复',  emoji: '🙆', desc: '肩、胸、背部拉伸，适合练完上身后' },
  { key: 'lower_body', label: '下肢恢复',  emoji: '🦵', desc: '腿部、臀部、小腿拉伸，适合腿日后' },
  { key: 'back',       label: '背部放松',  emoji: '🏃', desc: '针对腰背部放松，久坐也适合' },
  { key: 'mobility',   label: '灵活性训练', emoji: '🤸', desc: '关节活动度，改善整体运动表现' },
];

const DURATION_OPTIONS = [
  { label: '20 分钟', value: 20 },
  { label: '30 分钟', value: 30 },
  { label: '45 分钟', value: 45 },
  { label: '60 分钟', value: 60 },
];

// ── Sub-flows ─────────────────────────────────────────────────────────────────

function StrengthFlow() {
  const router = useRouter();
  const [muscle, setMuscle]   = useState<MuscleGroup | null>(null);
  const [duration, setDuration] = useState(45);
  const [loading, setLoading] = useState(false);

  const canProceed = muscle !== null;

  const handleStart = () => {
    if (!canProceed) return;
    setLoading(true);
    try {
      const intent: PlanIntent = {
        mode: 'strength',
        level: 'beginner',
        durationMin: duration,
        muscleGroup: muscle,
      };
      const plan = generatePlan(intent);
      localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(plan));
      router.push('/plan-preview');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Muscle group */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          今天练哪个部位？
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MUSCLE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMuscle(opt.key)}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.97] text-left"
              style={{
                background: muscle === opt.key ? 'var(--accent-dim)' : 'var(--surface-2)',
                border: `1px solid ${muscle === opt.key ? 'var(--accent-glow)' : 'var(--border)'}`,
              }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span
                className="font-bold text-sm"
                style={{ color: muscle === opt.key ? 'var(--accent)' : 'var(--text-high)' }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          计划训练多久？
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className="py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: duration === d.value ? 'var(--accent)' : 'var(--surface-2)',
                color: duration === d.value ? 'var(--accent-text)' : 'var(--text-med)',
                border: `1px solid ${duration === d.value ? 'var(--accent-glow)' : 'var(--border)'}`,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!canProceed || loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all"
        style={{
          background: canProceed ? 'var(--accent)' : 'var(--surface-3)',
          color: canProceed ? 'var(--accent-text)' : 'var(--text-low)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        {loading ? '生成中…' : '生成训练计划'}
      </button>
    </div>
  );
}

function CardioFlow() {
  const router = useRouter();
  const [cardioType, setCardioType] = useState<CardioType | null>(null);
  const [duration, setDuration]     = useState(30);
  const [loading, setLoading]       = useState(false);

  const canProceed = cardioType !== null;

  const handleStart = () => {
    if (!canProceed) return;
    setLoading(true);
    try {
      const intent: PlanIntent = {
        mode: 'cardio',
        level: 'beginner',
        durationMin: duration,
        cardioType,
      };
      const plan = generatePlan(intent);
      localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(plan));
      router.push('/plan-preview');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cardio type */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          选择有氧器材
        </p>
        <div className="flex flex-col gap-3">
          {CARDIO_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCardioType(opt.key)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{
                background: cardioType === opt.key ? 'rgba(96,165,250,0.12)' : 'var(--surface-2)',
                border: `1px solid ${cardioType === opt.key ? 'rgba(96,165,250,0.5)' : 'var(--border)'}`,
              }}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: cardioType === opt.key ? '#60A5FA' : 'var(--text-high)' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          计划训练多久？
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className="py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: duration === d.value ? '#60A5FA' : 'var(--surface-2)',
                color: duration === d.value ? '#000' : 'var(--text-med)',
                border: `1px solid ${duration === d.value ? 'rgba(96,165,250,0.5)' : 'var(--border)'}`,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!canProceed || loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all"
        style={{
          background: canProceed ? '#60A5FA' : 'var(--surface-3)',
          color: canProceed ? '#000' : 'var(--text-low)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        {loading ? '生成中…' : '生成有氧计划'}
      </button>
    </div>
  );
}

function RecoveryFlow() {
  const router = useRouter();
  const [focus, setFocus]       = useState<RecoveryFocus | null>(null);
  const [duration, setDuration] = useState(20);
  const [loading, setLoading]   = useState(false);

  const canProceed = focus !== null;

  const handleStart = () => {
    if (!canProceed) return;
    setLoading(true);
    try {
      const intent: PlanIntent = {
        mode: 'recovery',
        level: 'beginner',
        durationMin: duration,
        recoveryFocus: focus,
      };
      const plan = generatePlan(intent);
      localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(plan));
      router.push('/plan-preview');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Focus */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          今天重点放松哪里？
        </p>
        <div className="flex flex-col gap-3">
          {RECOVERY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFocus(opt.key)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{
                background: focus === opt.key ? 'rgba(52,211,153,0.12)' : 'var(--surface-2)',
                border: `1px solid ${focus === opt.key ? 'rgba(52,211,153,0.45)' : 'var(--border)'}`,
              }}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: focus === opt.key ? '#34D399' : 'var(--text-high)' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-low)' }}>
          计划放松多久？
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className="py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: duration === d.value ? '#34D399' : 'var(--surface-2)',
                color: duration === d.value ? '#000' : 'var(--text-med)',
                border: `1px solid ${duration === d.value ? 'rgba(52,211,153,0.45)' : 'var(--border)'}`,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!canProceed || loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all"
        style={{
          background: canProceed ? '#34D399' : 'var(--surface-3)',
          color: canProceed ? '#000' : 'var(--text-low)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        {loading ? '生成中…' : '生成恢复计划'}
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const FLOW_META: Record<
  string,
  { title: string; subtitle: string; emoji: string; accentColor: string }
> = {
  strength: {
    title: '力量训练',
    subtitle: '选择部位和时长，生成你的专属计划',
    emoji: '💪',
    accentColor: 'var(--accent)',
  },
  cardio: {
    title: '有氧训练',
    subtitle: '选择器材和时长，开始燃脂',
    emoji: '🏃',
    accentColor: '#60A5FA',
  },
  recovery: {
    title: '放松恢复',
    subtitle: '主动恢复让你训练更持久',
    emoji: '🧘',
    accentColor: '#34D399',
  },
};

export default function IntentTypePage() {
  const params = useParams();
  const router = useRouter();
  const type = typeof params.type === 'string' ? params.type : '';

  const meta = FLOW_META[type];

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <p style={{ color: 'var(--text-low)' }}>未知训练类型</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AmbientGlow />
      <div className="relative flex flex-col flex-1 px-4 pt-5 pb-10 max-w-sm md:max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/intent')}
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <h1
                className="text-xl font-black"
                style={{ color: meta.accentColor }}
              >
                {meta.title}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                {meta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Flow */}
        {type === 'strength' && <StrengthFlow />}
        {type === 'cardio'   && <CardioFlow />}
        {type === 'recovery' && <RecoveryFlow />}
      </div>
    </div>
  );
}
