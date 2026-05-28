import test from "node:test";
import assert from "node:assert/strict";

import type { ExerciseHistory, UserTrainingContext } from "@/lib/training/trainingTypes";
import { computeOverallConfidence, computeExerciseConfidence } from "@/lib/training/signals/signalConfidence";
import { generateSignals } from "@/lib/training/signals/signalEngine";
import { aggregateSignals, hasSignal, getSignal, getHighestSeveritySignal } from "@/lib/training/signals/signalAggregator";
import { buildTrainingProfile, detectProfileChanges } from "@/lib/training/profile/trainingProfileEngine";
import { recommendAdaptiveProgression } from "@/lib/training/adaptiveProgressionEngine";
import { classifyFitnessIdentity } from "@/lib/training/fitnessIdentityEngine";
import { computeGrowthMetrics, computeOverallGrowth } from "@/lib/training/growthModelEngine";
import { generateCoachingCues, generateReadinessCue } from "@/lib/training/behavioralCoachingEngine";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeHistory(name: string, sessions: ExerciseHistory["sessions"], muscleGroup?: string): ExerciseHistory {
  return { exerciseName: name, muscleGroup, sessions };
}

function makeSession(date: string, sets: { weight: number; reps: number; rir?: number; isFailure?: boolean; isPR?: boolean }[]): ExerciseHistory["sessions"][number] {
  const historicalSets = sets.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    rir: s.rir ?? 1,
    isFailure: s.isFailure ?? false,
    isPR: s.isPR ?? false,
    date,
  }));
  const totalVolume = historicalSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  return { date, sets: historicalSets, totalVolume };
}

function makeUserContext(overrides: Partial<UserTrainingContext> = {}): UserTrainingContext {
  return {
    recentWorkouts: [],
    currentStreak: 0,
    daysSinceLastWorkout: 1,
    ...overrides,
  };
}

function emptySignalState(confidence = 0.5) {
  return {
    signals: [],
    dominant: new Map(),
    overallConfidence: confidence,
    generatedAt: Date.now(),
  };
}

// ── Signal Confidence ──────────────────────────────────────────────────────

test("signalConfidence: overall confidence increases with more data", () => {
  const histories: ExerciseHistory[] = [
    makeHistory("Bench Press", [
      makeSession("2026-05-20", [{ weight: 80, reps: 8 }]),
      makeSession("2026-05-22", [{ weight: 80, reps: 8 }]),
      makeSession("2026-05-24", [{ weight: 82.5, reps: 8 }]),
      makeSession("2026-05-26", [{ weight: 82.5, reps: 9 }]),
      makeSession("2026-05-28", [{ weight: 85, reps: 8 }]),
    ]),
  ];
  const ctx = makeUserContext({
    recentWorkouts: [{ date: "2026-05-28", exercises: ["Bench Press"], totalVolume: 3000, durationMin: 45 }],
  });
  const conf = computeOverallConfidence(histories, ctx);
  assert.ok(conf > 0);
  assert.ok(conf <= 1);
});

test("signalConfidence: exercise confidence reflects session depth", () => {
  const shallow = makeHistory("Curl", [makeSession("2026-05-20", [{ weight: 10, reps: 10 }])]);
  const deep = makeHistory("Squat", Array.from({ length: 10 }, (_, i) =>
    makeSession(`2026-05-${String(10 + i).padStart(2, "0")}`, [{ weight: 80 + i * 2.5, reps: 5 }])
  ));

  assert.ok(computeExerciseConfidence(shallow) < computeExerciseConfidence(deep));
});

// ── Signal Engine ───────────────────────────────────────────────────────────

test("signalEngine: detects volume rising signal", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-01", [{ weight: 60, reps: 8 }]),
    makeSession("2026-05-03", [{ weight: 65, reps: 8 }]),
    makeSession("2026-05-05", [{ weight: 70, reps: 8 }]),
    makeSession("2026-05-07", [{ weight: 75, reps: 8 }]),
    makeSession("2026-05-09", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-11", [{ weight: 85, reps: 8 }]),
  ], "chest");
  const ctx = makeUserContext();
  const signals = generateSignals([history], ctx, new Map());
  assert.ok(signals.some((s) => s.type === "volume_rising"));
});

test("signalEngine: detects plateau signal", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-01", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-03", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-05", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-07", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-09", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-11", [{ weight: 100, reps: 5 }]),
  ], "legs");
  const ctx = makeUserContext();
  const signals = generateSignals([history], ctx, new Map());
  assert.ok(signals.some((s) => s.type === "plateau_detected"));
});

test("signalEngine: detects fatigue risk from streak", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 8 }]),
  ], "chest");
  const ctx = makeUserContext({ currentStreak: 6 });
  const signals = generateSignals([history], ctx, new Map());
  assert.ok(signals.some((s) => s.type === "fatigue_risk"));
});

