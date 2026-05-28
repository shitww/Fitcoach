'use client';

import { memo, useCallback } from 'react';
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

  const isActionKey = (k: string) => k === 'backspace' || k === 'clear';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-card border-t border-border shadow-[0_-8px_32px_rgba(0,0,0,0.3)] sm:max-w-md sm:left-1/2 sm:-translate-x-1/2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-bold text-muted-foreground">
          {label ?? '输入数值'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tabular-nums">{value || '0'}</span>
          <button onClick={onClose} className="p-1 text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
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
                className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center border ${
                  isActionKey(key)
                    ? 'bg-red-500/8 text-red-400 border-red-500/15'
                    : 'bg-secondary text-foreground border-border'
                }`}
                style={{ touchAction: 'manipulation' }}
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
          className="w-full h-12 rounded-xl text-sm font-black transition-all active:scale-[0.97] mt-1 bg-primary text-primary-foreground"
          style={{ touchAction: 'manipulation' }}
        >
          确认
        </button>
      </div>
    </div>
  );
});

export default NumberPad;
