"use client";

import { Suspense, useState, useRef, useEffect, memo, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft, Dumbbell, Clock, Check,
  X, Flame, Activity, Target,
  BookOpen, Loader2, ChevronRight
} from 'lucide-react';
import WarmupPanel from '@/app/workout/components/WarmupPanel';
import ExerciseQuickLauncher from '@/app/workout/components/ExerciseQuickLauncher';
import TrainingTypeModal, { type TrainingType, type CardioParams } from '@/components/TrainingTypeModal';
import { useShallow } from 'zustand/shallow';
import { useWorkoutTimer, selectTrainingSeconds, selectRestSecondsRemaining } from '@/stores/workoutTimer';
import { logger } from '@/lib/logger';
import { MUSCLE_GROUP_MAP } from '@/lib/exercise-constants';
import { getUserStorageItem, setUserStorageItem, removeUserStorageItem } from '@/lib/user-storage';
import { useToast } from '@/components/Toast';
import { useWorkoutEffects } from '@/hooks/useWorkoutEffects';
import { useWorkoutHint } from '@/hooks/useWorkoutHint';
import { AmbientGlow } from "@/components/AmbientGlow";
import type { RecoveryWorkoutPlan } from '@/types/workout-plan';
import RestOverlay from '@/components/workout/RestOverlay';
import ActiveExerciseCard from '@/components/workout/ActiveExerciseCard';

interface Set {
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  estimated1RM: number;
  isBodyweight: boolean;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  restTime: number;
  totalVolume: number;
  startedAt?: string;
}

// restTimePresets now imported from exercise-constants

// Module-level exercise cache (populated by component)
let exerciseCache: Map<string, { muscleGroup: string; category: string; tips: string[]; mistakes: string[]; instructions: string; description: string }> = new Map();

/** 根据中文动作名推断肌群（用于自定义动作的 fallback） */
function inferMuscleGroupFromName(name: string): string {
  const n = name.toLowerCase();

  // 精确多字匹配（优先级：arms > legs > shoulders > back > chest）
  // 弯举/臂 → arms 优先，避免被 legs 的单字"弯"抢占
  if (/臂弯举|二头|三头|臂屈伸/.test(name) || /bicep|tricep|curl|extension/i.test(n)) return 'arms';
  if (/深蹲|腿举|腿屈伸|提踵|弓步/.test(name) || /squat|deadlift|lunge|calf/i.test(n)) return 'legs';
  if (/侧平|前平|推举|肩推/.test(name) || /shoulder|lateral.?raise|overhead/i.test(n)) return 'shoulders';
  if (/划船|引体|下拉|挺身/.test(name) || /pull.?up|chin.?up|lat.?pull|row/i.test(n)) return 'back';
  if (/卧推|飞鸟|俯卧撑/.test(name) || /bench|push.?up|fly|pec/i.test(n)) return 'chest';

  // 单字回退（匹配中文常包含该字的动作）
  if (/胸/.test(name)) return 'chest';
  if (/背|拉/.test(name)) return 'back';
  if (/腿|臀/.test(name)) return 'legs';
  if (/肩/.test(name)) return 'shoulders';
  if (/臂/.test(name)) return 'arms';

  // 英文回退
  if (/pec|chest/i.test(n)) return 'chest';
  if (/lat|trap|back/i.test(n)) return 'back';
  if (/leg|quad|ham|glute/i.test(n)) return 'legs';
  if (/deltoid|shoulder/i.test(n)) return 'shoulders';
  if (/arm/i.test(n)) return 'arms';

  return 'chest'; // 兜底
}

const MUSCLE_GROUP_CN_TO_EN: Record<string, string> = {
  '胸部': 'chest', '背部': 'back', '腿部': 'legs',
  '肩部': 'shoulders', '手臂': 'arms', '腹部': 'abs',
};

const getExerciseMuscleGroup = (exercise: string): string => {
  const cached = exerciseCache.get(exercise);
  if (cached?.muscleGroup) {
    // cache 中存的是中文，统一转为英文 key
    return MUSCLE_GROUP_CN_TO_EN[cached.muscleGroup] || inferMuscleGroupFromName(exercise);
  }
  // 自定义动作：尝试从动作名推断
  return inferMuscleGroupFromName(exercise);
};

// exerciseNotes removed - now using DB cache

/** Exercises whose "reps" field actually means seconds held. */
const TIMED_EXERCISES = new Set([
  '平板支撑', '侧平板支撑', '俯撑', '单臂平板支撑',
  '靠墙蹲', '靠墙静蹲', '壁坐',
  '悬挂', '死亡悬挂', '悬垂保持',
  'L坐', 'L-sit',
  '超人式保持', 'Superman保持',
  '单腿平衡', '瑜伽保持',
]);

const safeJsonParse = (val: string): string[] => {
    try { return JSON.parse(val); } catch { return []; }
  };


// ── Pure helper functions (module-level for use by sub-components) ───────────

/** 秒 → mm:ss */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** ACSM 跑步机卡路里 (70 kg default) */
function calcTreadmillCalories(speedKmh: number, inclinePct: number, durationSec: number): number {
  if (speedKmh <= 0 || durationSec <= 0) return 0;
  const sm = speedKmh * 1000 / 60;
  const grade = inclinePct / 100;
  const vo2 = speedKmh < 6.4
    ? (0.1 * sm + 1.8 * sm * grade + 3.5)
    : (0.2 * sm + 0.9 * sm * grade + 3.5);
  return Math.round(vo2 * 70 * (durationSec / 60) / 1000 * 5);
}

/** MET 爬楼机卡路里 (70 kg default) */
function calcStairCalories(level: number, durationSec: number): number {
  if (level <= 0 || durationSec <= 0) return 0;
  const met = Math.min(7 + level * 0.5, 15);
  return Math.round(met * 70 * (durationSec / 3600));
}

/** 跑步机实时距离 km */
function liveTreadmillDistance(speedKmh: number, durationSec: number): number {
  return Math.round(speedKmh * durationSec / 3600 * 100) / 100;
}

// ── Timer-isolated sub-components ────────────────────────────────────────────
// These subscribe to store.now (via selectors) so they re-render on every 500 ms
// tick without triggering a re-render of the large WorkoutContent component.

/** Header timer badge: duration + inline rest countdown. */
const WorkoutHeaderTimer = memo(function WorkoutHeaderTimer() {
  const isActive = useWorkoutTimer(s => s.isTrainingActive);
  const isPaused = useWorkoutTimer(s => s.isPaused);
  const secs     = useWorkoutTimer(selectTrainingSeconds);
  const restSecs = useWorkoutTimer(selectRestSecondsRemaining);
  if (!isActive && !isPaused) return null;
  return (
    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: isPaused ? '#6b7280' : 'var(--accent)' }}>
      <Activity className="w-4 h-4" />
      {formatDuration(secs)}{isPaused ? ' ⏸' : ''}
      {restSecs > 0 && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
          <Clock className="w-3 h-3" style={{ color: restSecs <= 10 ? '#ef4444' : '#f59e0b' }} />
          <span style={{ color: restSecs <= 10 ? '#ef4444' : '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
            {restSecs >= 60
              ? `${Math.floor(restSecs / 60)}:${String(restSecs % 60).padStart(2, '0')}`
              : `${restSecs}s`}
          </span>
        </>
      )}
    </div>
  );
});


/** Generic live training duration display — use in place of `formatDuration(displayDuration)`. */
const LiveDuration = memo(function LiveDuration({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const secs = useWorkoutTimer(selectTrainingSeconds);
  return <div className={className} style={style}>{formatDuration(secs)}</div>;
});


/**
 * Cardio hero timer: large digits + SVG progress ring (elapsed/target) +
 * radial breathing-glow pulse. All in one 200×200 container.
 */
const CardioTimerDisplay = memo(function CardioTimerDisplay({
  accentColor, accentRgb, targetMin,
}: { accentColor: string; accentRgb: string; targetMin: number }) {
  const secs    = useWorkoutTimer(selectTrainingSeconds);
  const target  = targetMin * 60;
  const pct     = target > 0 ? Math.min(secs / target, 1) : 0;
  const R       = 80;
  const circ    = 2 * Math.PI * R;
  const dash    = circ * pct;
  return (
    <>
      <div className="relative flex items-center justify-center mb-6 mx-auto"
        style={{ width: 200, height: 200 }}>
        {/* ① Breathing radial glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${accentRgb},0.08) 0%, transparent 68%)`,
            animation: 'p3-breathe 3.5s ease-in-out infinite',
          }} />
        {/* ② SVG progress ring */}
        <svg width={200} height={200} className="absolute inset-0 pointer-events-none"
          style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={100} cy={100} r={R} fill="none"
            stroke={`rgba(${accentRgb},0.1)`} strokeWidth={4} />
          {pct > 0 && (
            <circle cx={100} cy={100} r={R} fill="none"
              stroke={accentColor} strokeOpacity={0.7} strokeWidth={4}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s linear' }} />
          )}
        </svg>
        {/* ③ Timer + label */}
        <div className="text-center z-10">
          <div className="font-black tabular-nums leading-none"
            style={{ color: accentColor, fontSize: '3.5rem', letterSpacing: '-0.02em' }}>
            {formatDuration(secs)}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-low)' }}>计时中</p>
        </div>
      </div>
      {/* ④ Near-goal momentum cue — appears once at 80%, gone at 100% */}
      {pct >= 0.8 && pct < 1.0 && (
        <p className="text-xs font-semibold text-center -mt-4 mb-4"
          style={{ color: accentColor, opacity: 0.75, animation: 'p3-fade-up 0.5s ease-out' }}>
          再坚持一点，快完成了
        </p>
      )}
    </>
  );
});

