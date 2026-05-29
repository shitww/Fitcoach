'use client';
import { memo } from 'react';
import { Dumbbell, Calendar, Settings } from 'lucide-react';

interface AdaptiveCTAProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryActions?: { label: string; icon: 'plan' | 'settings'; onClick: () => void }[];
}

const iconMap = {
  plan: <Calendar className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

const AdaptiveCTA = memo(function AdaptiveCTA({ primaryLabel, onPrimary, secondaryActions }: AdaptiveCTAProps) {
  return (
    <div className="px-5 pb-6 space-y-2">
      <button
        onClick={onPrimary}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97]"
        style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 28px var(--accent-dim)' }}
      >
        <Dumbbell className="w-5 h-5" />
        {primaryLabel}
      </button>
      {secondaryActions && (
        <div className="flex gap-2">
          {secondaryActions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.97]"
              style={{ background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' }}
            >
              {iconMap[a.icon]}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default AdaptiveCTA;
