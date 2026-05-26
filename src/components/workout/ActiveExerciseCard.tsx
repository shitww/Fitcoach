'use client';
import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronDown, Plus, Minus, Loader2, Play, X } from 'lucide-react';
import { REST_TIME_PRESETS } from '@/lib/exercise-constants';

export interface ActiveExerciseCardProps {
  currentExercise: string;
  weight: string;
  reps: string;
  rir: string;
  isBodyweight: boolean;
  restTime: string;
  lastRecord: { weight: number; reps: number; date: string } | null;
  completedSetsCount: number;
  exerciseIndex: number;
  totalExercises: number;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onRirChange: (v: string) => void;
  onBodyweightToggle: () => void;
  onRestTimeChange: (v: string) => void;
  onLogSet: () => void;
  onChangeExercise: () => void;
  isLoading: boolean;
  hint?: string;
  isTimed?: boolean;
  isBodyweightLocked?: boolean;
  onCdActiveChange?: (active: boolean) => void;
}

const RIR_META = [
  { value: '4', label: '很轻松' },
  { value: '3', label: '轻松' },
  { value: '2', label: '适中' },
  { value: '1', label: '吃力' },
  { value: '0', label: '力竭' },
] as const;

function getRirColor(v: string): string {
  if (v === '0') return 'var(--wo-rest-urgent)';
  if (parseInt(v) <= 2) return 'var(--wo-rest-color)';
  return 'var(--wo-recovery)';
}

function getRirLabel(v: string): string {
  return RIR_META.find(r => r.value === v)?.label ?? '—';
}

function getRirActiveTextColor(v: string): string {
  return parseInt(v) >= 3 ? 'var(--accent-text)' : 'var(--text-high)';
}

const StepButton = memo(function StepButton({
  onClick, disabled, children,
}: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-14 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border)',
        touchAction: 'manipulation',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </button>
  );
});

