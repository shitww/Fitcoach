'use client';
import React, { memo } from 'react';
import { Brain, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import type { V2SessionLog } from '@/lib/workout-runtime/v2';

interface IntelligenceFeedProps { logs: V2SessionLog[]; }

const meta: Record<string, { icon: React.ReactNode; bg: string }> = {
  increase: { icon: <TrendingUp className="w-3.5 h-3.5" style={{ color: '#34D399' }} />, bg: 'rgba(52,211,153,0.08)' },
  maintain: { icon: <Minus className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />, bg: 'rgba(251,191,36,0.08)' },
  decrease: { icon: <TrendingDown className="w-3.5 h-3.5" style={{ color: '#F87171' }} />, bg: 'rgba(248,113,113,0.08)' },
};

const IntelligenceFeed = memo(function IntelligenceFeed({ logs }: IntelligenceFeedProps) {
  if (logs.length === 0) return null;
  const recent = logs.slice(-5).reverse();
  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Brain className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>训练决策流</span>
      </div>
      {recent.map((log, i) => {
        const m = meta[log.decision.action] || meta.maintain;
        return (
          <div key={log.timestamp + i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: m.bg, border: '1px solid var(--border)', animation: 'p3-fade-up 0.3s ease-out' }}>
            {m.icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-high)' }}>{log.decision.message}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                得分 {log.score.score} · 疲劳 {log.fatigue.score.toFixed(0)}
              </p>
            </div>
          </div>
        );
      })}</div>
  );
});

export default IntelligenceFeed;
