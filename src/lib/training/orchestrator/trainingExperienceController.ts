// ── FitCoach Phase 4B — Training Experience Controller ────────────────────
// The Single Source of Truth for the entire training OS experience.
// Wires: state machine → signals → profile → rhythm → intensity → narrative → unified UI output.
//
// NO COMPONENT should derive training state independently.
// All UI reads from the output of this controller.

import type { TrainingOSState } from '../state/trainingStateMachine';
import { deriveOSState, getStateLabel, isInSession, isWorkingState } from '../state/trainingStateMachine';
import type { UnifiedSignalState } from '../signals/signalTypes';
import type { UserTrainingProfile } from '../profile/profileTypes';
import type { IdentityInsight } from '../fitnessIdentityEngine';
import type { FatigueSignal, ProgressionRecommendation, RecoverySuggestion, WarmupPlan, TrainingInsight, ContextualTip } from '../trainingTypes';
import type { SignalBackedRecommendation } from '../signals/signalTypes';
import type { CoachingCue } from '../behavioralCoachingEngine';
import type { ExerciseGrowthMetrics, OverallGrowth } from '../growthModelEngine';
import type { SessionNarrative } from '../narrative/trainingNarrativeEngine';
import { generateNarrative } from '../narrative/trainingNarrativeEngine';
import type { TrainingRhythm } from '../rhythm/trainingRhythmEngine';
import { computeRhythm } from '../rhythm/trainingRhythmEngine';
import type { ExperienceIntensity } from '../experience/experienceIntensity';
import { computeExperienceIntensity } from '../experience/experienceIntensity';

// ── Input ──────────────────────────────────────────────────────────────────

/**
 * Everything the controller needs from the outside world.
 * All sources are read-only snapshots.
 */
export interface TrainingOSInput {
  // Timer state (from workoutTimer zustand store)
  timer: {
    sessionPhase: 'idle' | 'active' | 'paused' | 'done';
    isRestActive: boolean;
    trainingDurationSec: number;
    totalSetsInSession: number;
  };

  // Session state (from workoutSession zustand store)
  session: {
    exercises: { name: string; sets: { completed: boolean; isWarmup?: boolean }[] }[];
    activeExerciseName: string;
    prCount: number;
  };

  // Phase 3 Intelligence (from useAdaptiveIntelligence)
  intelligence: {
    signalState: UnifiedSignalState;
    profile: UserTrainingProfile;
    identity: IdentityInsight;
    adaptiveProgression: SignalBackedRecommendation | null;
    fatigue: FatigueSignal | null;
    recovery: RecoverySuggestion[];
    recoveryStatus: string | null;
    warmup: WarmupPlan | null;
    insights: TrainingInsight[];
    contextualTips: ContextualTip[];
    coachingCues: CoachingCue[];
    readinessCue: CoachingCue | null;
    exerciseGrowth: ExerciseGrowthMetrics[];
    overallGrowth: OverallGrowth;
  };

  // Previous state (for transition detection)
  previousOSState?: TrainingOSState | null;
  previousNarrativeAt?: number;
}

// ── Output ─────────────────────────────────────────────────────────────────

/** A unified display item — the ONLY thing UI components render. */
export interface OSDisplayItem {
  id: string;
  type: 'badge' | 'status' | 'chip' | 'narrative' | 'progression' | 'warmup' | 'tip';
  /** The text to display. */
  text: string;
  /** Visual style hint. */
  variant: 'neutral' | 'positive' | 'attention' | 'critical' | 'subtle';
  /** Why this item is showing (for debugging / explainability). */
  source: string;
  /** Higher = more important. UI sorts by this. */
  priority: number;
  /** Optional action text. */
  action?: string;
}

export interface TrainingOSOutput {
  // Core state
  osState: TrainingOSState;
  previousOSState: TrainingOSState | null;
  stateLabel: string;
  isInSession: boolean;
  isWorkingState: boolean;

  // Rhythm & intensity
  rhythm: TrainingRhythm;
  intensity: ExperienceIntensity;

  // Narrative
  narrative: SessionNarrative | null;

  // Unified UI display items (sorted by priority)
  displayItems: OSDisplayItem[];

  // Raw intelligence (for advanced consumers)
  fatigue: FatigueSignal | null;
  progression: SignalBackedRecommendation | null;
  adaptiveProgression: SignalBackedRecommendation | null;
  warmup: WarmupPlan | null;
  recoveryStatus: string | null;
  overallConfidence: number;
}

// ── Controller ─────────────────────────────────────────────────────────────

/**
 * The single function that drives the entire Training OS experience.
 * Call this whenever any input changes. Returns the complete UI state.
 */
