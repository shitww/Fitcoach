'use client';

import { memo } from 'react';
import { Trophy, TrendingUp, Dumbbell } from 'lucide-react';

interface PRRecord {
  date: string;
  type: 'weight' | 'reps' | 'volume';
  value: string;
  exercise: string;
}

interface PRArchiveProps {
  records: PRRecord[];
}

const TYPE_ICON = {
  weight: Dumbbell,
  reps: TrendingUp,
  volume: Trophy,
};

const TYPE_COLOR = {
  weight: '#60A5FA',
  reps: '#34D399',
  volume: '#fbbf24',
};

const PRArchive = memo(function PRArchive({ records }: PRArchiveProps) {
  if (records.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Trophy className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--text-med)' }}>PR 记录</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {records.slice(0, 6).map((pr, i) => {
          const Icon = TYPE_ICON[pr.type];
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                background: `${TYPE_COLOR[pr.type]}12`,
                border: `1px solid ${TYPE_COLOR[pr.type]}20`,
              }}
            >
              <Icon className="w-3 h-3" style={{ color: TYPE_COLOR[pr.type] }} />
              <span className="text-[10px] font-bold" style={{ color: TYPE_COLOR[pr.type] }}>
                {pr.value}
              </span>
              <span className="text-[9px] font-semibold" style={{ color: 'var(--text-faint)' }}>
                {pr.exercise.split(' (')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PRArchive;
