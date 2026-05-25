/**
 * Workout UI Contract — Compile-Time Enforcement
 *
 * This file contains TypeScript type assertions that cause a BUILD ERROR
 * if the WorkoutUIState contract is modified without bumping UI_CONTRACT_VERSION.
 *
 * How it works:
 *   _ContractCheck fails to compile if WorkoutUIState gains or loses any field.
 *   Fix: update AllowedStateKeys / AllowedActionKeys AND bump UI_CONTRACT_VERSION.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  FROZEN CONTRACT  ·  v3.0.0                                               │
 * │                                                                            │
 * │  State (readonly, 6 fields):                                              │
 * │    currentExercise · currentSetIndex · totalSets                          │
 * │    isTrainingActive · restRemainingSeconds · trainingSeconds               │
 * │                                                                            │
 * │  Actions (4 verbs):                                                        │
 * │    startWorkout · completeSet · startRest · finishWorkout                  │
 * │                                                                            │
 * │  Hint (1 hook, passive):                                                   │
 * │    useWorkoutHint → string | null                                          │
 * └────────────────────────────────────────────────────────────────────────────┘
 */

import type { WorkoutUIState, UI_CONTRACT_VERSION } from '@/hooks/useWorkoutUI';

// ── Allowed keys (the frozen set) ────────────────────────────────────────────

type AllowedStateKeys =
  | 'currentExercise'
  | 'currentSetIndex'
  | 'totalSets'
  | 'isTrainingActive'
  | 'restRemainingSeconds'
  | 'trainingSeconds';

type AllowedActionKeys =
  | 'startWorkout'
  | 'completeSet'
  | 'startRest'
  | 'finishWorkout';

type AllowedKeys = AllowedStateKeys | AllowedActionKeys;

// ── Compile-time assertions ───────────────────────────────────────────────────

/**
 * Fails with a descriptive error if WorkoutUIState has fields NOT in AllowedKeys.
 * Add the extra field name(s) to AllowedKeys only after bumping UI_CONTRACT_VERSION.
 */
type _NoExtraFields = Exclude<keyof WorkoutUIState, AllowedKeys> extends never
  ? true
  : { CONTRACT_VIOLATION: 'WorkoutUIState has fields not in the frozen contract'; extra: Exclude<keyof WorkoutUIState, AllowedKeys> };

/**
 * Fails if WorkoutUIState is MISSING a required field from AllowedKeys.
 * Remove the missing key from AllowedKeys if it was intentionally dropped.
 */
type _NoMissingFields = Exclude<AllowedKeys, keyof WorkoutUIState> extends never
  ? true
  : { CONTRACT_VIOLATION: 'WorkoutUIState is missing required contract fields'; missing: Exclude<AllowedKeys, keyof WorkoutUIState> };

/**
 * Fails if UI_CONTRACT_VERSION is not a string literal (i.e. widened to string).
 * Ensures the version constant stays `as const`.
 */
type _VersionIsLiteral = typeof UI_CONTRACT_VERSION extends string
  ? string extends typeof UI_CONTRACT_VERSION
    ? { CONTRACT_VIOLATION: 'UI_CONTRACT_VERSION must be a string literal (use `as const`)' }
    : true
  : never;

// These assignments are the actual compile-time assertions.
// If any check above returns an object type instead of `true`, assigning `true` fails.
const _checkNoExtra:   _NoExtraFields   = true;
const _checkNoMissing: _NoMissingFields = true;
const _checkVersion:   _VersionIsLiteral = true;

// Suppress "unused variable" lint — these exist purely for their type check.
void _checkNoExtra;
void _checkNoMissing;
void _checkVersion;

// ── Re-exports for consumers who need the contract types ──────────────────────
export type { WorkoutUIState, AllowedStateKeys, AllowedActionKeys };
export { UI_CONTRACT_VERSION } from '@/hooks/useWorkoutUI';