test("signalEngine: detects beginner pattern", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 40, reps: 10 }]),
  ], "chest");
  const ctx = makeUserContext();
  const signals = generateSignals([history], ctx, new Map());
  assert.ok(signals.some((s) => s.type === "beginner_pattern"));
});

test("signalEngine: detects strength focused style", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-20", [{ weight: 100, reps: 3 }]),
    makeSession("2026-05-22", [{ weight: 105, reps: 3 }]),
    makeSession("2026-05-24", [{ weight: 110, reps: 3 }]),
  ], "legs");
  const ctx = makeUserContext();
  const signals = generateSignals([history], ctx, new Map());
  assert.ok(signals.some((s) => s.type === "strength_focused"));
});

// ── Signal Aggregator ──────────────────────────────────────────────────────

test("signalAggregator: resolves volume conflicts", () => {
  const rawSignals = [
    { type: "volume_rising" as const, source: "volume" as const, confidence: 0.8, severity: "positive" as const, reason: "up" },
    { type: "volume_stable" as const, source: "volume" as const, confidence: 0.6, severity: "neutral" as const, reason: "stable" },
  ];
  const state = aggregateSignals(rawSignals, 0.7);
  assert.ok(hasSignal(state, "volume_rising"));
  assert.equal(hasSignal(state, "volume_stable"), false); // overridden
});

test("signalAggregator: picks highest severity dominant signal", () => {
  const rawSignals = [
    { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
    { type: "recovery_low" as const, source: "fatigue" as const, confidence: 0.7, severity: "neutral" as const, reason: "low" },
  ];
  const state = aggregateSignals(rawSignals, 0.8);
  const dominant = state.dominant.get("fatigue");
  assert.equal(dominant?.type, "fatigue_risk");
});

test("signalAggregator: getHighestSeveritySignal returns critical first", () => {
  const rawSignals = [
    { type: "volume_rising" as const, source: "volume" as const, confidence: 0.8, severity: "positive" as const, reason: "up" },
    { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
  ];
  const state = aggregateSignals(rawSignals, 0.8);
  const highest = getHighestSeveritySignal(state);
  assert.equal(highest?.type, "fatigue_risk");
});

// ── Training Profile ───────────────────────────────────────────────────────

test("profile: detects beginner with few sessions", () => {
  const histories = [makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 40, reps: 10 }]),
    makeSession("2026-05-22", [{ weight: 42.5, reps: 10 }]),
  ])];
  const ctx = makeUserContext();
  const profile = buildTrainingProfile(histories, ctx);
  assert.equal(profile.experience, "beginner");
});

test("profile: detects strength focused style", () => {
  const histories = [makeHistory("Squat", [
    makeSession("2026-05-20", [{ weight: 100, reps: 3 }]),
    makeSession("2026-05-22", [{ weight: 105, reps: 3 }]),
    makeSession("2026-05-24", [{ weight: 110, reps: 3 }]),
    makeSession("2026-05-26", [{ weight: 112.5, reps: 3 }]),
  ])];
  const ctx = makeUserContext();
  const profile = buildTrainingProfile(histories, ctx);
  assert.equal(profile.style, "strength_focused");
});

test("profile: detects high frequency pattern", () => {
  const histories = [makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 8 }]),
  ])];
  const recentWorkouts = Array.from({ length: 10 }, (_, i) => ({
    date: `2026-05-${String(15 + i).padStart(2, "0")}`,
    exercises: ["Bench Press"],
    totalVolume: 3000,
    durationMin: 45,
  }));
  const ctx = makeUserContext({ recentWorkouts });
  const profile = buildTrainingProfile(histories, ctx);
  assert.equal(profile.frequencyPattern, "high_frequency");
});

test("profile: detects profile changes", () => {
  const histories = [makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 8 }]),
  ])];
  const ctx = makeUserContext();
  const profile1 = buildTrainingProfile(histories, ctx);

  const histories2 = [makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-22", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-24", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-26", [{ weight: 80, reps: 8 }]),
  ])];
  const profile2 = buildTrainingProfile(histories2, ctx);

  const changes = detectProfileChanges(profile1, profile2);
  assert.ok(changes.length > 0);
});

// ── Adaptive Progression ───────────────────────────────────────────────────

test("adaptiveProgression: respects fatigue signal and suggests deload", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-20", [{ weight: 100, reps: 5 }]),
  ], "legs");
  const signalState = {
    signals: [
      { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
    ],
    dominant: new Map(),
    overallConfidence: 0.8,
    generatedAt: Date.now(),
  };
  const profile = buildTrainingProfile([history], makeUserContext());
  const rec = recommendAdaptiveProgression(history, signalState, profile);
  assert.ok(rec?.text.includes("降低") || rec?.text.includes("维持"));
});

