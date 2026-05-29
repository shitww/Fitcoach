'use client';
import { memo } from 'react';
import { Trophy, Flame, Star } from 'lucide-react';

interface Milestone {
  type: 'streak' | 'volume' | 'consistency' | 'pr';
  value: string;
  label: string;
}

interface MilestoneStripProps {
  milestones: Milestone[];
}

const iconMap: Record<string, React.ReactNode> = {
  streak: <Flame className="w-4 h-4" style={{ color: '#FBBF24' }} />,
  volume: <Trophy className="w-4 h-4" style={{ color: '#34D399' }} />,
  consistency: <Star className="w-4 h-4" style={{ color: '#A855F7' }} />,
  pr: <Trophy className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
};

const MilestoneStrip = memo(function MilestoneStrip({ milestones }: MilestoneStripProps) {
  if (milestones.length === 0) return null;
  return (
    <div className="px-5 pb-4">
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-faint)' }}>里程碑</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        {milestones.map((m, i) => (
          <div key={i} className="flex-shrink-0 rounded-2xl p-3 min-w-[96px] text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-center mb-1">{iconMap[m.type]}</div>
            <p className="text-sm font-black">{m.value}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-faint)' }}>{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export default MilestoneStrip;
