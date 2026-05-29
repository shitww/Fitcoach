// ── Build Identity Surface ────────────────────────────────────────────────────
// Assembles the identity surface for subtle UI display.
// ─────────────────────────────────────────────────────────────────────────────

import type { IdentitySurface, TrainingIdentity } from '@/types/emotional-runtime';

const TRAIT_COLORS: Record<string, string> = {
  '高稳定性':      'rgba(34,197,94,0.15)',
  '渐进超负荷':    'rgba(204,255,0,0.12)',
  '复合动作为主':  'rgba(96,165,250,0.12)',
  '注重恢复':      'rgba(167,139,250,0.12)',
  '高效简练':      'rgba(251,191,36,0.12)',
  '力量导向':      'rgba(239,68,68,0.12)',
};

/** Build the identity surface for UI from a training identity. */
export function buildIdentitySurface(identity: TrainingIdentity): IdentitySurface {
  const topTrait = identity.traitLabels[0] ?? '训练者';
  const topTraitLabel = identity.traitLabels[0]
    ? `${identity.traitLabels[0]}训练者`
    : '持续训练者';

  const traitChips = identity.traitLabels.slice(0, 3).map((label) => ({
    label,
    color: TRAIT_COLORS[label] ?? 'rgba(148,163,184,0.12)',
  }));

  return { identity, topTraitLabel, traitChips };
}
