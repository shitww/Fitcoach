'use client';

import { memo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Delete, ChevronDown } from 'lucide-react';

interface NumberPadProps {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  label?: string;
  allowDecimal?: boolean;
}

const NumberPad = memo(function NumberPad({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
  label,
  allowDecimal = true,
}: NumberPadProps) {
  const reduce = useReducedMotion();

  const handlePress = useCallback((key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === '.') {
      if (allowDecimal && !value.includes('.')) {
        onChange(value + '.');
      }
    } else if (key === 'clear') {
      onChange('');
    } else {
      onChange(value + key);
    }
  }, [value, onChange, allowDecimal]);

  if (!visible) return null;

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    allowDecimal ? ['.', '0', 'backspace'] : ['clear', '0', 'backspace'],
  ];

  return (
    <motion.div
      initial={reduce ? false : { y: '100%' }}
      animate={{ y: 0 }}
      exit={reduce ? undefined : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-[90] sm:max-w-md sm:left-1/2 sm:-translate-x-1/2"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-bold" style={{ color: 'var(--text-low)' }}>
          {label ?? '输入数值'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-high)' }}>
            {value || '0'}
          </span>
          <button onClick={onClose} className="p-1">
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          </button>
        </div>
      </div>

      {/* Keys */}
      <div className="p-3 pb-4 space-y-2">
        {keys.map((row, ri) => (
          <div key={ri} className="flex gap-2">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handlePress(key)}
                className="flex-1 h-12 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center"
                style={{
                  background: key === 'backspace' || key === 'clear'
                    ? 'rgba(239,68,68,0.08)'
                    : 'var(--surface-2)',
                  color: key === 'backspace' || key === 'clear'
                    ? '#ef4444'
                    : 'var(--text-high)',
                  border: `1px solid ${key === 'backspace' || key === 'clear'
                    ? 'rgba(239,68,68,0.15)'
                    : 'var(--border)'}`,
                  touchAction: 'manipulation',
                }}
              >
                {key === 'backspace' ? (
                  <Delete className="w-4 h-4" />
                ) : key === 'clear' ? (
                  'C'
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Confirm */}
        <button
          onClick={onConfirm}
          className="w-full h-12 rounded-xl text-sm font-black transition-all active:scale-[0.97] mt-1"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            touchAction: 'manipulation',
          }}
        >
          确认
        </button>
      </div>
    </motion.div>
  );
});

export default NumberPad;
