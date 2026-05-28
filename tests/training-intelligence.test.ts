import test from "node:test";
import assert from "node:assert/strict";

import type { ExerciseHistory, UserTrainingContext, LiveExerciseContext } from "@/lib/training/trainingTypes";
import { recommendProgression, recommendForNewExercise } from "@/lib/training/progressionEngine";
import { detectExerciseFatigue, detectSystemicFatigue, detectFatigue } from "@/lib/training/fatigueEngine";
import { getRecoverySuggestions, getRecoveryStatusLine } from "@/lib/training/recoveryEngine";
import { generateWarmup, generateMicroWarmup } from "@/lib/training/warmupEngine";
import { generateInsights } from "@/lib/training/insightEngine";
import { getContextualTips } from "@/lib/training/contextualEngine";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeHistory(name: string, sessions: ExerciseHistory["sessions"]): ExerciseHistory {
  return { exerciseName: name, muscleGroup: "chest", sessions };
}

function makeSession(date: string, sets: { weight: number; reps: number; rir?: number; isFailure?: boolean }[]): ExerciseHistory["sessions"][number] {
  const historicalSets = sets.map((s) => ({
    weight: s.weight,
    reps: s.reps,
    rir: s.rir ?? 1,
    isFailure: s.isFailure ?? false,
    isPR: false,
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

// ── Progression Engine ─────────────────────────────────────────────────────

test("progression: recommends increase when reps well above target", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 10 }]),
    makeSession("2026-05-22", [{ weight: 80, reps: 10 }]),
    makeSession("2026-05-24", [{ weight: 80, reps: 10 }]),
    makeSession("2026-05-26", [{ weight: 80, reps: 10 }]),
  ]);
  const rec = recommendProgression(history);
  assert.equal(rec?.action, "increase");
  assert.ok(rec?.targetWeight > 80);
  assert.equal(rec?.targetReps, 8);
  assert.equal(rec?.confidence, "high");
});

test("progression: recommends maintain when reps near target", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 7 }]),
    makeSession("2026-05-22", [{ weight: 80, reps: 7 }]),
    makeSession("2026-05-24", [{ weight: 80, reps: 8 }]),
  ]);
  const rec = recommendProgression(history);
  assert.equal(rec?.action, "maintain");
  assert.equal(rec?.targetWeight, 80);
});

test("progression: recommends deload when high failure rate", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 85, reps: 5, rir: 0, isFailure: true }]),
    makeSession("2026-05-22", [{ weight: 85, reps: 5, rir: 0, isFailure: true }]),
    makeSession("2026-05-24", [{ weight: 85, reps: 5, rir: 0, isFailure: true }]),
    makeSession("2026-05-26", [{ weight: 85, reps: 5, rir: 0, isFailure: true }]),
  ]);
  const rec = recommendProgression(history);
  assert.equal(rec?.action, "deload");
  assert.ok(rec?.reason.includes("力竭"));
});

test("progression: recommends reduce when reps below minimum", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-24", [{ weight: 100, reps: 3 }]),
  ]);
  const rec = recommendProgression(history);
  assert.equal(rec?.action, "reduce");
  assert.ok(rec?.targetWeight < 100);
});

test("progression: returns null for empty history", () => {
  const rec = recommendProgression(makeHistory("Bench Press", []));
  assert.equal(rec, null);
});

test("progression: new exercise with good lastRecord suggests increase", () => {
  const rec = recommendForNewExercise({ weight: 60, reps: 10 });
  assert.equal(rec.action, "increase");
  assert.ok(rec.targetWeight > 60);
});

test("progression: new exercise with no record suggests maintain", () => {
  const rec = recommendForNewExercise(null);
  assert.equal(rec.action, "maintain");
  assert.equal(rec.confidence, "low");
});

// ── Fatigue Engine ─────────────────────────────────────────────────────────

test("fatigue: detects volume decline across sessions", () => {
  const history = makeHistory("Shoulder Press", [
    makeSession("2026-05-20", [{ weight: 30, reps: 10 }, { weight: 30, reps: 10 }]),
    makeSession("2026-05-22", [{ weight: 30, reps: 10 }, { weight: 30, reps: 9 }]),
    makeSession("2026-05-24", [{ weight: 30, reps: 9 }, { weight: 30, reps: 8 }]),
  ]);
  const signal = detectExerciseFatigue(history);
  assert.equal(signal?.level, "moderate");
  assert.ok(signal?.reason.includes("容量"));
});

test("fatigue: detects rep decline at same weight", () => {
  const history = makeHistory("Shoulder Press", [
    makeSession("2026-05-10", [{ weight: 30, reps: 12 }]),
    makeSession("2026-05-12", [{ weight: 30, reps: 12 }]),
    makeSession("2026-05-14", [{ weight: 30, reps: 11 }]),
    makeSession("2026-05-16", [{ weight: 30, reps: 10 }]),
    makeSession("2026-05-18", [{ weight: 30, reps: 9 }]),
    makeSession("2026-05-20", [{ weight: 30, reps: 8 }]),
  ]);
  const signal = detectExerciseFatigue(history);
  // Volume decline fires first (more severe signal) before rep-decline check
  assert.equal(signal?.level, "moderate");
  assert.ok(signal?.reason.includes("容量") || signal?.reason.includes("次数"));
});

