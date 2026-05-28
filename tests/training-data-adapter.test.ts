import test from "node:test";
import assert from "node:assert/strict";

import {
  workoutsToExerciseHistories,
  buildMuscleMap,
  buildUserTrainingContext,
  buildSingleExerciseHistory,
} from "@/lib/training/dataAdapter";
import type { WorkoutSummaryDto } from "@/lib/workout-summary";

function makeWorkout(
  date: string,
  exercises: { name: string; muscleGroup: string; sets: { weight: number; reps: number; isWarmup?: boolean; isCardio?: boolean }[] }[]
): WorkoutSummaryDto {
  return {
    id: `wo-${date}`,
    date: new Date(date).toISOString(),
    totalVolume: exercises.reduce(
      (s, ex) => s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
      0
    ),
    duration: 3600,
    notes: null,
    exercises: exercises.map((ex, i) => ({
      id: `ex-${i}`,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets.map((set, j) => ({
        id: `set-${j}`,
        weight: set.weight,
        reps: set.reps,
        rir: 1,
        isFailure: false,
        isPR: false,
        isWarmup: set.isWarmup ?? false,
        isCardio: set.isCardio ?? false,
        setNumber: j + 1,
      })),
    })),
  };
}

// ── workoutsToExerciseHistories ──────────────────────────────────────────

test("adapter: groups workouts by exercise name", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
      { name: "Squat", muscleGroup: "legs", sets: [{ weight: 100, reps: 5 }] },
    ]),
    makeWorkout("2026-05-22", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 82.5, reps: 8 }] },
    ]),
  ];

  const histories = workoutsToExerciseHistories(workouts);
  assert.equal(histories.length, 2);

  const bench = histories.find((h) => h.exerciseName === "Bench Press")!;
  assert.equal(bench.sessions.length, 2);
  assert.equal(bench.muscleGroup, "chest");
  assert.equal(bench.sessions[0].sets[0].weight, 80);
  assert.equal(bench.sessions[1].sets[0].weight, 82.5);

  const squat = histories.find((h) => h.exerciseName === "Squat")!;
  assert.equal(squat.sessions.length, 1);
});

test("adapter: filters out warmup and cardio sets", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      {
        name: "Bench Press",
        muscleGroup: "chest",
        sets: [
          { weight: 40, reps: 10, isWarmup: true },
          { weight: 80, reps: 8 },
          { weight: 0, reps: 30, isCardio: true },
        ],
      },
    ]),
  ];

  const histories = workoutsToExerciseHistories(workouts);
  const bench = histories.find((h) => h.exerciseName === "Bench Press")!;
  assert.equal(bench.sessions[0].sets.length, 1);
  assert.equal(bench.sessions[0].sets[0].weight, 80);
});

test("adapter: sorts sessions oldest → newest", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-22", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 85, reps: 8 }] },
    ]),
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
    ]),
  ];

  const histories = workoutsToExerciseHistories(workouts);
  const bench = histories.find((h) => h.exerciseName === "Bench Press")!;
  assert.equal(bench.sessions[0].sets[0].weight, 80);
  assert.equal(bench.sessions[1].sets[0].weight, 85);
});

// ── buildMuscleMap ───────────────────────────────────────────────────────

test("adapter: muscle map deduplicates by exercise name", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
    ]),
    makeWorkout("2026-05-22", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 85, reps: 8 }] },
      { name: "Squat", muscleGroup: "legs", sets: [{ weight: 100, reps: 5 }] },
    ]),
  ];

  const map = buildMuscleMap(workouts);
  assert.equal(map.get("Bench Press"), "chest");
  assert.equal(map.get("Squat"), "legs");
  assert.equal(map.size, 2);
});

// ── buildUserTrainingContext ───────────────────────────────────────────────

test("adapter: recentWorkouts caps at 14 entries", () => {
  const workouts: WorkoutSummaryDto[] = Array.from({ length: 20 }, (_, i) =>
    makeWorkout(`2026-05-${String(i + 1).padStart(2, "0")}`, [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
    ])
  );

  const ctx = buildUserTrainingContext(workouts);
  assert.equal(ctx.recentWorkouts.length, 14);
  // Should be sorted newest first
  assert.ok(
    new Date(ctx.recentWorkouts[0].date) >= new Date(ctx.recentWorkouts[1].date)
  );
});

test("adapter: passes optional streak and body weight trend", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
    ]),
  ];

  const ctx = buildUserTrainingContext(workouts, {
    currentStreak: 3,
    daysSinceLastWorkout: 1,
    bodyWeightTrend: { last7dAvg: 70, prev7dAvg: 72, changeKg: -2 },
  });

  assert.equal(ctx.currentStreak, 3);
  assert.equal(ctx.daysSinceLastWorkout, 1);
  assert.equal(ctx.bodyWeightTrend?.changeKg, -2);
});

// ── buildSingleExerciseHistory ───────────────────────────────────────────

test("adapter: single exercise history filters to one exercise", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
      { name: "Squat", muscleGroup: "legs", sets: [{ weight: 100, reps: 5 }] },
    ]),
    makeWorkout("2026-05-22", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 82.5, reps: 8 }] },
    ]),
  ];

  const history = buildSingleExerciseHistory(workouts, "Bench Press");
  assert.ok(history);
  assert.equal(history!.sessions.length, 2);
  assert.equal(history!.muscleGroup, "chest");
});

test("adapter: returns null for exercise with no data", () => {
  const workouts: WorkoutSummaryDto[] = [
    makeWorkout("2026-05-20", [
      { name: "Bench Press", muscleGroup: "chest", sets: [{ weight: 80, reps: 8 }] },
    ]),
  ];

  const history = buildSingleExerciseHistory(workouts, "Deadlift");
  assert.equal(history, null);
});
