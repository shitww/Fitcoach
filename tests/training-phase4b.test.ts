import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveOSState,
  isValidTransition,
  getPhaseGroup,
  getStateLabel,
  isInSession,
  isWorkingState,
} from "@/lib/training/state/trainingStateMachine";
import { computeExperienceIntensity } from "@/lib/training/experience/experienceIntensity";
import { computeRhythm, shouldRefreshTip, isFinalPushPhase } from "@/lib/training/rhythm/trainingRhythmEngine";
import { generateNarrative } from "@/lib/training/narrative/trainingNarrativeEngine";
import { computeTrainingOS } from "@/lib/training/orchestrator/trainingExperienceController";
import type { FatigueSignal } from "@/lib/training/trainingTypes";
import type { IdentityInsight } from "@/lib/training/fitnessIdentityEngine";

// ── State Machine ───────────────────────────────────────────────────────────

test("stateMachine: idle when timer is idle", () => {
  const state = deriveOSState({
    timerSessionPhase: "idle",
    isRestActive: false,
    hasExercises: false,
    activeExerciseName: "",
    currentExerciseSetCount: 0,
    currentExerciseCompletedSetCount: 0,
    isSessionFinishing: false,
  });
  assert.equal(state, "idle");
});

test("stateMachine: completing when timer is done", () => {
  const state = deriveOSState({
    timerSessionPhase: "done",
    isRestActive: false,
    hasExercises: true,
    activeExerciseName: "Bench Press",
    currentExerciseSetCount: 3,
    currentExerciseCompletedSetCount: 3,
    isSessionFinishing: true,
  });
  assert.equal(state, "completing");
});

test("stateMachine: preparing when no exercise selected", () => {
  const state = deriveOSState({
    timerSessionPhase: "active",
    isRestActive: false,
    hasExercises: false,
    activeExerciseName: "",
    currentExerciseSetCount: 0,
    currentExerciseCompletedSetCount: 0,
    isSessionFinishing: false,
  });
  assert.equal(state, "preparing");
});

test("stateMachine: resting when rest timer active", () => {
  const state = deriveOSState({
    timerSessionPhase: "active",
    isRestActive: true,
    hasExercises: true,
    activeExerciseName: "Bench Press",
    currentExerciseSetCount: 2,
    currentExerciseCompletedSetCount: 2,
    isSessionFinishing: false,
  });
  assert.equal(state, "resting");
});

test("stateMachine: warming_up with few sets", () => {
  const state = deriveOSState({
    timerSessionPhase: "active",
    isRestActive: false,
    hasExercises: true,
    activeExerciseName: "Bench Press",
    currentExerciseSetCount: 1,
    currentExerciseCompletedSetCount: 1,
    isSessionFinishing: false,
  });
  assert.equal(state, "warming_up");
});

test("stateMachine: active_set with enough sets", () => {
  const state = deriveOSState({
    timerSessionPhase: "active",
    isRestActive: false,
    hasExercises: true,
    activeExerciseName: "Bench Press",
    currentExerciseSetCount: 3,
    currentExerciseCompletedSetCount: 2,
    isSessionFinishing: false,
  });
  assert.equal(state, "active_set");
});

test("stateMachine: valid transitions", () => {
  assert.ok(isValidTransition("idle", "preparing"));
  assert.ok(isValidTransition("preparing", "warming_up"));
  assert.ok(isValidTransition("active_set", "resting"));
  assert.ok(!isValidTransition("idle", "active_set"));
});

test("stateMachine: phase groups", () => {
  assert.equal(getPhaseGroup("idle"), "entry");
  assert.equal(getPhaseGroup("warming_up"), "slow");
  assert.equal(getPhaseGroup("active_set"), "peak");
  assert.equal(getPhaseGroup("recovering"), "recovery");
  assert.equal(getPhaseGroup("completing"), "finish");
});

test("stateMachine: helpers", () => {
  assert.ok(isInSession("active_set"));
  assert.ok(!isInSession("idle"));
  assert.ok(isWorkingState("warming_up"));
  assert.ok(!isWorkingState("resting"));
  assert.equal(getStateLabel("idle"), "未开始");
});

// ── Experience Intensity ───────────────────────────────────────────────────

test("intensity: peak phase allows more UI", () => {
  const intensity = computeExperienceIntensity("active_set", null, "the_steady_climber");
  assert.equal(intensity.tipCap, 2);
  // steady_climber identity caps animation to 1 even in peak phase
  assert.equal(intensity.animationLevel, 1);
  assert.equal(intensity.visualNoise, "medium");
});

