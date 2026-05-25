"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, Dumbbell, ChevronRight } from 'lucide-react';
import { AmbientGlow } from '@/components/AmbientGlow';
import {
  PENDING_PLAN_KEY,
  type WorkoutPlan,
  type StrengthWorkoutPlan,
  type CardioWorkoutPlan,
  type RecoveryWorkoutPlan,
} from '@/types/workout-plan';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRestSec(sec: number): string {
  if (sec >= 60) return `${Math.round(sec / 60)} 分钟`;
  return `${sec} 秒`;
}

// ── Strength preview ──────────────────────────────────────────────────────────

function StrengthPreview({ plan }: { plan: StrengthWorkoutPlan }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 self-start"
        style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
      >
        <Dumbbell className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
          {plan.muscleGroupLabel} · {plan.meta.estimatedDurationMin} 分钟
        </span>
      </div>

      {/* Exercise list */}
      {plan.exercises.map((ex, i) => {
        const firstSet = ex.sets[0];
        const setCount = ex.sets.length;
        const reps = firstSet?.reps ?? 0;
        const rest = firstSet?.restSec ?? 90;
        const isBodyweight = firstSet?.weight === 0;

        return (
          <div
            key={i}
            className="rounded-2xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Index badge */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {i + 1}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm leading-tight">
                  {ex.name.split(' (')[0]}
                </p>
                {ex.name.includes('(') && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                    {ex.name.split('(')[1]?.replace(')', '')}
                  </p>
                )}
                {ex.notes && (
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-low)' }}>
                    {ex.notes}
                  </p>
                )}
              </div>

              {/* Sets × reps chip */}
              <div
                className="shrink-0 px-3 py-1.5 rounded-xl text-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm font-black tabular-nums" style={{ color: 'var(--accent)' }}>
                  {setCount}×{reps}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                  {isBodyweight ? '自重' : '待定重量'}
                </p>
              </div>
            </div>

            {/* Rest time */}
            <div className="flex items-center gap-1.5 mt-3 ml-11">
              <Clock className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
              <span className="text-xs" style={{ color: 'var(--text-low)' }}>
                休息 {formatRestSec(rest)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cardio preview ────────────────────────────────────────────────────────────

const CARDIO_LABELS: Record<string, string> = {
  treadmill: '跑步机',
  stairclimber: '爬楼机 / 踏步机',
};

function CardioPreview({ plan }: { plan: CardioWorkoutPlan }) {
  const isTreadmill = plan.cardioType === 'treadmill';

  return (
    <div className="flex flex-col gap-3">
      {/* Type badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 self-start"
        style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.25)' }}
      >
        <span className="text-sm">{isTreadmill ? '🏃' : '🧗'}</span>
        <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>
          {CARDIO_LABELS[plan.cardioType]} · {plan.targetDurationMin} 分钟
        </span>
      </div>

      {/* Suggestion card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid rgba(96,165,250,0.20)' }}
      >
        <p className="text-sm font-bold mb-4" style={{ color: '#60A5FA' }}>建议参数</p>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'var(--surface-2)' }}
          >
            <p className="text-2xl font-black tabular-nums" style={{ color: '#60A5FA' }}>
              {plan.suggestedSpeed ?? plan.suggestedLevel}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
              {isTreadmill ? 'km/h' : '档位'}
            </p>
          </div>
          {isTreadmill && (
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'var(--surface-2)' }}
            >
              <p className="text-2xl font-black tabular-nums" style={{ color: '#60A5FA' }}>
                {plan.suggestedIncline ?? 0}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
                % 坡度
              </p>
            </div>
          )}
          <div
            className="rounded-xl px-4 py-3 text-center col-span-2"
            style={{ background: 'var(--surface-2)' }}
          >
            <p className="text-2xl font-black tabular-nums" style={{ color: '#60A5FA' }}>
              {plan.targetDurationMin}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
              目标分钟
            </p>
          </div>
        </div>

        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--text-low)' }}>
          以上参数仅供参考，进入训练后可随时调整。
        </p>
      </div>
    </div>
  );
}

// ── Recovery preview ──────────────────────────────────────────────────────────

function RecoveryPreview({ plan }: { plan: RecoveryWorkoutPlan }) {
  const totalSec = plan.steps.reduce((s, st) => s + st.durationSec, 0);
  const totalMin = Math.round(totalSec / 60);

  return (
    <div className="flex flex-col gap-3">
      {/* Badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1 self-start"
        style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        <span className="text-sm">🧘</span>
        <span className="text-xs font-bold" style={{ color: '#34D399' }}>
          {plan.focusLabel} · 约 {totalMin} 分钟
        </span>
      </div>

      {/* Steps */}
      {plan.steps.map((step, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
            style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
          >
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-sm">{step.name}</p>
              <span
                className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(52,211,153,0.10)', color: '#34D399' }}
              >
                {step.durationSec >= 60
                  ? `${Math.round(step.durationSec / 60)} 分钟`
                  : `${step.durationSec} 秒`}
              </span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-low)' }}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const MODE_META = {
  strength: {
    title: '你的训练计划',
    subtitle: '看起来合适的话，就开始吧',
    ctaLabel: '开始训练',
    ctaColor: 'var(--accent)',
    ctaText: 'var(--accent-text)',
    ctaGlow: '0 0 20px var(--accent-glow)',
    workoutMode: 'strength',
  },
  cardio: {
    title: '你的有氧计划',
    subtitle: '参数可以进入训练后再调整',
    ctaLabel: '开始训练',
    ctaColor: '#60A5FA',
    ctaText: '#000',
    ctaGlow: '0 0 20px rgba(96,165,250,0.3)',
    workoutMode: 'cardio',
  },
  recovery: {
    title: '你的恢复计划',
    subtitle: '跟着步骤来，今天好好休息',
    ctaLabel: '开始训练',
    ctaColor: '#34D399',
    ctaText: '#000',
    ctaGlow: '0 0 20px rgba(52,211,153,0.3)',
    workoutMode: 'recovery',
  },
} as const;

export default function PlanPreviewPage() {
  const router = useRouter();
  type LoadState =
    | { status: 'loading' }
    | { status: 'ready'; plan: WorkoutPlan }
    | { status: 'error' };

  const [state] = useState<LoadState>(() => {
    if (typeof window === 'undefined') return { status: 'loading' } as LoadState;
    try {
      const raw = localStorage.getItem(PENDING_PLAN_KEY);
      if (!raw) return { status: 'error' } as LoadState;
      return { status: 'ready', plan: JSON.parse(raw) as WorkoutPlan } as LoadState;
    } catch {
      return { status: 'error' } as LoadState;
    }
  });

  if (state.status === 'error') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <p style={{ color: 'var(--text-low)' }}>找不到训练计划，请重新选择</p>
        <button
          onClick={() => router.push('/intent')}
          className="px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          重新选择
        </button>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const plan = (state as { status: 'ready'; plan: WorkoutPlan }).plan;
  const mode = plan.meta.mode;
  const meta = MODE_META[mode];

  const handleStart = () => {
    router.push(`/workout?mode=${mode}`);
  };

  const handleBack = () => {
    router.push('/intent');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AmbientGlow />
      <div className="relative flex flex-col flex-1 px-4 pt-5 pb-28 max-w-sm md:max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={handleBack}
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">{meta.title}</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Mode-specific preview */}
        {mode === 'strength' && (
          <StrengthPreview plan={plan as StrengthWorkoutPlan} />
        )}
        {mode === 'cardio' && (
          <CardioPreview plan={plan as CardioWorkoutPlan} />
        )}
        {mode === 'recovery' && (
          <RecoveryPreview plan={plan as RecoveryWorkoutPlan} />
        )}
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, var(--background) 60%, transparent)' }}
      >
        <div className="max-w-sm md:max-w-md mx-auto">
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98]"
            style={{
              background: meta.ctaColor,
              color: meta.ctaText,
              boxShadow: meta.ctaGlow,
            }}
          >
            <Play className="w-5 h-5" />
            {meta.ctaLabel}
            <ChevronRight className="w-4 h-4 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
}
