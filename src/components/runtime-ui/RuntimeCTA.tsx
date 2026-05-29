'use client';
import { memo, type ReactNode } from 'react';

interface RuntimeCTAProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  accent?: string;
}

const RuntimeCTA = memo(function RuntimeCTA({
  label, onClick, icon, variant = 'primary', disabled, accent = 'var(--accent)'
}: RuntimeCTAProps) {
  const styles = {
    primary: { background: accent, color: '#000', boxShadow: '0 0 28px ' + accent + '33' },
    secondary: { background: 'var(--surface-2)', color: 'var(--text-med)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-faint)' },
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97]"
      style={{ ...styles, opacity: disabled ? 0.45 : 1 }}
    >
      {icon}
      {label}
    </button>
  );
});

export default RuntimeCTA;