/** Full-screen mode-entry overlay, auto-dismissed by caller after ~1.6s. */
const IntroOverlay = memo(function IntroOverlay({
  visible, emoji, title, subtitle,
}: { visible: boolean; emoji: string; title: string; subtitle: string }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)' }}>
      <div className="text-center px-8">
        <div className="text-7xl mb-5">{emoji}</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#ffffff' }}>{title}</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{subtitle}</p>
      </div>
    </div>
  );
});

/** Live 2×2 cardio stats. Isolates the 500 ms re-renders from the parent. */
const CardioStatsGrid = memo(function CardioStatsGrid({
  trainingType, speed, incline, level,
}: { trainingType: string; speed: number; incline: number; level: number }) {
  const secs = useWorkoutTimer(selectTrainingSeconds);
  const isTreadmill = trainingType === 'treadmill';
  const dist = isTreadmill ? liveTreadmillDistance(speed, secs) : 0;
  const cals = isTreadmill
    ? calcTreadmillCalories(speed, incline, secs)
    : calcStairCalories(level, secs);
  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>
        <p className="text-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? speed.toFixed(1) : level}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>{isTreadmill ? 'km/h 速度' : '档位'}</p>
      </div>
      <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>
        <p className="text-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? `${incline}%` : '—'}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>{isTreadmill ? '坡度' : ''}</p>
      </div>
      {isTreadmill && (
        <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--surface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>
          <p className="text-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{dist.toFixed(2)}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>公里</p>
        </div>
      )}
      <div className={`rounded-2xl p-3 text-center${isTreadmill ? '' : ' col-span-2'}`} style={{ background: 'var(--surface-2)', border: '1px solid rgba(249,115,22,0.12)' }}>
        <p className="text-xl font-black tabular-nums" style={{ color: '#f97316' }}>{cals}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>千卡</p>
      </div>
    </div>
  );
});

/** Live "完成有氧" button with live calorie count. */
const CardioFinishBtn = memo(function CardioFinishBtn({
  trainingType, speed, incline, level, isLoading, onFinish,
}: { trainingType: string; speed: number; incline: number; level: number; isLoading: boolean; onFinish: () => void }) {
  const secs = useWorkoutTimer(selectTrainingSeconds);
  const cals = trainingType === 'treadmill'
    ? calcTreadmillCalories(speed, incline, secs)
    : calcStairCalories(level, secs);
  return (
    <button onClick={onFinish} disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 font-black text-lg transition-all active:scale-[0.97]"
      style={{ background: '#60A5FA', color: '#000', opacity: isLoading ? 0.6 : 1, boxShadow: '0 0 28px rgba(96,165,250,0.35)' }}>
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
      {isLoading ? '保存中…' : `完成有氧 · ${cals} 千卡`}
    </button>
  );
});

/** Full-screen mode-specific completion overlay. Interactive when ctaLabel/onCta are provided. */
const CompletionSummaryOverlay = memo(function CompletionSummaryOverlay({
  visible, emoji, heading, lines, ctaLabel, onCta,
}: { visible: boolean; emoji: string; heading: string; lines: string[]; ctaLabel?: string; onCta?: () => void }) {
  if (!visible) return null;
  const interactive = Boolean(ctaLabel && onCta);
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)', pointerEvents: interactive ? 'auto' : 'none' }}>
      <div className="text-center px-8 w-full max-w-xs"
        style={{ animation: 'p3-fade-up 0.4s ease-out' }}>
        <div className="text-7xl mb-5">{emoji}</div>
        <h2 className="text-2xl font-black text-foreground mb-4">{heading}</h2>
        {lines.map((line, i) => (
          <p key={i} className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.48)' }}>{line}</p>
        ))}
        {interactive && (
          <button onClick={onCta}
            className="mt-7 w-full rounded-2xl py-4 font-black text-base transition-all active:scale-[0.97]"
            style={{ background: '#fff', color: '#000', touchAction: 'manipulation' }}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
});

function WorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  useWorkoutEffects();
  const hint = useWorkoutHint();
  const userId = session?.user?.id || '';

  const {
    sessionPhase: storeSessionPhase,
    startTraining: storeStartTraining,
    stopTraining: storeStopTraining,
    startRest: storeStartRest,
    skipRest: storeSkipRest,
    setCurrentExercise: setTimerExercise,
    setNextExercise: storeSetNextExercise,
    incrementSets: storeIncrementSets,
    setCardioSession: storeSetCardioSession,
    setFreeSession: storeSetFreeSession,
    setSessionType: storeSetSessionType,
    setCardioParams: storeSetCardioParams,
    sessionType: storeSessionType,
    cardioSpeed: storeCardioSpeed,
    cardioIncline: storeCardioIncline,
    cardioLevel: storeCardioLevel,
  } = useWorkoutTimer(
    useShallow(s => ({
      sessionPhase: s.sessionPhase,
      startTraining: s.startTraining,
      stopTraining: s.stopTraining,
      startRest: s.startRest,
      skipRest: s.skipRest,
      setCurrentExercise: s.setCurrentExercise,
      setNextExercise: s.setNextExercise,
      incrementSets: s.incrementSets,
      setCardioSession: s.setCardioSession,
      setFreeSession: s.setFreeSession,
      setSessionType: s.setSessionType,
      setCardioParams: s.setCardioParams,
      sessionType: s.sessionType,
      cardioSpeed: s.cardioSpeed,
      cardioIncline: s.cardioIncline,
      cardioLevel: s.cardioLevel,
    }))
  );

  // Convenience alias — keeps JSX readable without spreading store everywhere
  const sessionPhase = storeSessionPhase;

  const [currentExercise, setCurrentExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('1');
  const [restTime, setRestTime] = useState('90');
  const [isBodyweight, setIsBodyweight] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [savedExercises, setSavedExercises] = useState<string[]>([]);
  const [planDayName, setPlanDayName] = useState(() => {
    const mg = searchParams.get('mg');
    if (!mg || storeSessionPhase === 'active' || storeSessionPhase === 'paused') return '';
    const L: Record<string, string> = { chest: '胸部', back: '背部', shoulders: '肩部', arms: '手臂', legs: '腿部', abs: '腹部', fullbody: '全身' };
    return L[mg] ?? mg;
  });
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [trainingNotes, setTrainingNotes] = useState('');
  const [lastExerciseRecord, setLastExerciseRecord] = useState<{weight: number; reps: number; date: string} | null>(null);
  const [completedSets, setCompletedSets] = useState<{weight: number; reps: number; rir: number | null; isBodyweight: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbExercisesLoaded, setDbExercisesLoaded] = useState(false);
  const [muscleExercises, setMuscleExercises] = useState<{name: string; alias?: string}[]>([]);
  const [muscleGroupLabel, setMuscleGroupLabel] = useState(() => {
    const mg = searchParams.get('mg');
    if (!mg || storeSessionPhase === 'active' || storeSessionPhase === 'paused') return '';
    const L: Record<string, string> = { chest: '胸部', back: '背部', shoulders: '肩部', arms: '手臂', legs: '腿部', abs: '腹部', fullbody: '全身' };
    return L[mg] ?? mg;
  });
  const [muscleListExpanded, setMuscleListExpanded] = useState(true);
  const [workoutMuscleGroup, setWorkoutMuscleGroup] = useState<string | null>(() =>
    (storeSessionPhase === 'active' || storeSessionPhase === 'paused') ? null : searchParams.get('mg')
  );
  const [warmupDone, setWarmupDone] = useState(false);
  const [detailExerciseName, setDetailExerciseName] = useState<string | null>(null);
  const [showCardioSetup, setShowCardioSetup] = useState(false);
  const [trainingType, setTrainingType] = useState<TrainingType | null>(() => {
    if ((storeSessionPhase === 'active' || storeSessionPhase === 'paused') && storeSessionType) {
      return storeSessionType as TrainingType;
    }
    const mg = searchParams.get('mg');
    if (mg) return 'strength';
    const mode = searchParams.get('mode');
    if (mode === 'cardio') return (searchParams.get('cardioType') as TrainingType) || 'treadmill';
    if (mode === 'recovery') return 'free';
    return null;
  });
  const [cardioParams, setCardioParams] = useState<CardioParams>(
    () => (storeCardioSpeed > 0 || storeCardioLevel > 0)
      ? { speed: storeCardioSpeed, incline: storeCardioIncline, level: storeCardioLevel }
      : { speed: 0, incline: 0, level: 0 }
  );
  const [cardioAvgHR, setCardioAvgHR] = useState('');
  const [cardioNotes, setCardioNotes] = useState('');
  const [freeNotes, setFreeNotes] = useState('');
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryWorkoutPlan | null>(null);
  const [recoveryStepIdx, setRecoveryStepIdx] = useState(0);

  // ── Phase 2: UX separation state ─────────────────────────────────────────────
  const [introVisible, setIntroVisible] = useState(false);
  const [introContent, setIntroContent] = useState<{ emoji: string; title: string; subtitle: string } | null>(null);
  const [setFeedback, setSetFeedback] = useState<string | null>(null);
  const [planHeaderCollapsed, setPlanHeaderCollapsed] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<{
    emoji: string; heading: string; lines: string[];
    ctaLabel?: string; onCta?: () => void;
  } | null>(null);
  const [cardioTargetMin, setCardioTargetMin] = useState(30);
  // ── Phase 4: exercise transition state ──────────────────────────────────────
  const prevExerciseRef = useRef<string | null>(null);
  const [exerciseTransition, setExerciseTransition] = useState<{ prev: string; next: string } | null>(null);

  const sessionRestoredRef = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isTimedCdActive, setIsTimedCdActive] = useState(false);
  const [cdGuardPending, setCdGuardPending] = useState<string | null>(null); // exercise name to switch to after confirm

  // Keep store's nextExercise in sync so RestBar can read it globally
  useEffect(() => {
    if (trainingType !== 'strength' || !currentExercise) { storeSetNextExercise(null); return; }
    const idx = exercises.findIndex(e => e.name === currentExercise);
    storeSetNextExercise(exercises[idx + 1]?.name ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, currentExercise, trainingType]);

  // True when the current exercise records duration (seconds) instead of weight+reps
  const isCurrentExerciseTimed = Boolean(
    currentExercise && (
      TIMED_EXERCISES.has(currentExercise.split(' (')[0]) ||
      exerciseCache.get(currentExercise.split(' (')[0])?.category === 'stretching'
    )
  );

  // ── Phase 4: exercise transition effect ──────────────────────────────────────
  useEffect(() => {
    const prev = prevExerciseRef.current;
    prevExerciseRef.current = currentExercise;
    if (!prev || !currentExercise || prev === currentExercise) return;
    const prevHadSets = exercises.some(e => e.name === prev && e.sets.length > 0);
    if (prevHadSets) {
      startTransition(() => setExerciseTransition({
        prev: prev.split(' (')[0],
        next: currentExercise.split(' (')[0],
      }));
      setTimeout(() => startTransition(() => setExerciseTransition(null)), 1600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise]);

  // ── Session entry: ?mg=X (strength) | ?mode=cardio&cardioType=X | ?mode=recovery&focus=X ──
  useEffect(() => {
    if (storeSessionPhase === 'active' || storeSessionPhase === 'paused') return;
    const params = new URLSearchParams(window.location.search);
    const mg = params.get('mg');
    const mode = params.get('mode');

    const MG_LABELS: Record<string, string> = {
      chest: '胸部', back: '背部', shoulders: '肩部',
      arms: '手臂', legs: '腿部', abs: '腹部', fullbody: '全身',
    };

    if (mg) {
      const label = MG_LABELS[mg] ?? mg;
      storeSetSessionType('strength');
      storeStartTraining();
      startTransition(() => {
        setIntroContent({ emoji: '💪', title: `今天练${label}`, subtitle: '热身后开始正式训练' });
        setIntroVisible(true);
      });
      setTimeout(() => startTransition(() => setIntroVisible(false)), 1600);
    } else if (mode === 'cardio') {
      const ct = (params.get('cardioType') as TrainingType) || 'treadmill';
      const ctLabel = ct === 'treadmill' ? '跑步机快走' : '爬楼机训练';
      storeSetCardioSession(true);
      storeSetSessionType(ct);
      storeStartTraining();
      startTransition(() => {
        setTrainingType(ct);
        setIntroContent({ emoji: ct === 'treadmill' ? '🏃' : '🧗', title: `开始${ctLabel}`, subtitle: '记录时间、速度和消耗' });
        setIntroVisible(true);
      });
      setTimeout(() => startTransition(() => setIntroVisible(false)), 1600);
    } else if (mode === 'recovery') {
      const focus = params.get('focus') ?? 'full_body';
      const FOCUS_LABELS: Record<string, string> = {
        full_body: '全身放松', lower_body: '下肢恢复', upper_body: '上肢恢复', mobility: '灵活性',
      };
      const RECOVERY_STEPS: Record<string, RecoveryWorkoutPlan['steps']> = {
        full_body:  [{ name: '泡沫轴滚压', durationSec: 120, description: '全身主要肌群缓慢滚压' }, { name: '髋屈肌拉伸', durationSec: 60, description: '弓步姿势，感受髋部拉伸' }, { name: '胸部拉伸', durationSec: 60, description: '双手交叉后背，打开胸腔' }, { name: '脊柱旋转', durationSec: 60, description: '平躺，双膝倒向两侧' }],
        lower_body: [{ name: '股四头肌拉伸', durationSec: 60, description: '单腿站立，向后拉脚踝' }, { name: '腘绳肌拉伸', durationSec: 60, description: '坐姿前屈，感受大腿后侧' }, { name: '臀部鸽子式', durationSec: 120, description: '每侧各保持一分钟' }, { name: '小腿拉伸', durationSec: 60, description: '靠墙站立，弓步拉伸' }],
        upper_body: [{ name: '肩部拉伸', durationSec: 60, description: '手臂横拉，感受肩后侧' }, { name: '胸部开胸', durationSec: 60, description: '双手相握向后伸展' }, { name: '颈部侧拉', durationSec: 60, description: '缓慢侧倾，各15秒' }, { name: '背阔肌拉伸', durationSec: 120, description: '侧身悬挂或门框拉伸' }],
        mobility:   [{ name: '猫牛式', durationSec: 60, description: '配合呼吸缓慢活动脊柱' }, { name: '世界上最好的拉伸', durationSec: 120, description: '弓步结合旋转，左右各一组' }, { name: '髋关节环绕', durationSec: 60, description: '站姿画大圆，顺逆各10圈' }, { name: '肩关节活动', durationSec: 60, description: '前后环绕，逐渐扩大幅度' }],
      };
      const steps = RECOVERY_STEPS[focus] ?? RECOVERY_STEPS.full_body;
      const focusLabel = FOCUS_LABELS[focus] ?? '恢复训练';
      storeSetFreeSession(true);
      storeSetSessionType('free');
      storeStartTraining();
      startTransition(() => {
        setRecoveryPlan({
          meta: { id: Date.now().toString(), generatedAt: Date.now(), estimatedDurationMin: steps.length, level: 'beginner', source: 'template', mode: 'recovery' },
          focus: (focus as RecoveryWorkoutPlan['focus']),
          focusLabel,
          steps,
        });
        setTrainingType('free');
        setIntroContent({ emoji: '🧘', title: `开始${focusLabel}`, subtitle: '跟随节奏，慢慢放松' });
        setIntroVisible(true);
      });
      setTimeout(() => startTransition(() => setIntroVisible(false)), 1600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saved = userId ? getUserStorageItem(userId, 'saved_exercises') : null;
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setSavedExercises(JSON.parse(saved)); } catch {}
    }
    
    // 加载内置动作（构建缓存）
    const loadBuiltInExercises = async () => {
      try {
        const res = await fetch("/api/exercises");
        if (res.ok) {
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const builtIn = data.exercises?.filter((e: any) => !e.isCustom) || [];
          // Build cache
          const newCache = new Map<string, { muscleGroup: string; category: string; tips: string[]; mistakes: string[]; instructions: string; description: string }>();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          builtIn.forEach((ex: any) => {
            const tips = ex.tips ? safeJsonParse(ex.tips) : [];
            const mistakes = ex.commonMistakes ? safeJsonParse(ex.commonMistakes) : [];
            newCache.set(ex.name, {
              muscleGroup: MUSCLE_GROUP_MAP[ex.muscleGroup] || ex.muscleGroup,
              category: ex.category || '',
              tips,
              mistakes,
              instructions: ex.instructions || '',
              description: ex.description || '',
            });
          });
          exerciseCache = newCache;
          setDbExercisesLoaded(true);
        }
      } catch (e) {
        logger.error("[Workout] 加载内置动作失败:", e);
      }
    };
    loadBuiltInExercises();

    // 加载自定义动作（userId 可能还未载入，用 workout_session effect 恶化时再加载）

    // 从 URL 参数读取计划信息
    const params = new URLSearchParams(window.location.search);

    // 读取 AI 推荐训练动作（通过 localStorage 桥接，不经过 URL）
    try {
      const aiSuggestion = localStorage.getItem('fitcoach:v1:ai:suggestion');
      if (aiSuggestion) {
        localStorage.removeItem('fitcoach:v1:ai:suggestion');
        const names = JSON.parse(aiSuggestion) as string[];
        if (Array.isArray(names) && names.length > 0) {
          setSavedExercises(names);
        }
      }
    } catch {}

    // 处理从肌群热力图点击传来的肌群参数
    const muscleParam = params.get('muscle');
    if (muscleParam) {
      const muscleLabels: Record<string, string> = {
        chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂', abs: '腹部',
      };
      setMuscleGroupLabel(muscleLabels[muscleParam] || muscleParam);
      // 从 API 获取该肌群的所有动作
      fetch(`/api/exercises?muscleGroup=${muscleParam.charAt(0).toUpperCase() + muscleParam.slice(1)}`, {
        credentials: 'include',
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.exercises) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMuscleExercises(data.exercises.map((ex: any) => ({
              name: ex.alias || ex.name,
              alias: ex.alias,
            })));
          }
        })
        .catch(err => logger.error('加载肌群动作失败:', err));
    }

    if (!muscleParam) {
      // 计划ID处理逻辑
      const planId = params.get('plan');
      const dayIdx = params.get('day');
      if (planId && dayIdx !== null) {
        // Auto-enter strength mode immediately — skip selection screen and warmup modal
        setTrainingType('strength');
        storeSetSessionType('strength');
        fetch(`/api/plans/${planId}`, {
          credentials: "include"
        })
          .then(r => {
            if (r.status === 401) {
              logger.warn("User not authenticated for plan data");
              return null;
            } else if (r.ok) {
              return r.json();
            } else {
              return r.text().then(text => {
                logger.warn("Plan API warning:", text);
                return null;
              });
            }
          })
          .then(data => {
            if (data?.plan?.days) {
              const day = data.plan.days[Number(dayIdx)];
              if (day) {
                const exercises = JSON.parse(day.exercises || '[]') as string[];
                setPlanDayName(day.dayName || '');
                setSavedExercises(exercises);
              }
            }
          })
          .catch((error) => {
            logger.error("Plan fetch error:", error);
          });
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Selection screen is now inline — no modal trigger needed)

  const guardedSelectExercise = (exercise: string) => {
    if (isTimedCdActive) {
      setCdGuardPending(exercise);
      return;
    }
    void selectExercise(exercise);
  };

  const selectExercise = async (exercise: string) => {
    setCurrentExercise(exercise);
    setTimerExercise(exercise.split(' (')[0]);
    if (!savedExercises.includes(exercise)) {
      setSavedExercises(prev => [exercise, ...prev].slice(0, 10));
    }
    
    // 检查动作是否在动作库中，如果不在，添加到自定义动作列表
    if (!exerciseCache.has(exercise) && !exerciseCache.has(exercise.split(' (')[0]) && !customExercises.includes(exercise)) {
      const updatedCustomExercises = [...customExercises, exercise];
      setCustomExercises(updatedCustomExercises);
      // 保存到本地存储
      if (userId) setUserStorageItem(userId, 'custom_exercises', JSON.stringify(updatedCustomExercises));
    }
    
    // 先检查当前训练中是否已有该动作的记录
    const lastExercise = exercises.find(e => e.name === exercise);
    if (lastExercise?.sets.length) {
      const lastSet = lastExercise.sets[lastExercise.sets.length - 1];
      setWeight(lastSet.weight.toString());
      setReps(lastSet.reps.toString());
      setRir(String(lastSet.rir ?? 0));
      setRestTime(lastExercise.restTime.toString());
    } else {
      // 从数据库获取上次训练记录
      try {
        const exerciseName = exercise.split(' (')[0];
        const response = await fetch(`/api/exercises/last-record?name=${encodeURIComponent(exerciseName)}`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          const isTimed = TIMED_EXERCISES.has(exerciseName) || exerciseCache.get(exerciseName)?.category === 'stretching';
          if (data.data) {
            setLastExerciseRecord(data.data);
            setWeight(data.data.weight.toString());
            setReps(data.data.reps.toString());
          } else {
            setLastExerciseRecord(null);
            setWeight('');
            setReps(isTimed ? '30' : '');
          }
        } else {
          if (response.status === 401) {
            return;
          }
          logger.warn("API warning:", await response.text());
          const isTimed2 = TIMED_EXERCISES.has(exerciseName) || exerciseCache.get(exerciseName)?.category === 'stretching';
          setLastExerciseRecord(null);
          setWeight('');
          setReps(isTimed2 ? '30' : '');
        }
      } catch (error) {
        logger.error('Failed to fetch last exercise record:', error);
        setLastExerciseRecord(null);
      }
    }
    
  };

  // 从 /exercises 页面选择动作后返回
  useEffect(() => {
    const exerciseParam = searchParams.get('exercise');
    if (!exerciseParam || !dbExercisesLoaded) return;
    // Snapshot weight/reps from session backup so selectExercise's async
    // DB fetch cannot overwrite them after the session restore has run.
    const mgParam = searchParams.get('mg');
    const raw = userId ? getUserStorageItem(userId, 'workout_session') : null;
    let snapWeight: string | null = null;
    let snapReps: string | null = null;
    let snapMg: string | null = mgParam;
    if (raw) {
      try {
        const d = JSON.parse(raw);
        snapWeight = d.weight ?? null;
        snapReps   = d.reps   ?? null;
        if (!snapMg && d.workoutMuscleGroup) snapMg = d.workoutMuscleGroup;
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    selectExercise(decodeURIComponent(exerciseParam)).then(() => {
      // After the async fetch, restore the pre-navigation weight/reps so they
      // are not silently overwritten by DB-fetched defaults.
      if (snapWeight !== null) setWeight(snapWeight);
      if (snapReps   !== null) setReps(snapReps);
      if (snapMg) setWorkoutMuscleGroup(snapMg);
    });
    router.replace('/workout');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, dbExercisesLoaded]);

  // FloatingTimer 点击「记录训练」后跳转到此页并自动完成
  useEffect(() => {
    if (searchParams.get('action') !== 'finish') return;
    if (!dbExercisesLoaded) return;
    // 清除 URL 参数，避免重复触发
    router.replace('/workout');
    // 根据训练类型选择完成方式
    // 给一点 tick 让状态同步
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, dbExercisesLoaded]);

  /** 用户选择训练类型后的处理 */
  const handleTrainingTypeSelect = (type: TrainingType, params?: CardioParams) => {
    setTrainingType(type);
    setShowCardioSetup(false);
    if (type === 'strength') {
      storeSetSessionType('strength');
      storeStartTraining();
    } else if (type === 'free') {
      // 自由记录：直接开始计时
      storeSetFreeSession(true);
      storeSetSessionType('free');
      storeStartTraining();
    } else {
      // 有氧：保存参数并自动开始计时
      if (params) {
        setCardioParams(params);
        storeSetCardioParams(params.speed, params.incline, params.level);
      }
      storeSetCardioSession(true);
      storeSetSessionType(type);
      storeStartTraining();
    }
  };

  // Restore workout session when userId becomes available (handles both page-refresh and navigate-back)
  useEffect(() => {
    if (!userId || sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;

    // Always try to load custom exercises keyed by userId
    const savedCustom = getUserStorageItem(userId, 'custom_exercises');
    if (savedCustom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setCustomExercises(JSON.parse(savedCustom)); } catch {}
    }

    if (storeSessionPhase === 'active' || storeSessionPhase === 'paused') {
      const raw = getUserStorageItem(userId, 'workout_session');
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (Array.isArray(d.exercises)) setExercises(d.exercises);
          if (d.currentExercise) setCurrentExercise(d.currentExercise);
          if (Array.isArray(d.completedSets)) setCompletedSets(d.completedSets);
          if (d.weight !== undefined) setWeight(d.weight);
          if (d.reps !== undefined) setReps(d.reps);
          if (d.rir !== undefined) setRir(d.rir);
          if (d.trainingNotes) setTrainingNotes(d.trainingNotes);
          if (d.isBodyweight !== undefined) setIsBodyweight(d.isBodyweight);
          if (d.trainingType) setTrainingType(d.trainingType);
          if (d.workoutMuscleGroup) setWorkoutMuscleGroup(d.workoutMuscleGroup);
          if (Array.isArray(d.savedExercises) && d.savedExercises.length > 0) setSavedExercises(d.savedExercises);
        } catch (e) { logger.error('恢复训练会话失败:', e); }
      }
    } else {
      const pending = getUserStorageItem(userId, 'pending_workout');
      if (pending) {
        try {
          const data = JSON.parse(pending);
          if (data.exercises?.length > 0) {
            setExercises(data.exercises);
            setTrainingNotes(data.trainingNotes || '');
            toast({ message: '已恢复未保存的训练记录，请点击“完成训练”保存', type: 'info', duration: 4000 });
          }
        } catch (e) { logger.error('恢复未保存训练记录失败:', e); }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (savedExercises.length > 0) {
      if (userId) setUserStorageItem(userId, 'saved_exercises', JSON.stringify(savedExercises));
    }
  }, [savedExercises, userId]);

  // Load last cardio params from localStorage when entering a fresh cardio session
  useEffect(() => {
    if (!userId || !trainingType || trainingType === 'strength' || trainingType === 'free') return;
    if (cardioParams.speed === 0 && cardioParams.incline === 0 && cardioParams.level === 0) {
      const saved = getUserStorageItem(userId, `cardio_params_${trainingType}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCardioParams(p);
          storeSetCardioParams(p.speed, p.incline, p.level);
        } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, trainingType]);

  // Save cardio params to localStorage + sync store whenever they change
  useEffect(() => {
    if (!userId || !trainingType || trainingType === 'strength' || trainingType === 'free') return;
    if (cardioParams.speed > 0 || cardioParams.level > 0) {
      setUserStorageItem(userId, `cardio_params_${trainingType}`, JSON.stringify(cardioParams));
      storeSetCardioParams(cardioParams.speed, cardioParams.incline, cardioParams.level);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardioParams]);

  // Auto-save full session to localStorage during training
  useEffect(() => {
    if (sessionPhase === 'idle' || !userId) return;
    setUserStorageItem(userId, 'workout_session', JSON.stringify({
      exercises,
      currentExercise,
      completedSets,
      weight,
      reps,
      rir,
      restTime,
      isBodyweight,
      trainingNotes,
      trainingType,
      workoutMuscleGroup,
      savedExercises,
    }));
  }, [exercises, currentExercise, completedSets, trainingNotes, sessionPhase, userId, weight, reps, rir, restTime, isBodyweight, trainingType, workoutMuscleGroup, savedExercises]);



  const CARDIO_LABELS: Record<string, string> = { treadmill: '跑步机', stairclimber: '爬楼机' };
  const CARDIO_ICONS:  Record<string, string> = { treadmill: '🏃',   stairclimber: '🧗' };

  /** 完成有氧训练并保存 */
  const finishCardioWorkout = async () => {
    if (!trainingType || trainingType === 'strength') return;
    const { duration: snapshotDuration } = storeStopTraining();
    setIsLoading(true);
    try {
      const activityName = CARDIO_LABELS[trainingType] || trainingType;
      const hr = parseInt(cardioAvgHR) || 0;
      const durationMin = Math.round(snapshotDuration / 60);
      const dist = trainingType === 'treadmill'
        ? liveTreadmillDistance(cardioParams.speed, snapshotDuration)
        : 0;
      const calories = trainingType === 'treadmill'
        ? calcTreadmillCalories(cardioParams.speed, cardioParams.incline, snapshotDuration)
        : calcStairCalories(cardioParams.level, snapshotDuration);

      const notesPayload = JSON.stringify({
        type: 'cardio', activity: trainingType,
        distance: dist, avgHR: hr, calories,
        speed: cardioParams.speed,
        incline: cardioParams.incline,
        level: cardioParams.level,
        memo: cardioNotes,
      });
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exercises: [{
            name: activityName,
            muscleGroup: 'cardio',
            sets: [{ weight: dist, reps: hr, rir: calories, isCardio: true }],
          }],
          totalVolume: 0,
          duration: snapshotDuration,
          notes: notesPayload,
        }),
      });
      if (response.status === 401) { router.push('/auth/signin'); return; }
      if (!response.ok) { toast({ message: '保存失败，请重试', type: 'error' }); return; }
      const cardioJson = await response.json();
      const cardioWorkoutId = cardioJson.data?.workout?.id ?? cardioJson.data?.id;
      if (userId) removeUserStorageItem(userId, 'pending_workout');
      setIsLoading(false);
      setCompletionSummary({
        emoji: trainingType === 'treadmill' ? '🏃' : '🧗',
        heading: '有氧完成 · 做到了',
        lines: [
          `坚持了 ${durationMin} 分钟`,
          ...(dist > 0 ? [`总距离 ${dist.toFixed(2)} km`] : []),
          `消耗约 ${calories} 千卡`,
          '每一步都算数',
        ],
        ctaLabel: '查看训练总结',
        onCta: () => router.push(cardioWorkoutId ? `/summary?id=${cardioWorkoutId}` : '/'),
      });
      return;
    } catch (e) {
      logger.error('保存有氧训练失败:', e);
      toast({ message: '保存失败，请重试', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /** 完成自由记录并保存 */
  const finishFreeWorkout = async () => {
    if (!freeNotes.trim()) { toast({ message: '请填写训练内容', type: 'error' }); return; }
    const { duration: snapshotDuration } = storeStopTraining();
    setIsLoading(true);
    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exercises: [],
          totalVolume: 0,
          duration: snapshotDuration,
          notes: freeNotes,
        }),
      });
      if (response.status === 401) { router.push('/auth/signin'); return; }
      if (!response.ok) { toast({ message: '保存失败，请重试', type: 'error' }); return; }
      const json = await response.json();
      const workoutId = json.data?.workout?.id;
      if (userId) removeUserStorageItem(userId, 'pending_workout');
      // 异步解析自由记录文本，提取肌群数据（fire-and-forget，不阻塞跳转）
      if (workoutId) {
        fetch('/api/analysis/parse-free-workout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ workoutId }),
        }).catch(() => { /* 解析失败不影响主流程 */ });
      }
      router.push(workoutId ? `/summary?id=${workoutId}` : '/summary');
    } catch (e) {
      logger.error('保存自由记录失败:', e);
      toast({ message: '保存失败，请重试', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /** 完成恢复训练并保存 */
  const finishRecoveryWorkout = async () => {
    const { duration: snapshotDuration } = storeStopTraining();
    setIsLoading(true);
    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exercises: [],
          totalVolume: 0,
          duration: snapshotDuration,
          notes: `恢复训练：${recoveryPlan?.focusLabel ?? '放松恢复'}`,
        }),
      });
      if (response.status === 401) { router.push('/auth/signin'); return; }
      if (!response.ok) { toast({ message: '保存失败，请重试', type: 'error' }); return; }
      const recoveryJson = await response.json();
      const recoveryWorkoutId = recoveryJson.data?.workout?.id ?? recoveryJson.data?.id;
      if (userId) removeUserStorageItem(userId, 'pending_workout');
      setIsLoading(false);
      setCompletionSummary({
        emoji: '🧘',
        heading: '恢复完成 ✨',
        lines: [
          '身体放松了一点',
          '今天也照顾到了身体',
        ],
        ctaLabel: '查看训练总结',
        onCta: () => router.push(recoveryWorkoutId ? `/summary?id=${recoveryWorkoutId}` : '/'),
      });
      return;
    } catch (e) {
      logger.error('保存恢复训练失败:', e);
      toast({ message: '保存失败，请重试', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };




  const logSet = () => {
    if (!currentExercise || !reps) { toast({ message: '请填写所有字段', type: 'error' }); return; }
    if (!isBodyweight && !weight) { toast({ message: '请填写所有字段', type: 'error' }); return; }
    const prevSetCount = exercises.find(e => e.name === currentExercise)?.sets.length ?? 0;
    if (sessionPhase === 'idle') {
      storeStartTraining();
    }
    
    // 检查动作是否在动作库中，如果不在，添加到自定义动作列表
    if (!exerciseCache.has(currentExercise) && !exerciseCache.has(currentExercise.split(' (')[0]) && !customExercises.includes(currentExercise)) {
      setCustomExercises(prev => [...prev, currentExercise]);
    }
    
    const rirValue = rir ? Number(rir) : null;
    const newSet: Set = {
      weight: isBodyweight ? 0 : Number(weight), reps: Number(reps), rir: rirValue,
      isFailure: rirValue === 0,
      estimated1RM: isBodyweight ? 0 : Number(weight) * (1 + Number(reps) / 30),
      isBodyweight: isBodyweight,
      completed: true // 直接标记为已完成
    };
    
    // 添加到 completedSets
    setCompletedSets(prev => [...prev, {
      weight: isBodyweight ? 0 : Number(weight),
      reps: Number(reps),
      rir: rirValue,
      isBodyweight: isBodyweight
    }]);
    
    const setVolume = isBodyweight ? 0 : newSet.weight * newSet.reps;
    setExercises(prev => {
      const existing = prev.find(e => e.name === currentExercise);
      if (existing) {
        return prev.map(e =>
          e.name === currentExercise
            ? { ...e, sets: [...e.sets, newSet], totalVolume: e.totalVolume + setVolume }
            : e
        );
      }
      return [...prev, {
        id: Date.now().toString(), name: currentExercise,
        sets: [newSet], restTime: Number(restTime),
        totalVolume: setVolume,
        startedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      }];
    });
    
    storeIncrementSets();
    // 自动触发休息倒计时 (store.startRest sets endAt for lock-screen recovery)
    storeStartRest(Number(restTime));
    // Brief set-completion feedback (A4)
    const feedbackMsg = `✓ 第 ${prevSetCount + 1} 组完成`;
    startTransition(() => setSetFeedback(feedbackMsg));
    setTimeout(() => startTransition(() => setSetFeedback(null)), 1800);
    // 保持重量和次数输入框的值，方便用户直接开始下一组训练
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) { toast({ message: '请至少添加一组训练', type: 'error' }); return; }
    
    const { duration: snapshotDuration } = storeStopTraining();
    const totalSetsCompleted = exercises.reduce((s, e) => s + e.sets.length, 0);
    const uniqueExercisesCount = exercises.filter(e => e.sets.length > 0).length;
    const durationMin = Math.round(snapshotDuration / 60);
    setIsLoading(true);

    // ── Personalization: increment local usage counts for each exercise ──
    try {
      const usageRaw = localStorage.getItem('fitcoach:exercise-usage');
      const usageCounts: Record<string, number> = usageRaw ? JSON.parse(usageRaw) : {};
      exercises.filter(e => e.sets.length > 0).forEach(e => {
        usageCounts[e.name] = (usageCounts[e.name] ?? 0) + 1;
      });
      localStorage.setItem('fitcoach:exercise-usage', JSON.stringify(usageCounts));
    } catch { /* non-critical, ignore */ }

    // 暂存训练数据到 localStorage（登录超时后数据不丢失）
    if (userId) setUserStorageItem(userId, 'pending_workout', JSON.stringify({
      exercises,
      trainingDuration: snapshotDuration,
      trainingNotes
    }));
    
    try {
      const exercisesWithMuscleGroups = exercises.map(ex => {
        const cached = exerciseCache.get(ex.name);
        const isWarmupEx = cached?.category === 'stretching' || (cached?.category === 'cardio' && ex.sets.length === 0);
        const sets = ex.sets.length > 0
          ? ex.sets.map(set => ({
              weight: set.weight,
              reps: set.reps,
              rir: set.rir,
              restTime: ex.restTime,
            }))
          : isWarmupEx
            ? [{ weight: 0, reps: 1, rir: null, isWarmup: true, restTime: ex.restTime }]
            : [];
        return { name: ex.name, muscleGroup: getExerciseMuscleGroup(ex.name), sets };
      }).filter(ex => ex.sets.length > 0);
      
      const totalVolume = exercises.reduce((sum, e) => sum + e.totalVolume, 0);
      
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exercises: exercisesWithMuscleGroups,
          totalVolume: totalVolume,
          duration: snapshotDuration,
          notes: trainingNotes
        }),
        credentials: "include"
      });
      
      if (response.status === 401) {
        logger.warn("User not authenticated for saving workout");
        router.push('/auth/signin');
        return;
      } else if (!response.ok) {
        const errorText = await response.text();
        logger.warn("Workout save API warning:", errorText);
        toast({ message: '保存训练记录失败，请重试', type: 'error' });
      } else {
        const json = await response.json();
        const payload = json.data;
        const workoutId = payload?.workout?.id;
        if (!workoutId) {
          logger.warn('Workout save response missing data.workout.id', json);
          toast({ message: '保存训练记录失败，请重试', type: 'error' });
          return;
        }

        if (userId) removeUserStorageItem(userId, 'pending_workout');
        if (userId) removeUserStorageItem(userId, 'workout_session');
        setIsLoading(false);
        setCompletionSummary({
          emoji: '🎯',
          heading: '今日训练完成',
          lines: [
            `今天完成了 ${uniqueExercisesCount} 个动作`,
            `共 ${totalSetsCompleted} 组 · ${durationMin} 分钟`,
            '坚持比完美更重要',
            '明天继续保持节奏',
          ],
          ctaLabel: '查看训练总结',
          onCta: () => router.push(`/summary?id=${workoutId}`),
        });
        return;
      }
    } catch (error) {
      logger.error('Error finishing workout:', error);
      toast({ message: '保存训练记录失败，请重试', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Inline selection screen (shown before any training type is chosen) ──
  // NOTE: deliberately NOT gated on dbExercisesLoaded to avoid the flash where the
  // strength UI briefly renders before the exercise library finishes loading.
  const urlHasMode = !!(searchParams.get('mg') || searchParams.get('mode'));
  const showSelectionScreen = !trainingType && storeSessionPhase === 'idle' && !urlHasMode;

  if (showSelectionScreen) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <AmbientGlow />
        <div className="relative flex flex-col flex-1 px-4 pt-5 pb-8 sm:max-w-sm md:max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <button onClick={() => router.push('/')}
              className="p-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black">今天练什么？</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>选择训练模式开始记录</p>
            </div>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4 flex-1">
            {/* 力量训练 */}
            <button
              onClick={() => handleTrainingTypeSelect('strength')}
              className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: 'var(--accent-dim)' }}>💪</div>
                <div className="flex-1">
                  <p className="text-lg font-black">力量训练</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-low)' }}>
                    组数 · 次数 · 重量 · RIR
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-glow)' }} />
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {['胸部', '背部', '腿部', '肩膀', '手臂'].map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{g}</span>
                ))}
              </div>
            </button>

            {/* 有氧训练 */}
            <button
              onClick={() => setShowCardioSetup(true)}
              className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
              style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: 'rgba(96,165,250,0.1)' }}>🏃</div>
                <div className="flex-1">
                  <p className="text-lg font-black">有氧训练</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-low)' }}>
                    自动计算距离与卡路里消耗
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'rgba(96,165,250,0.5)' }} />
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(96,165,250,0.1)', color: 'rgba(96,165,250,0.8)' }}>🏃 跑步机</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(96,165,250,0.1)', color: 'rgba(96,165,250,0.8)' }}>🧗 爬楼机</span>
              </div>
            </button>

            {/* 自由记录 */}
            <button
              onClick={() => handleTrainingTypeSelect('free')}
              className="w-full text-left rounded-3xl p-6 transition-all active:scale-[0.98]"
              style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: 'rgba(168,85,247,0.1)' }}>📝</div>
                <div className="flex-1">
                  <p className="text-lg font-black">自由记录</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-low)' }}>
                    自由填写内容，灵活记录
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'rgba(168,85,247,0.5)' }} />
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {['拉伸', '康复训练', '体能测试', '其他运动'].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(168,85,247,0.1)', color: 'rgba(168,85,247,0.8)' }}>{t}</span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Cardio Setup Modal */}
        <TrainingTypeModal
          isOpen={showCardioSetup}
          initialStep="cardio"
          onSelect={handleTrainingTypeSelect}
          onClose={() => setShowCardioSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:p-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Ambient glow */}
      <AmbientGlow />

      <div className="relative max-w-3xl mx-auto"
        style={{ animation: 'page-enter 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (storeSessionPhase !== 'idle') { setShowExitModal(true); return; }
                router.push('/');
              }}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black">训练中</h1>
              {planDayName && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-low)' }}>
                  <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  {planDayName}
                </div>
              )}
              <WorkoutHeaderTimer />
            </div>
          </div>
          {trainingType === 'strength' && exercises.some(e => e.sets.length > 0) && (
            <button
              onClick={finishWorkout}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl font-bold text-sm text-black transition-all"
              style={{ background: 'var(--accent)', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? '保存中…' : '完成训练'}
            </button>
          )}
        </div>




        <>
            {/* 肌群动作列表（从热力图点击进入时展示） */}
            {muscleExercises.length > 0 && (
              <div className="rounded-2xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setMuscleListExpanded(!muscleListExpanded)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-bold">{muscleGroupLabel}动作（{muscleExercises.length}）</span>
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform"
                    style={{ color: 'var(--text-low)', transform: muscleListExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {muscleListExpanded && (
                  <div className="px-4 pb-4 space-y-1.5">
                    {muscleExercises.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => selectExercise(ex.name)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] text-left"
                        style={{
                          background: currentExercise === ex.name ? 'var(--accent-dim)' : 'var(--surface-2)',
                          border: currentExercise === ex.name ? '1px solid var(--border)' : '1px solid transparent',
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium">{ex.name}</span>
                        {currentExercise === ex.name && (
                          <Check className="w-4 h-4 ml-auto" style={{ color: 'var(--accent)' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 恢复训练 UI (C: calm guided flow) ───────────────── */}
            {trainingType === 'free' && recoveryPlan && (() => {
              const steps = recoveryPlan.steps;
              const currentStep = steps[recoveryStepIdx];
              const isLastStep = recoveryStepIdx >= steps.length - 1;
              const stepDurLabel = currentStep
                ? (currentStep.durationSec >= 60
                    ? `${Math.round(currentStep.durationSec / 60)} 分钟`
                    : `${currentStep.durationSec} 秒`)
                : '';
              return (
                <div className="rounded-3xl mb-6 overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(52,211,153,0.2)' }}>

                  {/* Top: focus label + session timer */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧘</span>
                      <span className="text-sm font-semibold" style={{ color: '#34D399' }}>
                        {recoveryPlan.focusLabel}
                      </span>
                    </div>
                    <LiveDuration className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-low)' }} />
                  </div>

                  {/* Hero: large step name — key causes fade-up on each step change */}
                  <div key={recoveryStepIdx} className="px-5 py-8 text-center"
                    style={{
                      background: 'rgba(52,211,153,0.04)',
                      borderTop: '1px solid rgba(52,211,153,0.08)',
                      borderBottom: '1px solid rgba(52,211,153,0.08)',
                      animation: 'p3-fade-up 0.35s ease-out',
                    }}>
                    <p className="font-black leading-tight mb-3"
                      style={{ color: '#34D399', fontSize: '2rem' }}>
                      {currentStep?.name ?? '准备开始'}
                    </p>
                    {stepDurLabel && (
                      <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
                        {stepDurLabel}
                      </span>
                    )}
                    {currentStep?.description && (
                      <p className="text-sm leading-relaxed max-w-xs mx-auto"
                        style={{ color: 'var(--text-low)' }}>
                        {currentStep.description}
                      </p>
                    )}
                    {/* B: Breathing rhythm indicator — subtle expanding circle */}
                    <div className="flex justify-center mt-5">
                      <div className="rounded-full pointer-events-none"
                        style={{
                          width: 36, height: 36,
                          background: 'rgba(52,211,153,0.06)',
                          border: '1px solid rgba(52,211,153,0.18)',
                          animation: 'p3-breathe 4s ease-in-out infinite',
                        }} />
                    </div>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    {steps.map((_, i) => (
                      <div key={i} className="rounded-full transition-all duration-300"
                        style={{
                          width:  i === recoveryStepIdx ? 20 : 6,
                          height: 6,
                          background: i < recoveryStepIdx
                            ? 'rgba(52,211,153,0.4)'
                            : i === recoveryStepIdx
                              ? '#34D399'
                              : 'var(--surface-3)',
                        }}
                      />
                    ))}
                    <span className="text-xs ml-2" style={{ color: 'var(--text-low)' }}>
                      {recoveryStepIdx + 1} / {steps.length}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    {isLastStep ? (
                      <button
                        onClick={finishRecoveryWorkout}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-base transition-all"
                        style={{ background: '#34D399', color: '#000', opacity: isLoading ? 0.6 : 1, boxShadow: '0 0 24px rgba(52,211,153,0.25)' }}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {isLoading ? '保存中…' : '恢复完成'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setRecoveryStepIdx(p => p + 1)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-base transition-all active:scale-[0.98]"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <ChevronRight className="w-5 h-5" />
                        下一个动作
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── 自由记录 UI ─────────────────────────────── */}
            {trainingType === 'free' && !recoveryPlan && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    <div>
                      <div className="text-base font-black">自由记录</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>计时中，随时记录</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <LiveDuration className="text-3xl font-black tabular-nums" style={{ color: '#A855F7' }} />
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>进行中</div>
                  </div>
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['拉伸', '核心训练', '康复', '体能测试', '其他'].map(tag => (
                    <button key={tag} onClick={() => setFreeNotes(p => p ? `${p}\n${tag}` : tag)}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all active:scale-95"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  placeholder="记录今天的训练内容…&#10;例：进行了 20 分钟拉伸，重点放松了大腿后侧"
                  value={freeNotes}
                  onChange={e => setFreeNotes(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none mb-4"
                  style={{ background: 'var(--surface-2)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--foreground)' }}
                />

                <button onClick={finishFreeWorkout} disabled={isLoading || !freeNotes.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-black text-base transition-all"
                  style={{ background: '#A855F7', color: '#fff', opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {isLoading ? '保存中…' : '完成记录'}
                </button>
              </div>
            )}

            {/* ── 有氧训练 UI (B: live-activity layout) ───────────────── */}
            {trainingType && trainingType !== 'strength' && trainingType !== 'free' && (() => {
              const isTreadmill = trainingType === 'treadmill';
              const accentColor = isTreadmill ? '#60A5FA' : '#FBBF24';
              const accentRgb   = isTreadmill ? '96,165,250' : '251,191,36';
              const stepSpeed   = (d: number) => setCardioParams(p => ({ ...p, speed:   Math.max(0, Math.round((p.speed + d)   * 10) / 10) }));
              const stepIncline = (d: number) => setCardioParams(p => ({ ...p, incline: Math.max(0, Math.round((p.incline + d) * 10) / 10) }));
              const stepLevel   = (d: number) => setCardioParams(p => ({ ...p, level:   Math.max(0, p.level + d) }));

              const BigStepBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
                <button onClick={onClick}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-90"
                  style={{ background: `rgba(${accentRgb},0.12)`, color: accentColor, border: `1px solid rgba(${accentRgb},0.2)` }}>
                  {label}
                </button>
              );

              return (
                <div className="rounded-3xl p-5 mb-6" style={{ background: 'var(--surface)', border: `1px solid rgba(${accentRgb},0.2)` }}>

                  {/* ① Activity badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{CARDIO_ICONS[trainingType]}</span>
                      <span className="text-base font-black">{CARDIO_LABELS[trainingType]}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: `rgba(${accentRgb},0.12)`, color: accentColor }}>
                      进行中
                    </span>
                  </div>

                  {/* ② Hero timer: large digits + progress ring + breathing glow */}
                  <CardioTimerDisplay
                    accentColor={accentColor}
                    accentRgb={accentRgb}
                    targetMin={cardioTargetMin}
                  />

                  {/* ③ Live 2×2 stats grid */}
                  <CardioStatsGrid
                    trainingType={trainingType}
                    speed={cardioParams.speed}
                    incline={cardioParams.incline}
                    level={cardioParams.level}
                  />

                  {/* ④ Touch-friendly steppers */}
                  {isTreadmill ? (
                    <div className="flex flex-col gap-3 mb-5">
                      <div className="rounded-2xl px-4 py-4" style={{ background: 'var(--surface-2)', border: `1px solid rgba(${accentRgb},0.12)` }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold w-14 shrink-0" style={{ color: accentColor }}>速度</span>
                          <div className="flex items-center gap-4 flex-1 justify-end">
                            <BigStepBtn onClick={() => stepSpeed(-0.5)} label="−" />
                            <div className="flex items-baseline gap-1 min-w-0">
                              <span className="font-black text-3xl tabular-nums" style={{ color: accentColor }}>
                                {cardioParams.speed.toFixed(1)}
                              </span>
                              <span className="text-sm" style={{ color: `rgba(${accentRgb},0.5)` }}>km/h</span>
                            </div>
                            <BigStepBtn onClick={() => stepSpeed(0.5)} label="+" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl px-4 py-4" style={{ background: 'var(--surface-2)', border: `1px solid rgba(${accentRgb},0.12)` }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold w-14 shrink-0" style={{ color: accentColor }}>坡度</span>
                          <div className="flex items-center gap-4 flex-1 justify-end">
                            <BigStepBtn onClick={() => stepIncline(-0.5)} label="−" />
                            <div className="flex items-baseline gap-1 min-w-0">
                              <span className="font-black text-3xl tabular-nums" style={{ color: accentColor }}>
                                {cardioParams.incline.toFixed(1)}
                              </span>
                              <span className="text-sm" style={{ color: `rgba(${accentRgb},0.5)` }}>%</span>
                            </div>
                            <BigStepBtn onClick={() => stepIncline(0.5)} label="+" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="rounded-2xl px-4 py-4" style={{ background: 'var(--surface-2)', border: `1px solid rgba(${accentRgb},0.12)` }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold w-14 shrink-0" style={{ color: accentColor }}>档位</span>
                          <div className="flex items-center gap-4 flex-1 justify-end">
                            <BigStepBtn onClick={() => stepLevel(-1)} label="−" />
                            <div className="flex items-baseline gap-1 min-w-0">
                              <span className="font-black text-3xl tabular-nums" style={{ color: accentColor }}>
                                {cardioParams.level}
                              </span>
                              <span className="text-sm" style={{ color: `rgba(${accentRgb},0.5)` }}>档</span>
                            </div>
                            <BigStepBtn onClick={() => stepLevel(1)} label="+" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⑤ Optional HR + notes (secondary, small) */}
                  <div className="flex gap-2 mb-5">
                    <input type="number" inputMode="numeric" placeholder="心率 bpm"
                      value={cardioAvgHR} onChange={e => setCardioAvgHR(e.target.value)}
                      className="w-28 rounded-xl px-3 py-2 text-xs"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                    <input type="text" placeholder="备注（可选）"
                      value={cardioNotes} onChange={e => setCardioNotes(e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 text-xs"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>

                  {/* ⑥ Single CTA — no "set" language anywhere */}
                  <CardioFinishBtn
                    trainingType={trainingType}
                    speed={cardioParams.speed}
                    incline={cardioParams.incline}
                    level={cardioParams.level}
                    isLoading={isLoading}
                    onFinish={finishCardioWorkout}
                  />
                </div>
              );
            })()}

            {/* ── A1: Today's plan header — collapses after first set ── */}
            {trainingType === 'strength' && (
              <>
                <WarmupPanel
                  muscleGroup={workoutMuscleGroup ?? undefined}
                  onComplete={() => startTransition(() => setWarmupDone(true))}
                  onSkip={() => startTransition(() => setWarmupDone(true))}
                />
                <ExerciseQuickLauncher
                  muscleGroup={workoutMuscleGroup ?? undefined}
                  muscleGroupLabel={muscleGroupLabel || undefined}
                  userId={userId ?? undefined}
                  onSelectExercise={name => {
                    guardedSelectExercise(name);
                    if (sessionPhase === 'idle' && !isTimedCdActive) storeStartTraining();
                  }}
                  onOpenSearch={() => {
                    if (isTimedCdActive) {
                      setCdGuardPending('\x00__search__');
                      return;
                    }
                    const back = `/workout${workoutMuscleGroup ? `?mg=${workoutMuscleGroup}` : ''}`;
                    router.push(`/exercises?mode=select&back=${encodeURIComponent(back)}`);
                  }}
                />
              </>
            )}

            {/* ── A4: Feedback banners (exercise transition takes priority over set feedback) ── */}
            {exerciseTransition ? (
              <div className="rounded-xl px-4 py-3 mb-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', animation: 'p3-fade-up 0.3s ease-out' }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm">✅</span>
                  <span className="text-sm font-black">{exerciseTransition.prev} 完成</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-low)' }}>下一项：</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{exerciseTransition.next}</span>
                </div>
              </div>
            ) : setFeedback ? (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl mb-3"
                style={{ background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)' }}>
                <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>{setFeedback}</span>
              </div>
            ) : null}


            {(trainingType === 'strength' || !trainingType) && (
              <ActiveExerciseCard
                currentExercise={currentExercise}
                weight={weight}
                reps={reps}
                rir={rir}
                isBodyweight={isBodyweight}
                restTime={restTime}
                lastRecord={lastExerciseRecord}
                completedSetsCount={exercises.find(e => e.name === currentExercise)?.sets.length ?? 0}
                exerciseIndex={Math.max(savedExercises.indexOf(currentExercise), 0)}
                totalExercises={savedExercises.length}
                onWeightChange={setWeight}
                onRepsChange={setReps}
                onRirChange={setRir}
                onBodyweightToggle={() => setIsBodyweight(p => !p)}
                onRestTimeChange={setRestTime}
                onLogSet={logSet}
                onChangeExercise={() => router.push('/exercises?mode=select')}
                isLoading={isLoading}
                hint={hint ?? undefined}
                isTimed={isCurrentExerciseTimed}
                onCdActiveChange={setIsTimedCdActive}
              />
            )}

            {/* ── Session history: completed exercises below input card ── */}
            {trainingType === 'strength' && (() => {
              const doneExs = exercises.filter(e => e.sets.length > 0);
              if (doneExs.length === 0) return null;
              return (
                <div className="mt-4 space-y-2">
                  {doneExs.map(ex => {
                    const exBaseName = ex.name.split(' (')[0];
                    const exIsTimed = TIMED_EXERCISES.has(exBaseName) || exerciseCache.get(exBaseName)?.category === 'stretching';
                    const vol = exIsTimed ? 0 : ex.sets.reduce((s, st) => s + (st.isBodyweight ? 0 : st.weight * st.reps), 0);
                    return (
                      <div key={ex.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.72 }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(52,211,153,0.12)' }}>
                          <span className="text-xs" style={{ color: '#34D399' }}>✓</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-med)' }}>
                            {exBaseName}
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-low)' }}>
                            {ex.sets.map((s, i) => (
                              <span key={i}>{i > 0 ? ' · ' : ''}
                                {exIsTimed ? `${s.reps}秒` : (s.isBodyweight ? `${s.reps}次` : `${s.weight}×${s.reps}`)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {vol > 0 && (
                            <span className="text-xs tabular-nums" style={{ color: 'var(--text-low)' }}>
                              {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
                            </span>
                          )}
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                            {ex.sets.length}组
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Finish */}
            {exercises.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={finishWorkout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-base text-black transition-all"
                  style={{ background: 'var(--accent)', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      完成训练
                    </>
                  )}
                </button>
              </div>
            )}
          {/* 训练备注（可选） */}
          <details className="mb-6 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
              style={{ background: 'var(--surface)', listStyle: 'none' }}>
              <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-low)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-low)' }}>训练备注（可选）</span>
              {trainingNotes && <span className="text-xs ml-auto" style={{ color: 'var(--accent)' }}>{trainingNotes.length} 字</span>}
            </summary>
            <textarea
              value={trainingNotes}
              onChange={(e) => setTrainingNotes(e.target.value)}
              placeholder="记录感受、遇到的问题、下次注意事项…"
              rows={4}
              className="w-full px-4 py-3 text-sm resize-none outline-none"
              style={{ background: 'var(--surface-2)', color: 'var(--foreground)', borderTop: '1px solid var(--border)' }}
            />
          </details>
        </>


        {/* ── 动作详情弹窗 ─────────────────────────────────────── */}
        {detailExerciseName && (() => {
          const detail = exerciseCache.get(detailExerciseName);
          const steps = detail?.instructions ? detail.instructions.split('\n').filter(s => s.trim()) : [];
          const tips = detail?.tips ?? [];
          const mistakes = detail?.mistakes ?? [];
          const desc = detail?.description ?? '';
          // description 第一行是 "英文：Xxx\n…"，取第二行之后作摘要显示
          const descLines = desc.split('\n');
          const enLine = descLines[0]?.startsWith('英文：') ? descLines[0] : null;
          const summary = descLines.slice(enLine ? 1 : 0).join(' ');
          return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
              onClick={() => setDetailExerciseName(null)}>
              <div className="w-full max-w-lg rounded-3xl flex flex-col"
                style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', maxHeight: '88vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 sticky top-0"
                  style={{ background: '#0d0d0d', borderBottom: '1px solid #1f1f1f' }}>
                  <div>
                    <h2 className="text-base font-black text-foreground">{detailExerciseName.split(' (')[0]}</h2>
                    {summary && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{summary}</p>
                    )}
                  </div>
                  <button onClick={() => setDetailExerciseName(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#1a1a1a' }}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {/* 英文原名 */}
                  {enLine && (
                    <p className="text-xs" style={{ color: 'var(--text-low)' }}>{enLine}</p>
                  )}
                  {/* 分步指导 */}
                  {steps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <h3 className="text-sm font-bold text-foreground">分步指导</h3>
                      </div>
                      <ol className="space-y-2">
                        {steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 rounded-xl p-3"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{i + 1}</span>
                            <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.trim()}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {/* 训练提示（次要肌群/拉伸要点） */}
                  {tips.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <h3 className="text-xs font-bold" style={{ color: 'var(--text-med)' }}>协同肌群</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tips.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
                            {MUSCLE_GROUP_MAP[t] ?? t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 常见错误 */}
                  {mistakes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-med)' }}>⚠ 常见错误</span>
                      </div>
                      <ul className="space-y-1.5">
                        {mistakes.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-med)' }}>
                            <span style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5">•</span>
                            <span>{MUSCLE_GROUP_MAP[m] ?? m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* 无内容兜底 */}
                  {steps.length === 0 && tips.length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--text-low)' }}>
                      暂无详情，请参考教练指导
                    </p>
                  )}
                  <button onClick={() => setDetailExerciseName(null)}
                    className="w-full rounded-2xl py-3.5 text-sm font-black text-black"
                    style={{ background: 'var(--accent)' }}>
                    知道了
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Cardio Setup Modal (有氧子选择) */}
        <TrainingTypeModal
          isOpen={showCardioSetup}
          initialStep="cardio"
          onSelect={handleTrainingTypeSelect}
          onClose={() => setShowCardioSetup(false)}
        />

      </div>

      {/* Rest overlay moved to global RestBar in ClientProviders — no full-screen overlay here */}

      {/* ── Countdown guard modal (chip-select during timed countdown) ── */}
      {cdGuardPending && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCdGuardPending(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <span style={{ fontSize: '2rem' }}>⏱</span>
            <div className="text-center">
              <p className="font-black text-base" style={{ color: 'var(--text-high)' }}>正在计时中</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-low)' }}>
                {cdGuardPending === '\x00__search__'
                  ? '坚持住！确定要离开去动作库吗？'
                  : <>坚持住！确定要切换到 <span className="font-bold">{cdGuardPending.split(' (')[0]}</span> 吗？</>}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'var(--surface-3)', color: 'var(--text-med)', touchAction: 'manipulation' }}
                onClick={() => setCdGuardPending(null)}
              >
                继续坚持
              </button>
              <button
                className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipulation' }}
                onClick={() => {
                  const target = cdGuardPending;
                  setCdGuardPending(null);
                  if (target === '\x00__search__') {
                    const back = `/workout${workoutMuscleGroup ? `?mg=${workoutMuscleGroup}` : ''}`;
                    router.push(`/exercises?mode=select&back=${encodeURIComponent(back)}`);
                  } else if (target) {
                    void selectExercise(target);
                    if (sessionPhase === 'idle') storeStartTraining();
                  }
                }}
              >
                放弃切换
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── F: Mode-entry intro overlay (auto-dismissed after ~1.6s) ── */}
      {introContent && (
        <IntroOverlay
          visible={introVisible}
          emoji={introContent.emoji}
          title={introContent.title}
          subtitle={introContent.subtitle}
        />
      )}

      {/* ── D: Mode-specific completion summary overlay ── */}
      {completionSummary && (
        <CompletionSummaryOverlay
          visible={true}
          emoji={completionSummary.emoji}
          heading={completionSummary.heading}
          lines={completionSummary.lines}
          ctaLabel={completionSummary.ctaLabel}
          onCta={completionSummary.onCta}
        />
      )}

      {/* ── Exit confirmation modal ── */}
      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowExitModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--border)' }} />
            <p className="text-base font-bold text-center mb-1" style={{ color: 'var(--foreground)' }}>
              训练正在进行中
            </p>
            <p className="text-xs text-center mb-7" style={{ color: 'var(--text-low)' }}>
              计时器将在后台持续运行，随时可回来继续
            </p>

            {/* 继续训练 */}
            <button
              onClick={() => setShowExitModal(false)}
              className="w-full py-3.5 rounded-2xl text-sm font-bold mb-3 transition-all active:scale-[0.98]"
              style={{ background: 'var(--color-accent)', color: 'var(--accent-text)' }}
            >
              继续训练
            </button>

            {/* 离开一会 */}
            <button
              onClick={() => { setShowExitModal(false); router.push('/'); }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-3 transition-all active:scale-[0.98]"
              style={{ background: 'var(--surface-2)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              离开一会
              <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-low)' }}>计时器继续运行</span>
            </button>

            {/* 放弃训练 */}
            <button
              onClick={() => {
                storeStopTraining();
                if (userId) removeUserStorageItem(userId, 'workout_session');
                setShowExitModal(false);
                router.push('/');
              }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              放弃训练
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    }>
      <WorkoutContent />
    </Suspense>
  );
}
