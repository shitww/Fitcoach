'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Activity, Pause, Play } from 'lucide-react';
import { useWorkoutTimer, selectTrainingSeconds, selectRestSecondsRemaining } from '@/stores/workoutTimer';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function FloatingTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isTrainingActive,
    isPaused,
    isRestActive,
    currentExercise,
    sessionType,
    totalSets,
    isCardioSession,
    isFreeSession,
    stopTraining,
    skipRest,
    pauseTraining,
    resumeTraining,
  } = useWorkoutTimer();

  const CARDIO_LABELS: Record<string, string> = { treadmill: '跑步机', stairclimber: '爬楼机' };
  const activityLabel = isCardioSession
    ? (CARDIO_LABELS[sessionType ?? ''] ?? '有氧训练')
    : isFreeSession
    ? '自由训练'
    : currentExercise?.split(' (')[0] ?? null;

  // Derived from global ticker — no local interval needed
  const trainSecs = useWorkoutTimer(selectTrainingSeconds);
  const restSecs  = useWorkoutTimer(selectRestSecondsRemaining);

  const [showSheet, setShowSheet] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isVisible = isTrainingActive || isPaused || isRestActive;
  // On the workout page the header already shows the timer — hide the pill
  const onWorkoutPage = pathname === '/workout';

  const hasContent = totalSets > 0 || (isCardioSession && trainSecs > 0) || (isFreeSession && trainSecs > 0);

  const handleEnd = () => {
    if (hasContent) {
      setShowEndConfirm(true);
    } else {
      // No content — just stop
      stopTraining();
      skipRest();
      setShowSheet(false);
    }
  };

  const handleDiscard = () => {
    stopTraining();
    skipRest();
    setShowSheet(false);
    setShowEndConfirm(false);
  };

  const handleSave = () => {
    setShowSheet(false);
    setShowEndConfirm(false);
    router.push('/workout?action=finish');
  };

  if (!isVisible || onWorkoutPage) return null;

  return (
    <>
      {/* ── Dynamic Island pill (top-center, fixed) ── */}
      <AnimatePresence>
        <motion.div
          key="pill-wrapper"
          initial={{ y: -64, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -64, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9500,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 'env(safe-area-inset-top, 8px)',
            pointerEvents: 'none',
          }}
        >
          <div
            onClick={() => { setShowSheet(true); setShowEndConfirm(false); }}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              background: 'var(--nav-bg)',
              border: '1px solid var(--border)',
              borderRadius: 100,
              padding: '0 12px',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              backdropFilter: 'blur(20px)',
              userSelect: 'none',
              touchAction: 'manipulation',
            }}
          >
            {/* Icon */}
            {isPaused
              ? <Pause size={12} color="#4b5563" strokeWidth={2.5} />
              : <Activity size={12} color="var(--color-accent)" strokeWidth={2.5} />}

            {/* Training time */}
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: isPaused ? '#4b5563' : 'var(--color-accent)',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'monospace',
              letterSpacing: '0.03em',
              lineHeight: 1,
            }}>
              {formatSeconds(trainSecs)}
            </span>

            {/* Rest countdown — always show when active so user can see from any page */}
            {isRestActive && (
              <>
                <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>·</span>
                <Clock size={10} color="#f59e0b" strokeWidth={2.5} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: restSecs <= 10 ? '#ef4444' : '#f59e0b',
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'monospace',
                }}>
                  {formatSeconds(restSecs)}
                </span>
              </>
            )}

            {/* Exercise name */}
            {activityLabel && !isRestActive && !isPaused && (
              <>
                <span style={{ color: 'var(--text-faint)', fontSize: 12, marginLeft: 1 }}>·</span>
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-med)',
                  maxWidth: 72,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {activityLabel}
                </span>
              </>
            )}

            {/* Paused */}
            {isPaused && (
              <>
                <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>已暂停</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Action sheet ── */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowSheet(false); setShowEndConfirm(false); }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
                zIndex: 9501,
              }}
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                zIndex: 9502,
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderRadius: '24px 24px 0 0',
                padding: '0 16px 40px',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 10px' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
              </div>

              {/* Big timer */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {isPaused ? '训练已暂停' : '训练进行中'}
                </div>
                <div style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: isPaused ? '#2d3748' : 'var(--color-accent)',
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'monospace',
                  letterSpacing: '0.03em',
                  lineHeight: 1,
                }}>
                  {formatSeconds(trainSecs)}
                </div>
                {activityLabel && (
                  <div style={{ fontSize: 13, color: 'var(--text-low)', marginTop: 10 }}>
                    {activityLabel}
                  </div>
                )}
                {isRestActive && (
                  <div style={{ fontSize: 13, color: '#f59e0b', marginTop: 8, fontWeight: 600 }}>
                    休息倒计时 · {formatSeconds(restSecs)}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* PRIMARY — Return to workout */}
                <button
                  onClick={() => { setShowSheet(false); router.push('/workout'); }}
                  style={{
                    width: '100%', padding: '17px',
                    borderRadius: 16, border: 'none',
                    background: 'var(--color-accent)',
                    color: 'var(--accent-text)',
                    fontSize: 16, fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    touchAction: 'manipulation',
                  }}
                >
                  <Play size={18} fill="currentColor" />
                  继续训练
                </button>

                {/* Pause / Resume */}
                <button
                  onClick={() => { if (isPaused) { resumeTraining(); } else { pauseTraining(); } setShowSheet(false); }}
                  style={{
                    width: '100%', padding: '15px',
                    borderRadius: 16, border: 'none',
                    background: 'var(--surface-2)',
                    color: 'var(--foreground)',
                    fontSize: 15, fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    touchAction: 'manipulation',
                  }}
                >
                  {isPaused
                    ? <><Play size={18} fill="currentColor" /> 继续计时</>
                    : <><Pause size={18} /> 暂停计时</>}
                </button>

                {/* End training */}
                {showEndConfirm ? (
                  <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <div style={{ padding: '14px 16px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>
                        {isCardioSession ? '是否记录本次有氧训练？' : isFreeSession ? '是否记录本次自由训练？' : '是否记录本次训练？'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-low)' }}>
                        {isCardioSession || isFreeSession
                          ? `训练时长 ${formatSeconds(trainSecs)}`
                          : `已完成 ${totalSets} 组`}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(239,68,68,0.15)' }}>
                      <button onClick={handleDiscard}
                        style={{ padding: '13px', border: 'none', background: 'var(--surface-2)', color: 'var(--text-med)', fontSize: 14, fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                        放弃训练
                      </button>
                      <button onClick={handleSave}
                        style={{ padding: '13px', border: 'none', background: 'var(--surface-2)', color: '#60A5FA', fontSize: 14, fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                        记录训练
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleEnd}
                    style={{
                      width: '100%', padding: '15px',
                      borderRadius: 16, border: 'none',
                      background: 'rgba(239,68,68,0.07)',
                      color: '#ef4444',
                      fontSize: 15, fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                      touchAction: 'manipulation',
                    }}
                  >
                    <X size={18} />
                    结束训练
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
