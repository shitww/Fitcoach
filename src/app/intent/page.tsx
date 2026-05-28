"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PageShell, PageHeader, PageContent } from '@/components/layout';

type Section = 'strength' | 'cardio' | 'recovery' | null;

const MUSCLE_GROUPS = [
  { key: 'chest',     label: '胸部', emoji: '胸' },
  { key: 'back',      label: '背部', emoji: '背' },
  { key: 'shoulders', label: '肩部', emoji: '肩' },
  { key: 'arms',      label: '手臂', emoji: '臂' },
  { key: 'legs',      label: '腿部', emoji: '腿' },
  { key: 'abs',       label: '腹部', emoji: '腹' },
  { key: 'fullbody',  label: '全身', emoji: '全' },
] as const;

const CARDIO_TYPES = [
  { key: 'treadmill',    label: '跑步机', emoji: '🏃' },
  { key: 'stairclimber', label: '爬楼机', emoji: '�' },
] as const;

const RECOVERY_TYPES = [
  { key: 'full_body',  label: '全身放松' },
  { key: 'lower_body', label: '下肢恢复' },
  { key: 'upper_body', label: '上肢恢复' },
  { key: 'mobility',   label: '灵活性' },
] as const;

export default function IntentPage() {
  const router = useRouter();
  const [open, setOpen] = useState<Section>(null);

  const toggle = (s: Section) => setOpen(prev => (prev === s ? null : s));

  return (
    <PageShell>
      <PageHeader title="今天练什么？" onBack={() => router.push('/')} />
      <PageContent>

        <div className="flex flex-col gap-3">

          {/* ── 练肌肉 ──────────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)' }}>
            <button onClick={() => toggle('strength')}
              className="w-full flex items-center gap-4 p-5 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'var(--accent-dim)' }}>💪</div>
              <div className="flex-1">
                <p className="text-base font-black" style={{ color: 'rgb(var(--accent))' }}>练肌肉</p>
                <p className="text-sm" style={{ color: 'var(--text-low)' }}>力量训练 · 选部位直接开始</p>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 transition-transform duration-200"
                style={{ color: 'var(--accent-glow)', transform: open === 'strength' ? 'rotate(90deg)' : 'none' }} />
            </button>
            {open === 'strength' && (
              <div className="px-4 pb-5 pt-1 grid grid-cols-4 gap-2 border-t"
                style={{ borderColor: 'var(--accent-glow)' }}>
                {MUSCLE_GROUPS.map(g => (
                  <button key={g.key}
                    onClick={() => router.push(`/workout?mg=${g.key}`)}
                    className="rounded-2xl py-3.5 flex flex-col items-center gap-1 transition-all active:scale-95"
                    style={{ background: 'rgb(var(--accent))', color: 'var(--accent-text)' }}>
                    <span className="text-lg font-black">{g.emoji}</span>
                    <span className="text-xs font-bold">{g.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 做有氧 ──────────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(96,165,250,0.25)', background: 'rgba(96,165,250,0.07)' }}>
            <button onClick={() => toggle('cardio')}
              className="w-full flex items-center gap-4 p-5 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(96,165,250,0.1)' }}>🏃</div>
              <div className="flex-1">
                <p className="text-base font-black" style={{ color: '#60A5FA' }}>做有氧</p>
                <p className="text-sm" style={{ color: 'var(--text-low)' }}>跑步机 · 爬楼机 · 自动计算消耗</p>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 transition-transform duration-200"
                style={{ color: 'rgba(96,165,250,0.4)', transform: open === 'cardio' ? 'rotate(90deg)' : 'none' }} />
            </button>
            {open === 'cardio' && (
              <div className="px-4 pb-4 flex gap-3 border-t pt-3"
                style={{ borderColor: 'rgba(96,165,250,0.2)' }}>
                {CARDIO_TYPES.map(c => (
                  <button key={c.key}
                    onClick={() => router.push(`/workout?mode=cardio&cardioType=${c.key}`)}
                    className="flex-1 rounded-2xl py-3.5 flex flex-col items-center gap-1 active:scale-95 transition-all"
                    style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-sm font-bold">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── AI 帮我选 ──────────────────────────────────── */}
          <button onClick={() => router.push('/chat')}
            className="w-full flex items-center gap-4 p-5 rounded-3xl text-left active:scale-[0.98] transition-all"
            style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.07)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'rgba(168,85,247,0.1)' }}>✨</div>
            <div className="flex-1">
              <p className="text-base font-black" style={{ color: '#A855F7' }}>AI 帮我选</p>
              <p className="text-sm" style={{ color: 'var(--text-low)' }}>告诉 AI 你的状态，帮你决定今天练什么</p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'rgba(168,85,247,0.4)' }} />
          </button>

          {/* ── 放松恢复 ─────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.07)' }}>
            <button onClick={() => toggle('recovery')}
              className="w-full flex items-center gap-4 p-5 text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(52,211,153,0.1)' }}>🧘</div>
              <div className="flex-1">
                <p className="text-base font-black" style={{ color: '#34D399' }}>放松恢复</p>
                <p className="text-sm" style={{ color: 'var(--text-low)' }}>拉伸 · 泡沫轴 · 主动恢复</p>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 transition-transform duration-200"
                style={{ color: 'rgba(52,211,153,0.3)', transform: open === 'recovery' ? 'rotate(90deg)' : 'none' }} />
            </button>
            {open === 'recovery' && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2 border-t pt-3"
                style={{ borderColor: 'rgba(52,211,153,0.15)' }}>
                {RECOVERY_TYPES.map(r => (
                  <button key={r.key}
                    onClick={() => router.push(`/workout?mode=recovery&focus=${r.key}`)}
                    className="rounded-2xl py-3 text-sm font-bold active:scale-95 transition-all"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.15)' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </PageContent>
    </PageShell>
  );
}
