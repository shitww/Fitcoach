'use client';

import { memo } from 'react';
import { Heart } from 'lucide-react';

interface RecoveryStatusPillProps {
  status: string | null;
}

const RecoveryStatusPill = memo(function RecoveryStatusPill({ status }: RecoveryStatusPillProps) {
  if (!status) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
      style={{
        background: 'var(--surface-2)',
        color: 'var(--text-low)',
        border: '1px solid var(--border)',
      }}
    >
      <Heart className="w-3 h-3" style={{ color: 'var(--accent)' }} />
      {status}
    </div>
  );
});

export default RecoveryStatusPill;