const ActiveExerciseCard = memo(function ActiveExerciseCard({
  currentExercise, weight, reps, rir, isBodyweight, restTime,
  lastRecord, completedSetsCount, exerciseIndex, totalExercises,
  onWeightChange, onRepsChange, onRirChange, onBodyweightToggle,
  onRestTimeChange, onLogSet, onChangeExercise, isLoading, hint, isTimed, isBodyweightLocked, onCdActiveChange,
}: ActiveExerciseCardProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const [cdActive, setCdActive] = useState(false);
  const [cdRemaining, setCdRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Signals that the countdown hit 0 — read in a separate effect to trigger onLogSet
  const cdDoneRef = useRef(false);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    cdDoneRef.current = false;
    setCdActive(false);
    setCdRemaining(0);
  }, []);

  const startCountdown = useCallback(() => {
    const secs = parseInt(reps) || 30;
    cdDoneRef.current = false;
    setCdRemaining(secs);
    setCdActive(true);
  }, [reps]);

  // Tick every second while active
  useEffect(() => {
    if (!cdActive) return;
    intervalRef.current = setInterval(() => {
      setCdRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          cdDoneRef.current = true; // signal — do NOT call setState/onLogSet here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdActive]);

  // Act on completion outside the updater (safe to call onLogSet here)
  useEffect(() => {
    if (cdDoneRef.current) {
      cdDoneRef.current = false;
      setCdActive(false);
      onLogSet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdRemaining]);

  // Reset countdown when exercise changes
  useEffect(() => { stopCountdown(); }, [currentExercise, stopCountdown]);

  // Notify parent of countdown state changes
  useEffect(() => { onCdActiveChange?.(cdActive); }, [cdActive, onCdActiveChange]);

  const [editingField, setEditingField] = useState<'weight' | 'reps' | null>(null);
  const [showCdGuard, setShowCdGuard] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function commitEdit(field: 'weight' | 'reps', raw: string) {
    if (field === 'weight') {
      const v = parseFloat(raw);
      onWeightChange(isNaN(v) ? '' : v.toString());
    } else {
      const v = isTimed ? parseInt(raw) : parseInt(raw);
      onRepsChange(isNaN(v) || v <= 0 ? '' : v.toString());
    }
    setEditingField(null);
  }

  function guardedAction(action: () => void) {
    if (cdActive) {
      pendingActionRef.current = action;
      setShowCdGuard(true);
    } else {
      action();
    }
  }

  const weightNum = parseFloat(weight) || 0;
  const repsNum   = parseInt(reps) || 0;
  const est1RM    = !isBodyweight && weightNum > 0 && repsNum > 0
    ? (weightNum * (1 + repsNum / 30)).toFixed(1)
    : null;

  const isLastHint  = completedSetsCount >= 2;
  const canLog      = isTimed
    ? Boolean(currentExercise && reps && parseInt(reps) > 0)
    : Boolean(currentExercise && reps && (isBodyweight || weight));
  const setLabel    = completedSetsCount > 0 ? `第 ${completedSetsCount + 1} 组` : '完成此组';
  const rirColor    = getRirColor(rir);
  const rirLabel    = getRirLabel(rir);

  function stepWeight(delta: number) {
    if (isBodyweight) return;
    const next = Math.max(0, Math.round((weightNum + delta) * 10) / 10);
    onWeightChange(next.toString());
  }
  function stepReps(delta: number) {
    const step = isTimed ? 5 : 1;
    const next = Math.max(0, repsNum + delta * step);
    onRepsChange(next.toString());
  }

  return (
    <div
      className="rounded-3xl overflow-hidden mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex-1 min-w-0">
          {isLastHint && (
            <div className="flex items-center gap-2 mb-0.5">
              {isLastHint && (
                <span
                  className="text-xs font-black"
                  style={{ color: 'rgb(var(--accent))', animation: 'p3-fade-up 0.3s ease-out' }}
                >
                  💪 最后冲刺
                </span>
              )}
            </div>
          )}
          <h2
            className="text-base font-black truncate"
            style={{ color: 'var(--text-high)' }}
          >
            {currentExercise.split(' (')[0]}
          </h2>
        </div>
        <button
          onClick={() => guardedAction(onChangeExercise)}
          className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'var(--surface-3)',
            color: 'var(--text-med)',
            touchAction: 'manipulation',
          }}
        >
          动作库
        </button>

        {/* ── Countdown guard dialog ── */}
        {showCdGuard && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCdGuard(false)}
          >
            <div
              className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <span style={{ fontSize: '2rem' }}>⏱</span>
              <div className="text-center">
                <p className="font-black text-base" style={{ color: 'var(--text-high)' }}>正在计时中</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-low)' }}>坚持住！确定要放弃这组吗？</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-med)', touchAction: 'manipulation' }}
                  onClick={() => setShowCdGuard(false)}
                >
                  继续坚持
                </button>
                <button
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipulation' }}
                  onClick={() => {
                    setShowCdGuard(false);
                    stopCountdown();
                    pendingActionRef.current?.();
                    pendingActionRef.current = null;
                  }}
                >
                  放弃本组
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mega-number input grid ── */}
      {isTimed ? (
        /* ── Timed mode: single-column, seconds only ── */
        <div className="flex flex-col items-center py-6 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {cdActive ? (
            /* Countdown running */
            <>
              <p className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>倒计时中…</p>
              <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
                <svg width="120" height="120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle cx="60" cy="60" r="52" fill="none"
                    stroke="var(--color-accent)" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - cdRemaining / (parseInt(reps) || 30))}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                  />
                </svg>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-black tabular-nums" style={{ fontSize: '2.8rem', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
                    {cdRemaining}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-faint)' }}>秒</span>
                </div>
              </div>
              <button
                onClick={stopCountdown}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ background: 'var(--surface-3)', color: 'var(--text-low)', border: '1px solid var(--border)' }}
              >
                <X className="w-3.5 h-3.5" /> 取消
              </button>
            </>
          ) : (
            /* Setup: pick duration */
            <>
              <div className="flex items-center justify-start w-full px-4">
                <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>目标时间（秒）</span>
              </div>
              <StepButton onClick={() => stepReps(1)}>
                <Plus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
              </StepButton>
              <div className="flex items-baseline gap-1">
                {editingField === 'reps' ? (
                  <input
                    type="text" inputMode="numeric" autoFocus
                    defaultValue={repsNum || ''}
                    onFocus={e => e.target.select()}
                    onBlur={e => commitEdit('reps', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="font-black tabular-nums leading-none text-center bg-transparent"
                    style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', color: 'var(--foreground)', width: 100, border: 'none', outline: 'none', caretColor: 'var(--color-accent)' }}
                  />
                ) : (
                  <span
                    className="font-black tabular-nums leading-none cursor-text"
                    style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', color: 'var(--foreground)' }}
                    onClick={() => setEditingField('reps')}
                  >
                    {repsNum || '0'}
                  </span>
                )}
                {editingField !== 'reps' && <span className="text-sm font-semibold mb-1" style={{ color: 'var(--text-faint)' }}>秒</span>}
              </div>
              <StepButton onClick={() => stepReps(-1)}>
                <Minus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
              </StepButton>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>每次 ±5 秒</p>
            </>
          )}
        </div>
      ) : (
        /* ── Standard mode: weight + reps (or reps-only when locked) ── */
        <div className={isBodyweightLocked ? 'flex justify-center' : 'grid grid-cols-2'} style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Weight — hidden for bodyweight-locked exercises (stretch/warmup/cardio) */}
          {!isBodyweightLocked && <div
            className="flex flex-col items-center py-6 gap-3"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between w-full px-4">
              <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>重量</span>
              <button
                onClick={onBodyweightToggle}
                className="text-xs font-bold px-2 py-0.5 rounded-full transition-all active:scale-95"
                style={
                  isBodyweight
                    ? { background: 'rgb(var(--accent))', color: 'var(--accent-text)' }
                    : { background: 'var(--surface-3)', color: 'var(--text-faint)' }
                }
              >
                自重
              </button>
            </div>
            <StepButton onClick={() => stepWeight(2.5)} disabled={isBodyweight}>
              <Plus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </StepButton>
            <div className="flex items-baseline gap-1 min-h-[4rem] items-center justify-center">
              {!isBodyweight && editingField === 'weight' ? (
                <input
                  type="text" inputMode="decimal" autoFocus
                  defaultValue={weightNum || ''}
                  onFocus={e => e.target.select()}
                  onBlur={e => commitEdit('weight', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  className="font-black tabular-nums leading-none text-center bg-transparent"
                  style={{ fontSize: '3rem', letterSpacing: '-0.03em', color: 'var(--foreground)', width: 100, border: 'none', outline: 'none', caretColor: 'var(--color-accent)' }}
                />
              ) : (
                <span
                  className="font-black tabular-nums leading-none cursor-text"
                  style={{ fontSize: '3rem', letterSpacing: '-0.03em', color: isBodyweight ? 'var(--text-faint)' : 'var(--foreground)' }}
                  onClick={() => { if (!isBodyweight) setEditingField('weight'); }}
                >
                  {isBodyweight ? '—' : (weightNum || '0')}
                </span>
              )}
              {!isBodyweight && editingField !== 'weight' && (
                <span className="text-sm font-semibold mb-1" style={{ color: 'var(--text-faint)' }}>
                  kg
                </span>
              )}
            </div>
            <StepButton onClick={() => stepWeight(-2.5)} disabled={isBodyweight}>
              <Minus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </StepButton>
          </div>}
          {/* Reps */}
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="flex items-center justify-start w-full px-4">
              <span className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>次数</span>
            </div>
            <StepButton onClick={() => stepReps(1)}>
              <Plus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </StepButton>
            <div className="flex items-baseline gap-1 min-h-[4rem] items-center justify-center">
              {editingField === 'reps' ? (
                <input
                  type="text" inputMode="numeric" autoFocus
                  defaultValue={repsNum || ''}
                  onFocus={e => e.target.select()}
                  onBlur={e => commitEdit('reps', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  className="font-black tabular-nums leading-none text-center bg-transparent"
                  style={{ fontSize: '3rem', letterSpacing: '-0.03em', color: 'var(--foreground)', width: 80, border: 'none', outline: 'none', caretColor: 'var(--color-accent)' }}
                />
              ) : (
                <span
                  className="font-black tabular-nums leading-none cursor-text"
                  style={{ fontSize: '3rem', letterSpacing: '-0.03em', color: 'var(--foreground)' }}
                  onClick={() => setEditingField('reps')}
                >
                  {repsNum || '0'}
                </span>
              )}
              {editingField !== 'reps' && (
                <span className="text-sm font-semibold mb-1" style={{ color: 'var(--text-faint)' }}>次</span>
              )}
            </div>
            <StepButton onClick={() => stepReps(-1)}>
              <Minus className="w-5 h-5" style={{ color: 'var(--text-med)' }} />
            </StepButton>
          </div>
        </div>
      )}

      {/* ── Reference row ── */}
      {(lastRecord || est1RM) && (
        <div
          className="flex items-center justify-between px-5 py-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
        >
          {lastRecord ? (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              上次 {lastRecord.weight}kg × {lastRecord.reps}次
            </span>
          ) : <span />}
          {est1RM && (
            <span className="text-xs font-bold" style={{ color: 'var(--text-low)' }}>
              预估1RM: {est1RM}kg
            </span>
          )}
        </div>
      )}

      {/* ── Secondary controls toggle ── */}
      <button
        onClick={() => setShowSecondary(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3 transition-all"
        style={{
          borderBottom: showSecondary ? '1px solid var(--border)' : 'none',
          touchAction: 'manipulation',
        }}
      >
        <div className="flex items-center gap-4 text-xs">
          <span style={{ color: 'var(--text-faint)' }}>
            RIR：<span className="font-bold" style={{ color: rirColor }}>{rirLabel}</span>
          </span>
          <span style={{ color: 'var(--text-faint)' }}>
            休息：<span className="font-bold" style={{ color: 'var(--text-low)' }}>{restTime}s</span>
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: 'var(--text-faint)',
            transform: showSecondary ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {showSecondary && (
        <div className="px-5 pb-4 pt-3 space-y-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {/* RIR */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-faint)' }}>
              RIR — 剩余潜力
            </p>
            <div className="grid grid-cols-5 gap-1">
              {RIR_META.map(opt => {
                const isActive = rir === opt.value;
                const activeBg = getRirColor(opt.value);
                const activeText = getRirActiveTextColor(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => onRirChange(opt.value)}
                    className="py-2.5 rounded-xl text-center transition-all active:scale-95"
                    style={{
                      touchAction: 'manipulation',
                      background: isActive ? activeBg : 'var(--surface-3)',
                      border: isActive ? 'none' : '1px solid var(--border)',
                      color: isActive ? activeText : 'var(--text-low)',
                    }}
                  >
                    <div className="text-sm font-black leading-none">{opt.value}</div>
                    <div className="text-[9px] mt-0.5 leading-none">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rest time */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-faint)' }}>
              休息时间
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {REST_TIME_PRESETS.map(preset => {
                const isActive = restTime === preset.seconds.toString();
                return (
                  <button
                    key={preset.seconds}
                    onClick={() => onRestTimeChange(preset.seconds.toString())}
                    className="py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    style={{
                      touchAction: 'manipulation',
                      background: isActive ? 'rgb(var(--accent))' : 'var(--surface-3)',
                      color: isActive ? 'var(--accent-text)' : 'var(--text-low)',
                      border: isActive ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Primary CTA ── */}
      <div className="px-5 pb-5 pt-4">
        {isTimed ? (
          /* Timed CTA: 开始计时 → auto-logs when done */
          !cdActive && (
            <button
              onClick={startCountdown}
              disabled={!canLog || isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-base transition-all active:scale-[0.97]"
              style={{
                background: 'rgb(var(--accent))',
                color: 'var(--accent-text)',
                opacity: !canLog || isLoading ? 0.45 : 1,
                touchAction: 'manipulation',
              }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              开始计时 · {repsNum}秒
            </button>
          )
        ) : (
          <button
            onClick={onLogSet}
            disabled={!canLog || isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-base transition-all active:scale-[0.97]"
            style={{
              background: 'rgb(var(--accent))',
              color: 'var(--accent-text)',
              opacity: !canLog || isLoading ? 0.45 : 1,
              boxShadow: isLastHint && canLog ? '0 0 24px var(--wo-strength-shadow)' : 'none',
              touchAction: 'manipulation',
            }}
          >
            {isLoading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Check className="w-5 h-5" />
            }
            {isLoading ? '保存中…' : setLabel}
          </button>
        )}

        {hint && (
          <p className="mt-2.5 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
});

export default ActiveExerciseCard;