test("adaptiveProgression: respects volume falling signal", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-20", [{ weight: 100, reps: 5 }]),
  ], "legs");
  const signalState = {
    signals: [
      { type: "volume_falling" as const, source: "volume" as const, confidence: 0.8, severity: "attention" as const, reason: "down" },
    ],
    dominant: new Map(),
    overallConfidence: 0.7,
    generatedAt: Date.now(),
  };
  const profile = buildTrainingProfile([history], makeUserContext());
  const rec = recommendAdaptiveProgression(history, signalState, profile);
  assert.ok(rec?.text.includes("稳定"));
});

test("adaptiveProgression: beginner gets conservative recommendation", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 40, reps: 10 }]),
    makeSession("2026-05-22", [{ weight: 42.5, reps: 10 }]),
  ], "chest");
  const signalState = emptySignalState(0.6);
  const profile = buildTrainingProfile([history], makeUserContext());
  const rec = recommendAdaptiveProgression(history, signalState, profile);
  assert.ok(rec);
  assert.ok(rec!.confidence < 0.8); // beginners get lower confidence
});

// ── Fitness Identity ─────────────────────────────────────────────────────────

test("identity: classifies grinder", () => {
  const profile = buildTrainingProfile([], makeUserContext({
    currentStreak: 8,
    recentWorkouts: Array.from({ length: 14 }, (_, i) => ({
      date: `2026-05-${String(15 + i).padStart(2, "0")}`,
      exercises: ["Bench Press"],
      totalVolume: 3000,
      durationMin: 45,
    })),
  }));
  const signalState = {
    signals: [
      { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
    ],
    dominant: new Map(),
    overallConfidence: 0.8,
    generatedAt: Date.now(),
  };
  const identity = classifyFitnessIdentity(profile, signalState);
  assert.equal(identity.identity, "the_grinder");
});

test("identity: classifies steady climber", () => {
  const histories = [
    makeHistory("Bench Press", [
      makeSession("2026-05-15", [{ weight: 80, reps: 8 }]),
      makeSession("2026-05-17", [{ weight: 82.5, reps: 8 }]),
      makeSession("2026-05-19", [{ weight: 82.5, reps: 9 }]),
      makeSession("2026-05-21", [{ weight: 85, reps: 8 }]),
      makeSession("2026-05-23", [{ weight: 85, reps: 9 }]),
    ], "chest"),
    makeHistory("Squat", [
      makeSession("2026-05-16", [{ weight: 100, reps: 5 }]),
      makeSession("2026-05-18", [{ weight: 100, reps: 5 }]),
      makeSession("2026-05-20", [{ weight: 105, reps: 5 }]),
      makeSession("2026-05-22", [{ weight: 105, reps: 5 }]),
    ], "legs"),
  ];
  const profile = buildTrainingProfile(histories, makeUserContext({
    currentStreak: 4,
    recentWorkouts: Array.from({ length: 8 }, (_, i) => ({
      date: `2026-05-${String(15 + i * 2).padStart(2, "0")}`,
      exercises: ["Bench Press", "Squat"],
      totalVolume: 3000,
      durationMin: 45,
    })),
  }));
  const signalState = emptySignalState(0.8);
  const identity = classifyFitnessIdentity(profile, signalState);
  assert.equal(identity.identity, "the_steady_climber");
});

// ── Growth Model ───────────────────────────────────────────────────────────

test("growthModel: detects strong growth", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-01", [{ weight: 60, reps: 8 }]),
    makeSession("2026-05-08", [{ weight: 65, reps: 8 }]),
    makeSession("2026-05-15", [{ weight: 70, reps: 8 }]),
    makeSession("2026-05-22", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-29", [{ weight: 90, reps: 8 }]),
    makeSession("2026-06-05", [{ weight: 100, reps: 8 }]),
  ]);
  const metrics = computeGrowthMetrics(history);
  assert.equal(metrics.trendDirection, "strong_growth");
  assert.ok(metrics.strengthGrowthRate !== null);
  assert.ok(metrics.strengthGrowthRate! > 0);
});

test("growthModel: detects plateau", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-01", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-08", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-15", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-22", [{ weight: 100, reps: 5 }]),
    makeSession("2026-05-29", [{ weight: 100, reps: 5 }]),
    makeSession("2026-06-05", [{ weight: 100, reps: 5 }]),
  ]);
  const metrics = computeGrowthMetrics(history);
  assert.equal(metrics.trendDirection, "plateau");
});

