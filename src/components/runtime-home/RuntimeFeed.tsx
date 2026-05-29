'use client';
import { memo } from 'react';
import { Brain, ArrowUpRight, Minus, ArrowDownRight } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'recommendation' | 'insight' | 'fatigue' | 'recovery' | 'milestone';
  message: string;
  detail?: string;
  timestamp: string;
}

interface RuntimeFeedProps {
  items: FeedItem[];
}

const typeMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  recommendation: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'var(--rvl-active)', bg: 'var(--rvl-active-dim)' },
  insight: { icon: <Brain className="w-3.5 h-3.5" />, color: 'var(--rvl-complete)', bg: 'var(--rvl-complete-dim)' },
  fatigue: { icon: <ArrowDownRight className="w-3.5 h-3.5" />, color: 'var(--rvl-fatigue)', bg: 'var(--rvl-fatigue-dim)' },
  recovery: { icon: <Minus className="w-3.5 h-3.5" />, color: 'var(--rvl-rest)', bg: 'var(--rvl-rest-dim)' },
  milestone: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'var(--rvl-transition)', bg: 'var(--rvl-transition-dim)' },
};

const RuntimeFeed = memo(function RuntimeFeed({ items }: RuntimeFeedProps) {
  if (items.length === 0) return null;
  const recent = items.slice(0, 5);
  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-3.5 h-3.5" style={{ color: 'var(--rvl-text-faint)' }} />
        <p className="rvl-label-text">训练流</p>
      </div>
      <div className="space-y-2">
        {recent.map((item) => {
          const meta = typeMeta[item.type] ?? typeMeta.insight;
          return (
            <div key={item.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: meta.bg, border: '1px solid var(--rvl-border-subtle)' }}>
              <div className="mt-0.5 shrink-0" style={{ color: meta.color }}>{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--rvl-text-high)' }}>{item.message}</p>
                {item.detail && <p className="text-[10px] mt-0.5" style={{ color: 'var(--rvl-text-faint)' }}>{item.detail}</p>}
              </div>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--rvl-text-faint)' }}>{item.timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default RuntimeFeed;