test("intensity: fatigue reduces UI density", () => {
  const fatigue: FatigueSignal = { level: "elevated", reason: "streak", suggestion: "rest" };
  const intensity = computeExperienceIntensity("active_set", fatigue, "the_steady_climber");
  assert.equal(intensity.tipCap, 1);
  assert.equal(intensity.chipCap, 1);
  assert.equal(intensity.animationLevel, 0);
  assert.equal(intensity.infoDensity, "minimal");
});

test("intensity: optimizer identity increases insights", () => {
  const intensity = computeExperienceIntensity("active_set", null, "the_optimizer");
  assert.equal(intensity.showProgression, true);
  assert.equal(intensity.showInsights, true);
  assert.equal(intensity.infoDensity, "rich");
});

test("intensity: comeback kid gets low noise", () => {
  const intensity = computeExperienceIntensity("active_set", null, "the_comeback_kid");
  assert.equal(intensity.animationLevel, 0);
  assert.equal(intensity.visualNoise, "low");
});

// ── Rhythm Engine ───────────────────────────────────────────────────────────

test("rhythm: entry phase favors narrative", () => {
  const rhythm = computeRhythm("preparing", { animationLevel: 1, chipCap: 2, tipCap: 1, infoDensity: "normal", showProgression: false, showInsights: true, showCoaching: true, visualNoise: "low" }, 0, 0);
  assert.equal(rhythm.phase, "entry");
  assert.equal(rhythm.primaryStream, "narrative");
  assert.equal(rhythm.energyLevel, "calm");
});

test("rhythm: peak phase favors progression", () => {
  const rhythm = computeRhythm("active_set", { animationLevel: 2, chipCap: 3, tipCap: 2, infoDensity: "rich", showProgression: true, showInsights: false, showCoaching: true, visualNoise: "medium" }, 2, 5);
  assert.equal(rhythm.phase, "peak");
  assert.equal(rhythm.primaryStream, "progression");
  assert.equal(rhythm.energyLevel, "energetic");
});

test("rhythm: late peak shifts to coaching", () => {
  const rhythm = computeRhythm("active_set", { animationLevel: 2, chipCap: 3, tipCap: 2, infoDensity: "rich", showProgression: true, showInsights: false, showCoaching: true, visualNoise: "medium" }, 4, 10);
  assert.equal(rhythm.primaryStream, "coaching");
});

test("rhythm: should refresh tip after interval", () => {
  const rhythm = computeRhythm("active_set", { animationLevel: 2, chipCap: 3, tipCap: 2, infoDensity: "rich", showProgression: true, showInsights: false, showCoaching: true, visualNoise: "medium" }, 2, 5);
  assert.equal(shouldRefreshTip(0, rhythm, 25_000), true); // 25s > 10s interval
  assert.equal(shouldRefreshTip(0, rhythm, 5_000), false); // 5s < interval
});

test("rhythm: final push detection", () => {
  assert.ok(isFinalPushPhase("active_set", 2, 3));
  assert.ok(!isFinalPushPhase("active_set", 1, 3));
});

// ── Narrative Engine ───────────────────────────────────────────────────────

test("narrative: entry with fatigue", () => {
  const identity: IdentityInsight = {
    identity: "the_steady_climber",
    confidence: 0.8,
    reasoning: "stable",
    coachingImplication: "keep going",
  };
  const fatigue: FatigueSignal = { level: "elevated", reason: "streak 7", suggestion: "rest" };
  const narrative = generateNarrative("preparing", "idle", { phase: "entry", tipRefreshIntervalSec: 0, allowNewSuggestions: false, energyLevel: "calm", primaryStream: "narrative", focusMode: false }, fatigue, identity, null, 0, 0, 0);
  assert.ok(narrative);
  assert.equal(narrative!.trigger, "entry");
  assert.ok(narrative!.text.includes("放慢"));
});

test("narrative: exit with PRs", () => {
  const identity: IdentityInsight = {
    identity: "the_steady_climber",
    confidence: 0.8,
    reasoning: "stable",
    coachingImplication: "keep going",
  };
  const narrative = generateNarrative("completing", "recovering", { phase: "finish", tipRefreshIntervalSec: 0, allowNewSuggestions: false, energyLevel: "energetic", primaryStream: "narrative", focusMode: false }, null, identity, null, 3600, 12, 2);
  assert.ok(narrative);
  assert.equal(narrative!.trigger, "exit");
  assert.ok(narrative!.text.includes("突破"));
});

test("narrative: identity-specific entry greeting", () => {
  const identity: IdentityInsight = {
    identity: "the_grinder",
    confidence: 0.8,
    reasoning: "streak",
    coachingImplication: "rest",
  };
  const narrative = generateNarrative("preparing", "idle", { phase: "entry", tipRefreshIntervalSec: 0, allowNewSuggestions: false, energyLevel: "calm", primaryStream: "narrative", focusMode: false }, null, identity, null, 0, 0, 0);
  assert.ok(narrative);
  assert.ok(narrative!.text.includes("打磨"));
});