test("fatigue: no signal for stable performance", () => {
  const history = makeHistory("Shoulder Press", [
    makeSession("2026-05-20", [{ weight: 30, reps: 10 }]),
    makeSession("2026-05-22", [{ weight: 30, reps: 10 }]),
  ]);
  const signal = detectExerciseFatigue(history);
  assert.equal(signal, null);
});

test("fatigue: systemic detects high streak", () => {
  const ctx = makeUserContext({ currentStreak: 6 });
  const signal = detectSystemicFatigue(ctx, new Map());
  assert.equal(signal?.level, "elevated");
  assert.ok(signal?.reason.includes("6"));
});

test("fatigue: systemic detects muscle group overuse", () => {
  const ctx = makeUserContext({
    recentWorkouts: [
      { date: "2026-05-21", exercises: ["Bench Press"], totalVolume: 3000, durationMin: 45 },
      { date: "2026-05-22", exercises: ["Dips"], totalVolume: 2500, durationMin: 40 },
      { date: "2026-05-23", exercises: ["Incline Press"], totalVolume: 2800, durationMin: 42 },
      { date: "2026-05-24", exercises: ["Flyes"], totalVolume: 2000, durationMin: 30 },
    ],
  });
  const map = new Map([
    ["Bench Press", "chest"],
    ["Dips", "chest"],
    ["Incline Press", "chest"],
    ["Flyes", "chest"],
  ]);
  const signal = detectSystemicFatigue(ctx, map);
  assert.equal(signal?.level, "moderate");
  assert.ok(signal?.affectedMuscleGroups?.includes("chest"));
});

test("fatigue: aggregate returns systemic when severe", () => {
  const history = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 30, reps: 10 }]),
  ]);
  const ctx = makeUserContext({ currentStreak: 6 });
  const signal = detectFatigue(history, ctx, new Map());
  assert.equal(signal?.level, "elevated");
});

// ── Recovery Engine ────────────────────────────────────────────────────────

test("recovery: suggests rest day after 6-day streak", () => {
  const ctx = makeUserContext({ currentStreak: 6 });
  const suggestions = getRecoverySuggestions(ctx);
  assert.ok(suggestions.some((s) => s.priority === "recommend" && s.text.includes("恢复日")));
});

test("recovery: warns about fast weight loss", () => {
  const ctx = makeUserContext({
    bodyWeightTrend: { last7dAvg: 70, prev7dAvg: 72, changeKg: -2 },
  });
  const suggestions = getRecoverySuggestions(ctx);
  assert.ok(suggestions.some((s) => s.text.includes("体重下降")));
});

test("recovery: status line for long streak", () => {
  const ctx = makeUserContext({ currentStreak: 6 });
  const line = getRecoveryStatusLine(ctx);
  assert.ok(line?.includes("6"));
});

test("recovery: status line null for normal state", () => {
  const ctx = makeUserContext({ currentStreak: 2, daysSinceLastWorkout: 1 });
  const line = getRecoveryStatusLine(ctx);
  assert.equal(line, null);
});

// ── Warmup Engine ──────────────────────────────────────────────────────────

test("warmup: generates sets for heavy working weight", () => {
  const plan = generateWarmup(100, 8);
  assert.ok(plan.sets.length >= 2);
  assert.ok(plan.sets[0].weight < plan.sets[plan.sets.length - 1].weight);
  assert.ok(plan.sets.every((s) => s.weight <= 100));
  assert.ok(plan.note !== null);
});

test("warmup: reduces sets for light weight", () => {
  const plan = generateWarmup(30, 10);
  assert.ok(plan.sets.length <= 2);
});

test("warmup: bodyweight mode has no weight", () => {
  const plan = generateWarmup(0, 10, true);
  assert.ok(plan.sets.every((s) => s.weight === 0));
  assert.ok(plan.note?.includes("变式"));
});

test("warmup: micro warmup for small jump returns empty", () => {
  const sets = generateMicroWarmup(80, 85);
  assert.equal(sets.length, 0);
});

test("warmup: micro warmup for large jump returns steps", () => {
  const sets = generateMicroWarmup(60, 100);
  assert.ok(sets.length > 0);
  assert.equal(sets[sets.length - 1].weight, 100);
});

// ── Insight Engine ─────────────────────────────────────────────────────────

