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
  recommendation: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  insight: { icon: <Brain className="w-3.5 h-3.5" />, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  fatigue: { icon: <ArrowDownRight className="w-3.5 h-3.5" />, color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
  recovery: { icon: <Minus className="w-3.5 h-3.5" />, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
  milestone: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
};

const RuntimeFeed = memo(function RuntimeFeed({ items }: RuntimeFeedProps) {
  if (items.length === 0) return null;
  const recent = items.slice(0, 5);
  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>训练流</p>
      </div>
      <div className="space-y-2">
        {recent.map((item) => {
          const meta = typeMeta[item.type] ?? typeMeta.insight;
          return (
            <div key={item.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: meta.bg, border: '1px solid var(--border)' }}>
              <div className="mt-0.5 shrink-0" style={{ color: meta.color }}>{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-high)' }}>{item.message}</p>
                {item.detail && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-low)' }}>{item.detail}</p>}
              </div>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--text-faint)' }}>{item.timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default RuntimeFeed;