test("narrative: warmup to active transition", () => {
  const identity: IdentityInsight = {
    identity: "the_steady_climber",
    confidence: 0.8,
    reasoning: "stable",
    coachingImplication: "keep going",
  };
  const narrative = generateNarrative("active_set", "warming_up", { phase: "peak", tipRefreshIntervalSec: 0, allowNewSuggestions: true, energyLevel: "energetic", primaryStream: "progression", focusMode: false }, null, identity, null, 300, 3, 0);
  assert.ok(narrative);
  assert.equal(narrative!.trigger, "phase_change");
  assert.ok(narrative!.text.includes("热身完成"));
});

// ── Orchestrator / Controller ───────────────────────────────────────────────

test("orchestrator: produces unified output", () => {
  const identity: IdentityInsight = {
    identity: "the_steady_climber",
    confidence: 0.8,
    reasoning: "stable",
    coachingImplication: "keep going",
  };

  const output = computeTrainingOS({
    timer: {
      sessionPhase: "active",
      isRestActive: false,
      trainingDurationSec: 300,
      totalSetsInSession: 5,
    },
    session: {
      exercises: [
        { name: "Bench Press", sets: [{ completed: true }, { completed: true }, { completed: false }] },
      ],
      activeExerciseName: "Bench Press",
      prCount: 0,
    },
    intelligence: {
      signalState: {
        signals: [],
        dominant: new Map(),
        overallConfidence: 0.7,
        generatedAt: Date.now(),
      },
      profile: {
        style: "mixed",
        experience: "intermediate",
        frequencyPattern: "moderate_frequency",
        recoveryBehavior: "balanced",
        progressionStyle: "conservative_wave",
        musclePriority: ["chest", "legs"],
        exercisePriority: ["Bench Press"],
        avgWorkoutDurationMin: 45,
        avgSetsPerWorkout: 12,
        avgRestPreferenceSec: 90,
        skipsSessions: false,
        highFailureRate: false,
        computedAt: Date.now(),
      },
      identity,
      adaptiveProgression: null,
      fatigue: null,
      recovery: [],
      recoveryStatus: null,
      warmup: null,
      insights: [],
      contextualTips: [],
      coachingCues: [],
      readinessCue: null,
      exerciseGrowth: [],
      overallGrowth: {
        exercisesTracked: 0,
        avgStrengthGrowth: null,
        avgVolumeGrowth: null,
        avgConsistency: null,
        strongestTrend: "insufficient_data",
        weakestExercise: null,
        fastestExercise: null,
      },
    },
  });

  assert.equal(output.osState, "active_set");
  assert.ok(output.isInSession);
  assert.ok(output.isWorkingState);
  assert.ok(Array.isArray(output.displayItems));
  assert.ok(output.displayItems.length >= 0);
  assert.equal(output.overallConfidence, 0.7);
});

test("orchestrator: displays fatigue banner when fatigued", () => {
  const identity: IdentityInsight = {
    identity: "the_grinder",
    confidence: 0.9,
    reasoning: "streak",
    coachingImplication: "rest",
  };
  const fatigue: FatigueSignal = { level: "elevated", reason: "连续 7 天训练", suggestion: "减载" };

  const output = computeTrainingOS({
    timer: {
      sessionPhase: "active",
      isRestActive: false,
      trainingDurationSec: 300,
      totalSetsInSession: 5,
    },
    session: {
      exercises: [{ name: "Squat", sets: [{ completed: true }, { completed: true }] }],
      activeExerciseName: "Squat",
      prCount: 0,
    },
    intelligence: {
      signalState: { signals: [], dominant: new Map(), overallConfidence: 0.7, generatedAt: Date.now() },
      profile: {
        style: "strength_focused", experience: "advanced", frequencyPattern: "high_frequency",
        recoveryBehavior: "aggressive", progressionStyle: "aggressive_linear",
        musclePriority: ["legs"], exercisePriority: ["Squat"],
        avgWorkoutDurationMin: 60, avgSetsPerWorkout: 20, avgRestPreferenceSec: 180,
        skipsSessions: false, highFailureRate: true, computedAt: Date.now(),
      },
      identity,
      adaptiveProgression: null,
      fatigue,
      recovery: [],
      recoveryStatus: null,
      warmup: null,
      insights: [],
      contextualTips: [],
      coachingCues: [],
      readinessCue: null,
      exerciseGrowth: [],
      overallGrowth: { exercisesTracked: 0, avgStrengthGrowth: null, avgVolumeGrowth: null, avgConsistency: null, strongestTrend: "insufficient_data", weakestExercise: null, fastestExercise: null },
    },
  });

  const fatigueItem = output.displayItems.find((i) => i.source === "fatigue");
  assert.ok(fatigueItem);
  assert.equal(fatigueItem!.variant, "critical");
});

