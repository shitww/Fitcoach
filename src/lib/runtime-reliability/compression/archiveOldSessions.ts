// ── Archive Old Sessions ──────────────────────────────────────────────────────
// Moves old detailed session data to a lightweight archive format.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot, WorkoutSessionMemory } from '@/types/workout-memory';
import type { CompressionConfig } from '@/types/runtime-reliability';

const ARCHIVE_STORAGE_KEY = 'fitcoach_session_archive';

export interface ArchivedSession {
  sessionId: string;
  date: string;
  split: string;
  exerciseCount: number;
  totalVolume: number;
  durationMin: number;
  topExercises: string[];
  archivedAt: string;
}

export interface ArchiveResult {
  archivedCount: number;
  retainedCount: number;
  archivedSessions: ArchivedSession[];
  freedEstimateKb: number;
}

const DEFAULT_CONFIG: CompressionConfig = {
  retainRecentDays: 30,
  archiveAfterDays: 90,
  maxRetainedSessions: 100,
  compressOnScheduleDays: 30,
};

/** Archive sessions older than the retention window.
 *  Returns a summary without deleting from the memory object directly.
 *  Caller is responsible for updating the memory store.
 */
export function archiveOldSessions(
  memory: BehaviorMemorySnapshot,
  config: Partial<CompressionConfig> = {}
): ArchiveResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const cutoffMs = cfg.retainRecentDays * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(Date.now() - cutoffMs).toISOString();

  const sessions = memory.workoutMemory.timeline.sessions;
  const toArchive = sessions.filter((s) => s.date < cutoffDate);
  const retained = sessions.filter((s) => s.date >= cutoffDate);

  const archivedSessions: ArchivedSession[] = toArchive.map(summarizeSession);

  // Load existing archive and merge
  const existing = loadArchive();
  const combined = deduplicateArchive([...existing, ...archivedSessions]);
  saveArchive(combined);

  const freedEstimateKb = estimateBytes(toArchive) / 1024;

  return {
    archivedCount: toArchive.length,
    retainedCount: retained.length,
    archivedSessions,
    freedEstimateKb: Math.round(freedEstimateKb),
  };
}

/** Load the session archive from localStorage. */
export function loadArchive(): ArchivedSession[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ArchivedSession[]) : [];
  } catch {
    return [];
  }
}

/** Get summary stats from the archive. */
export function getArchiveSummary(): {
  totalArchived: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  const archive = loadArchive();
  if (archive.length === 0) return { totalArchived: 0, oldestDate: null, newestDate: null };

  const sorted = [...archive].sort((a, b) => a.date.localeCompare(b.date));
  return {
    totalArchived: archive.length,
    oldestDate: sorted[0].date,
    newestDate: sorted[sorted.length - 1].date,
  };
}

function summarizeSession(session: WorkoutSessionMemory): ArchivedSession {
  const topExercises = session.exercises
    .slice(0, 3)
    .map((e) => e.exerciseName);

  return {
    sessionId: session.workoutId,
    date: session.date,
    split: '',
    exerciseCount: session.exercises.length,
    totalVolume: session.totalVolume,
    durationMin: Math.round(session.durationSec / 60),
    topExercises,
    archivedAt: new Date().toISOString(),
  };
}

function deduplicateArchive(sessions: ArchivedSession[]): ArchivedSession[] {
  const seen = new Set<string>();
  return sessions.filter((s: ArchivedSession) => {
    if (seen.has(s.sessionId)) return false;
    seen.add(s.sessionId);
    return true;
  });
}

function saveArchive(sessions: ArchivedSession[]): void {
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage full — prune oldest 20%
    const trimmed = sessions.slice(Math.floor(sessions.length * 0.2));
    try {
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Give up gracefully
    }
  }
}

function estimateBytes(sessions: WorkoutSessionMemory[]): number {
  return new TextEncoder().encode(JSON.stringify(sessions)).length;
}