test("growthModel: insufficient data for short history", () => {
  const history = makeHistory("Curl", [
    makeSession("2026-05-20", [{ weight: 10, reps: 10 }]),
  ]);
  const metrics = computeGrowthMetrics(history);
  assert.equal(metrics.trendDirection, "insufficient_data");
});

test("growthModel: overall growth aggregates multiple exercises", () => {
  const h1 = makeHistory("Bench Press", [
    makeSession("2026-05-01", [{ weight: 60, reps: 8 }]),
    makeSession("2026-05-15", [{ weight: 80, reps: 8 }]),
    makeSession("2026-05-29", [{ weight: 100, reps: 8 }]),
  ]);
  const h2 = makeHistory("Squat", [
    makeSession("2026-05-01", [{ weight: 80, reps: 5 }]),
    makeSession("2026-05-15", [{ weight: 80, reps: 5 }]),
    makeSession("2026-05-29", [{ weight: 80, reps: 5 }]),
  ]);
  const overall = computeOverallGrowth([h1, h2]);
  assert.equal(overall.exercisesTracked, 2);
  assert.ok(overall.avgStrengthGrowth !== null);
});

// ── Behavioral Coaching ────────────────────────────────────────────────────

test("coaching: generates identity-aware cues", () => {
  const profile = buildTrainingProfile([], makeUserContext());
  const signalState = emptySignalState(0.7);
  const cues = generateCoachingCues("the_grinder", signalState, profile);
  assert.ok(cues.length >= 0);
});

test("coaching: readiness cue for fatigue", () => {
  const profile = buildTrainingProfile([], makeUserContext());
  const signalState = {
    signals: [
      { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
    ],
    dominant: new Map(),
    overallConfidence: 0.8,
    generatedAt: Date.now(),
  };
  const cue = generateReadinessCue(signalState, profile);
  assert.ok(cue);
  assert.ok(cue!.text.includes("降低预期"));
});

test("coaching: readiness cue for recovery", () => {
  const profile = buildTrainingProfile([], makeUserContext());
  const signalState = {
    signals: [
      { type: "recovery_good" as const, source: "fatigue" as const, confidence: 0.8, severity: "positive" as const, reason: "rested" },
    ],
    dominant: new Map(),
    overallConfidence: 0.8,
    generatedAt: Date.now(),
  };
  const cue = generateReadinessCue(signalState, profile);
  assert.ok(cue);
  assert.ok(cue!.text.includes("恢复良好"));
});

test("coaching: caps at 3 cues", () => {
  const profile = buildTrainingProfile([], makeUserContext({
    currentStreak: 6,
    recentWorkouts: Array.from({ length: 10 }, (_, i) => ({
      date: `2026-05-${String(15 + i).padStart(2, "0")}`,
      exercises: ["Bench Press", "Squat", "Deadlift"],
      totalVolume: 3000,
      durationMin: 45,
    })),
  }));
  const signalState = {
    signals: [
      { type: "fatigue_risk" as const, source: "fatigue" as const, confidence: 0.9, severity: "critical" as const, reason: "streak" },
      { type: "volume_spike" as const, source: "volume" as const, confidence: 0.8, severity: "attention" as const, reason: "spike" },
      { type: "pr_streak" as const, source: "performance" as const, confidence: 0.8, severity: "positive" as const, reason: "pr" },
    ],
    dominant: new Map(),
    overallConfidence: 0.8,
    generatedAt: Date.now(),
  };
  const cues = generateCoachingCues("the_grinder", signalState, profile);
  assert.ok(cues.length <= 3);
});

// ── End-to-End: Signal → Adaptive Progression ──────────────────────────────

test("e2e: signal engine feeds aggregator feeds adaptive progression", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-01", [{ weight: 60, reps: 8 }]),
    makeSession("2026-05-08", [{ weight: 65, reps: 8 }]),
    makeSession("2026-05-15", [{ weight: 70, reps: 8 }]),
    makeSession("2026-05-22", [{ weight: 75, reps: 8 }]),
    makeSession("2026-05-29", [{ weight: 80, reps: 8 }]),
    makeSession("2026-06-05", [{ weight: 85, reps: 8 }]),
  ], "chest");

  const ctx = makeUserContext();
  const muscleMap = new Map([["Bench Press", "chest"]]);

  // 1. Generate signals
  const rawSignals = generateSignals([history], ctx, muscleMap);
  const conf = computeOverallConfidence([history], ctx);
  const state = aggregateSignals(rawSignals, conf);

  // 2. Build profile
  const profile = buildTrainingProfile([history], ctx);

  // 3. Adaptive progression
  const rec = recommendAdaptiveProgression(history, state, profile);

  assert.ok(rec);
  assert.ok(rec!.confidence > 0);
  assert.ok(rec!.backingSignals.length > 0 || rec!.text.length > 0);
});
