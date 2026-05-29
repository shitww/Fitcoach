// ── Generate Training Traits ──────────────────────────────────────────────────
// Produces human-readable trait descriptions from identity data.
// ─────────────────────────────────────────────────────────────────────────────

import type { TrainingIdentity } from '@/types/emotional-runtime';

/** Generate a short narrative from training identity. */
export function generateTrainingTraits(identity: TrainingIdentity): string[] {
  const lines: string[] = [];

  if (identity.primaryTraits.includes('high_consistency')) {
    lines.push('你更偏向高稳定训练者');
  }
  if (identity.primaryTraits.includes('compound_heavy')) {
    lines.push('偏向复合动作 / 多关节训练');
  }
  if (identity.primaryTraits.includes('progressive_overload')) {
    lines.push('渐进超负荷型训练风格');
  }
  if (identity.primaryTraits.includes('recovery_aware')) {
    lines.push('注重恢复节奏，避免过度训练');
  }
  if (identity.primaryTraits.includes('minimalist')) {
    lines.push('高效简练，倾向短时高密度训练');
  }

  // Session length trait
  if (identity.sessionLengthProfile === 'long') {
    lines.push('偏长时间训练风格');
  } else if (identity.sessionLengthProfile === 'short') {
    lines.push('倾向高效短时训练');
  }

  return lines.slice(0, 4);
}
