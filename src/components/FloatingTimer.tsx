'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Dumbbell, Pause, Play } from 'lucide-react';
import { useWorkoutTimer } from '@/stores/workoutTimer';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function FloatingTimer() {
  const {
    isTrainingActive,
    trainingStartTime,
    trainingDuration,
    isRestActive,
    restStartTime,
    restDuration,
    restTotal,
    currentExercise,
    stopTraining,
    stopRest,
  } = useWorkoutTimer();

  const [displayTraining, setDisplayTraining] = useState(0);
  const [displayRest, setDisplayRest] = useState(0);
  const [visible, setVisible] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = isTrainingActive || isRestActive;

  // 初始化显示 + 每秒 tick
  useEffect(() => {
    const tick = () => {
      let trainSec = trainingDuration;
      if (isTrainingActive && trainingStartTime) {
        trainSec = trainingDuration + Math.floor((Date.now() - trainingStartTime) / 1000);
      }
      setDisplayTraining(trainSec);

      let restSec = restDuration;
      if (isRestActive && restStartTime) {
        const elapsed = Math.floor((Date.now() - restStartTime) / 1000);
        restSec = Math.max(0, restTotal - elapsed);
      }
      setDisplayRest(restSec);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTrainingActive, trainingStartTime, trainingDuration, isRestActive, restStartTime, restDuration, restTotal]);

  // 控制显隐
  useEffect(() => {
    setVisible(isActive);
  }, [isActive]);

  const handleEndClick = () => {
    if (confirmEnd) {
      stopTraining();
      stopRest();
      setConfirmEnd(false);
    } else {
      setConfirmEnd(true);
      setTimeout(() => setConfirmEnd(false), 3000);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          minWidth: 160,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 训练计时 */}
          {isTrainingActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isRestActive ? 8 : 0 }}>
              <Dumbbell size={14} color="#10b981" />
              <span style={{ fontSize: 12, color: '#6b7280' }}>训练</span>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#10b981',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}>
                {formatSeconds(displayTraining)}
              </span>
            </div>
          )}

          {/* 休息倒计时 */}
          {isRestActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} color="#f59e0b" />
              <span style={{ fontSize: 12, color: '#6b7280' }}>休息</span>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: displayRest <= 10 ? '#ef4444' : '#f59e0b',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}>
                {formatSeconds(displayRest)}
              </span>
            </div>
          )}

          {/* 当前动作 */}
          {currentExercise && (
            <div style={{
              fontSize: 11,
              color: '#9ca3af',
              marginTop: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 140,
            }}>
              {currentExercise}
            </div>
          )}

          {/* 结束按钮 */}
          <button
            onClick={handleEndClick}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: confirmEnd ? '#ef4444' : '#374151',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {confirmEnd ? '确认结束训练？' : '结束训练'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