test("orchestrator: entry narrative for steady climber", () => {
  const identity: IdentityInsight = {
    identity: "the_steady_climber",
    confidence: 0.8,
    reasoning: "stable",
    coachingImplication: "keep going",
  };

  const output = computeTrainingOS({
    timer: {
      sessionPhase: "active",
      isRestActive: false,
      trainingDurationSec: 0,
      totalSetsInSession: 0,
    },
    session: {
      exercises: [],
      activeExerciseName: "",
      prCount: 0,
    },
    intelligence: {
      signalState: { signals: [], dominant: new Map(), overallConfidence: 0.8, generatedAt: Date.now() },
      profile: {
        style: "mixed", experience: "intermediate", frequencyPattern: "moderate_frequency",
        recoveryBehavior: "balanced", progressionStyle: "conservative_wave",
        musclePriority: [], exercisePriority: [],
        avgWorkoutDurationMin: 45, avgSetsPerWorkout: 12, avgRestPreferenceSec: 90,
        skipsSessions: false, highFailureRate: false, computedAt: Date.now(),
      },
      identity,
      adaptiveProgression: null,
      fatigue: null,
      recovery: [],
      recoveryStatus: null,
      warmup: null,
      insights: [],
      contextualTips: [],
      coachingCues: [],
      readinessCue: null,
      exerciseGrowth: [],
      overallGrowth: { exercisesTracked: 0, avgStrengthGrowth: null, avgVolumeGrowth: null, avgConsistency: null, strongestTrend: "insufficient_data", weakestExercise: null, fastestExercise: null },
    },
    previousOSState: "idle",
  });

  assert.equal(output.osState, "preparing");
  assert.ok(output.narrative);
  assert.equal(output.narrative!.trigger, "entry");
});

test("orchestrator: respects intensity caps", () => {
  const identity: IdentityInsight = {
    identity: "the_grinder",
    confidence: 0.9,
    reasoning: "streak",
    coachingImplication: "rest",
  };
  const fatigue: FatigueSignal = { level: "elevated", reason: "连续 7 天", suggestion: "减载" };

  const output = computeTrainingOS({
    timer: {
      sessionPhase: "active",
      isRestActive: false,
      trainingDurationSec: 300,
      totalSetsInSession: 10,
    },
    session: {
      exercises: [{ name: "Bench Press", sets: [{ completed: true }, { completed: true }] }],
      activeExerciseName: "Bench Press",
      prCount: 0,
    },
    intelligence: {
      signalState: { signals: [], dominant: new Map(), overallConfidence: 0.7, generatedAt: Date.now() },
      profile: {
        style: "hypertrophy_focused", experience: "intermediate", frequencyPattern: "high_frequency",
        recoveryBehavior: "aggressive", progressionStyle: "volume_focused",
        musclePriority: ["chest"], exercisePriority: ["Bench Press"],
        avgWorkoutDurationMin: 60, avgSetsPerWorkout: 20, avgRestPreferenceSec: 60,
        skipsSessions: false, highFailureRate: false, computedAt: Date.now(),
      },
      identity,
      adaptiveProgression: { text: "尝试 85kg", action: "increase", backingSignals: ["progression_ready"], confidence: 0.8, reason: "ready" },
      fatigue,
      recovery: [],
      recoveryStatus: null,
      warmup: null,
      insights: [],
      contextualTips: [
        { text: "Tip 1", trigger: "t1", urgency: "notice" },
        { text: "Tip 2", trigger: "t2", urgency: "notice" },
        { text: "Tip 3", trigger: "t3", urgency: "notice" },
        { text: "Tip 4", trigger: "t4", urgency: "notice" },
      ],
      coachingCues: [
        { text: "Cue 1", context: "c1", priority: "high", trigger: "tr1" },
        { text: "Cue 2", context: "c2", priority: "medium", trigger: "tr2" },
      ],
      readinessCue: null,
      exerciseGrowth: [],
      overallGrowth: { exercisesTracked: 0, avgStrengthGrowth: null, avgVolumeGrowth: null, avgConsistency: null, strongestTrend: "insufficient_data", weakestExercise: null, fastestExercise: null },
    },
  });

  // Fatigue should suppress most tips
  assert.ok(output.intensity.tipCap <= 2);
  const tipItems = output.displayItems.filter((i) => i.type === "tip");
  assert.ok(tipItems.length <= output.intensity.tipCap);
});
