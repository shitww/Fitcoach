// ── Runtime Core — Public API ─────────────────────────────────────────────────
// Event-Sourced Training Runtime OS
// Phase 9: All workout state flows through events → reducer → snapshot
// ─────────────────────────────────────────────────────────────────────────────

export * from './event-log'
export * from './reducers'
export * from './snapshot'
export * from './replay'
export * from './timeline'
export * from './undo'
export * from './runtime'
export * from './integrity'
export { useRuntimeCore, selectRTPhase, selectRTActiveExercise, selectRTTotalSets, selectRTIsRestActive, selectRTRestEndAt, selectRTExerciseQueue, selectRTExercises, selectRTSnapshot } from './useRuntimeCore'
