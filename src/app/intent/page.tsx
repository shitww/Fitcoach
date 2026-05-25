"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { AmbientGlow } from '@/components/AmbientGlow';

const INTENT_CARDS = [
  {
    type: 'strength',
    emoji: '💪',
    title: '练肌肉',
    subtitle: '力量训练 · 组数/次数/重量',
    accentColor: 'var(--accent)',
    accentDim: 'var(--accent-dim)',
    borderColor: 'var(--accent-glow)',
    tags: ['胸部', '背部', '腿部', '肩膀', '手臂', '腹部'],
  },
  {
    type: 'cardio',
    emoji: '🏃',
    title: '做有氧',
    subtitle: '跑步机 · 爬楼机 · 自动计算消耗',
    accentColor: '#60A5FA',
    accentDim: 'rgba(96,165,250,0.10)',
    borderColor: 'rgba(96,165,250,0.25)',
    tags: ['跑步机', '爬楼机'],
  },
  {
    type: 'ai',
    emoji: '✨',
    title: 'AI 帮我选',
    subtitle: '告诉 AI 你的状态，帮你决定今天练什么',
    accentColor: '#A855F7',
    accentDim: 'rgba(168,85,247,0.10)',
    borderColor: 'rgba(168,85,247,0.25)',
    tags: ['智能推荐', '因人而异'],
  },
  {
    type: 'recovery',
    emoji: '🧘',
    title: '放松恢复',
    subtitle: '拉伸 · 泡沫轴 · 主动恢复',
    accentColor: '#34D399',
    accentDim: 'rgba(52,211,153,0.10)',
    borderColor: 'rgba(52,211,153,0.25)',
    tags: ['全身放松', '下肢恢复', '上肢恢复', '灵活性'],
  },
] as const;

type IntentType = (typeof INTENT_CARDS)[number]['type'];

export default function IntentPage() {
  const router = useRouter();

  const handleSelect = (type: IntentType) => {
    if (type === 'ai') {
      router.push('/chat');
      return;
    }
    router.push(`/intent/${type}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AmbientGlow />
      <div className="relative flex flex-col flex-1 px-4 pt-5 pb-10 max-w-sm md:max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.push('/')}
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">今天练什么？</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
              选一个方向，AI 帮你安排好其余的
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {INTENT_CARDS.map((card) => (
            <button
              key={card.type}
              onClick={() => handleSelect(card.type)}
              className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
              style={{
                background: card.accentDim,
                border: `1px solid ${card.borderColor}`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: card.accentDim }}
                >
                  {card.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black" style={{ color: card.accentColor }}>
                    {card.title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-low)' }}>
                    {card.subtitle}
                  </p>
                </div>
                <ChevronRight
                  className="w-5 h-5 shrink-0"
                  style={{ color: card.borderColor }}
                />
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: card.accentDim,
                      color: card.accentColor,
                      border: `1px solid ${card.borderColor}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