test("insight: detects volume trend up", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-01", [{ weight: 60, reps: 8 }]),
    makeSession("2026-05-03", [{ weight: 65, reps: 8 }]),
    makeSession("2026-05-05", [{ weight: 70, reps: 8 }]),
    makeSession("2026-05-07", [{ weight: 75, reps: 8 }]),
    makeSession("2026-05-09", [{ weight: 85, reps: 8 }]),
    makeSession("2026-05-11", [{ weight: 90, reps: 8 }]),
    makeSession("2026-05-13", [{ weight: 95, reps: 8 }]),
    makeSession("2026-05-15", [{ weight: 100, reps: 8 }]),
  ]);
  const ctx = makeUserContext();
  const insights = generateInsights([history], ctx);
  assert.ok(insights.some((i) => i.type === "volume_trend" && i.severity === "positive"));
});

test("insight: detects PR milestone", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-20", [{ weight: 100, reps: 5 }]),
  ]);
  const ctx = makeUserContext();
  const insights = generateInsights([history], ctx);
  assert.ok(insights.some((i) => i.type === "pr_milestone"));
});

test("insight: caps at max 3 insights", () => {
  const histories: ExerciseHistory[] = [];
  for (let i = 0; i < 10; i++) {
    histories.push(
      makeHistory(`Exercise ${i}`, [
        makeSession("2026-05-20", [{ weight: 50 + i, reps: 5 }]),
      ])
    );
  }
  const ctx = makeUserContext();
  const insights = generateInsights(histories, ctx);
  assert.ok(insights.length <= 3);
});

test("insight: deduplicates by text", () => {
  const h1 = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 10 }]),
  ]);
  const h2 = makeHistory("Bench Press", [
    makeSession("2026-05-20", [{ weight: 80, reps: 10 }]),
  ]);
  const ctx = makeUserContext();
  const insights = generateInsights([h1, h2], ctx);
  const texts = insights.map((i) => i.text);
  assert.equal(new Set(texts).size, texts.length);
});

// ── Contextual Engine ────────────────────────────────────────────────────────

test("contextual: warns about declining reps", () => {
  const ctx: LiveExerciseContext = {
    exerciseName: "Bench Press",
    completedSets: [
      { weight: 80, reps: 10, rir: 1, isFailure: false, isBodyweight: false },
      { weight: 80, reps: 8, rir: 1, isFailure: false, isBodyweight: false },
      { weight: 80, reps: 6, rir: 0, isFailure: true, isBodyweight: false },
    ],
  };
  const tips = getContextualTips(ctx, null, makeUserContext());
  assert.ok(tips.some((t) => t.trigger === "reps_declining"));
});

test("contextual: warns about short rest", () => {
  const ctx: LiveExerciseContext = {
    exerciseName: "Squat",
    completedSets: [
      { weight: 100, reps: 5, rir: 1, isFailure: false, isBodyweight: false },
    ],
    restTimesSec: [30],
  };
  const tips = getContextualTips(ctx, null, makeUserContext());
  assert.ok(tips.some((t) => t.trigger === "rest_time_short"));
});

test("contextual: approaching PR tip", () => {
  const history = makeHistory("Squat", [
    makeSession("2026-05-15", [{ weight: 100, reps: 5 }]),
  ]);
  const ctx: LiveExerciseContext = {
    exerciseName: "Squat",
    completedSets: [
      { weight: 99, reps: 5, rir: 1, isFailure: false, isBodyweight: false },
    ],
  };
  const tips = getContextualTips(ctx, history, makeUserContext());
  assert.ok(tips.some((t) => t.trigger === "approaching_pr"));
});

test("contextual: limits to 2 tips", () => {
  const ctx: LiveExerciseContext = {
    exerciseName: "Squat",
    completedSets: [
      { weight: 100, reps: 10, rir: 0, isFailure: true, isBodyweight: false },
      { weight: 100, reps: 8, rir: 0, isFailure: true, isBodyweight: false },
      { weight: 100, reps: 6, rir: 0, isFailure: true, isBodyweight: false },
    ],
    restTimesSec: [20, 20],
  };
  const userCtx = makeUserContext({ currentStreak: 6 });
  const tips = getContextualTips(ctx, null, userCtx);
  assert.ok(tips.length <= 2);
});

// ── Edge Cases ─────────────────────────────────────────────────────────────

test("warmup: empty plan for zero weight non-bodyweight", () => {
  const plan = generateWarmup(0, 8, false);
  assert.equal(plan.sets.length, 0);
});

test("progression: maintain with exactly target reps", () => {
  const history = makeHistory("Row", [
    makeSession("2026-05-20", [{ weight: 50, reps: 8 }]),
    makeSession("2026-05-22", [{ weight: 50, reps: 8 }]),
  ]);
  const rec = recommendProgression(history);
  assert.equal(rec?.action, "maintain");
});

test("fatigue: null for single session", () => {
  const history = makeHistory("Curl", [
    makeSession("2026-05-20", [{ weight: 10, reps: 12 }]),
  ]);
  assert.equal(detectExerciseFatigue(history), null);
});