export function computeTrainingOS(input: TrainingOSInput): TrainingOSOutput {
  const { timer, session, intelligence, previousOSState = null } = input;

  // 1. Derive canonical OS state
  const activeExercise = session.exercises.find((e) => e.name === session.activeExerciseName);
  const currentExerciseSetCount = activeExercise?.sets.length ?? 0;
  const currentExerciseCompletedSetCount = activeExercise?.sets.filter((s) => s.completed).length ?? 0;

  const osState = deriveOSState({
    timerSessionPhase: timer.sessionPhase,
    isRestActive: timer.isRestActive,
    hasExercises: session.exercises.length > 0,
    activeExerciseName: session.activeExerciseName,
    currentExerciseSetCount,
    currentExerciseCompletedSetCount,
    isSessionFinishing: timer.sessionPhase === 'done',
  });

  // 2. Compute rhythm
  const intensity = computeExperienceIntensity(osState, intelligence.fatigue, intelligence.identity.identity);
  const rhythm = computeRhythm(
    osState,
    intensity,
    currentExerciseCompletedSetCount,
    timer.totalSetsInSession
  );

  // 3. Generate narrative
  const narrative = generateNarrative(
    osState,
    previousOSState,
    rhythm,
    intelligence.fatigue,
    intelligence.identity,
    intelligence.readinessCue,
    timer.trainingDurationSec,
    timer.totalSetsInSession,
    session.prCount
  );

  // 4. Build unified display items
  const displayItems = buildDisplayItems(osState, intensity, rhythm, narrative, intelligence, activeExercise);

  return {
    osState,
    previousOSState,
    stateLabel: getStateLabel(osState),
    isInSession: isInSession(osState),
    isWorkingState: isWorkingState(osState),
    rhythm,
    intensity,
    narrative,
    displayItems,
    fatigue: intelligence.fatigue,
    progression: intelligence.adaptiveProgression,
    adaptiveProgression: intelligence.adaptiveProgression,
    warmup: intelligence.warmup,
    recoveryStatus: intelligence.recoveryStatus,
    overallConfidence: intelligence.signalState.overallConfidence,
  };
}

// ── Display Item Builder ─────────────────────────────────────────────────────

function buildDisplayItems(
  osState: TrainingOSState,
  intensity: ExperienceIntensity,
  rhythm: TrainingRhythm,
  narrative: SessionNarrative | null,
  intelligence: TrainingOSInput['intelligence'],
  activeExercise: TrainingOSInput['session']['exercises'][number] | undefined
): OSDisplayItem[] {
  const items: OSDisplayItem[] = [];
  let priority = 100;

  // 1. Narrative (highest priority when present)
  if (narrative) {
    items.push({
      id: 'narrative',
      type: 'narrative',
      text: narrative.text,
      variant: narrative.mood === 'cautious' ? 'attention' : narrative.mood === 'triumphant' ? 'positive' : 'neutral',
      source: 'narrative',
      priority: priority--,
    });
  }

  // 2. Readiness cue (entry phase)
  if (osState === 'preparing' && intelligence.readinessCue) {
    items.push({
      id: 'readiness',
      type: 'status',
      text: intelligence.readinessCue.text,
      variant: intelligence.readinessCue.priority === 'high' ? 'attention' : 'neutral',
      source: 'readiness',
      priority: priority--,
    });
  }

  // 3. Fatigue banner (when in working state)
  if (intelligence.fatigue && isWorkingState(osState)) {
    const fatigueVariant: OSDisplayItem['variant'] =
      intelligence.fatigue.level === 'elevated' ? 'critical' :
      intelligence.fatigue.level === 'moderate' ? 'attention' : 'attention';
    items.push({
      id: 'fatigue',
      type: 'badge',
      text: intelligence.fatigue.reason,
      variant: fatigueVariant,
      source: 'fatigue',
      priority: priority--,
    });
  }

  // 4. Adaptive progression (when enabled)
  if (intensity.showProgression && intelligence.adaptiveProgression && isWorkingState(osState)) {
    items.push({
      id: 'progression',
      type: 'progression',
      text: intelligence.adaptiveProgression.text,
      variant: 'positive',
      source: 'adaptiveProgression',
      priority: priority--,
      action: intelligence.adaptiveProgression.action,
    });
  }

  // 5. Warmup (warming_up state)
  if (osState === 'warming_up' && intelligence.warmup) {
    items.push({
      id: 'warmup',
      type: 'warmup',
      text: `热身建议：${intelligence.warmup.sets.length} 组`,
      variant: 'neutral',
      source: 'warmup',
      priority: priority--,
    });
  }

  // 6. Coaching cues (capped by intensity)
  if (intensity.showCoaching && isWorkingState(osState)) {
    const cues = intelligence.coachingCues.slice(0, intensity.tipCap);
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      items.push({
        id: `coaching-${i}`,
        type: 'tip',
        text: cue.text,
        variant: cue.priority === 'high' ? 'attention' : 'neutral',
        source: 'coaching',
        priority: priority--,
      });
    }
  }

  // 7. Recovery status (always show if available)
  if (intelligence.recoveryStatus && osState !== 'completing') {
    items.push({
      id: 'recovery-status',
      type: 'status',
      text: intelligence.recoveryStatus,
      variant: 'subtle',
      source: 'recovery',
      priority: priority--,
    });
  }

  // 8. Contextual tips (capped by intensity)
  if (isWorkingState(osState)) {
    const tips = intelligence.contextualTips.slice(0, Math.max(0, intensity.tipCap - items.filter((i) => i.type === 'tip').length));
    for (let i = 0; i < tips.length; i++) {
      items.push({
        id: `tip-${i}`,
        type: 'tip',
        text: tips[i].text,
        variant: tips[i].urgency === 'alert' ? 'attention' : 'neutral',
        source: 'contextual',
        priority: priority--,
      });
    }
  }

  // 9. Insights (finish phase only, when enabled)
  if (intensity.showInsights && osState === 'completing') {
    const insights = intelligence.insights.slice(0, intensity.chipCap);
    for (let i = 0; i < insights.length; i++) {
      items.push({
        id: `insight-${i}`,
        type: 'chip',
        text: insights[i].text,
        variant: insights[i].severity === 'positive' ? 'positive' : insights[i].severity === 'attention' ? 'attention' : 'neutral',
        source: 'insight',
        priority: priority--,
      });
    }
  }

  // Sort by priority (highest first)
  return items.sort((a, b) => b.priority - a.priority);
}

// ── Helpers are imported at top of file ───────────────────────────────────
