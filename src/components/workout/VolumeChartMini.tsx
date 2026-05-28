'use client';

import { memo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface VolumeChartMiniProps {
  data: DataPoint[];
  maxValue?: number;
}

const VolumeChartMini = memo(function VolumeChartMini({ data, maxValue }: VolumeChartMiniProps) {
  if (data.length === 0) return null;

  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          容量趋势
        </span>
      </div>
      <div className="flex items-end gap-1 h-16 px-1">
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: '48px' }}>
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(h, 4)}%`,
                    background: i === data.length - 1 ? 'var(--accent)' : 'var(--surface-3)',
                    opacity: i === data.length - 1 ? 1 : 0.6,
                  }}
                />
              </div>
              <span className="text-[8px] font-semibold truncate w-full text-center" style={{ color: 'var(--text-faint)' }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default VolumeChartMini;
