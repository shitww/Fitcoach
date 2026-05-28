// ── FitCoach Phase 4B — Experience Intensity Control ────────────────────────
// Dynamically controls UI density, animation, and suggestion frequency.
// Based on: fatigue level, identity type, session phase.

import type { TrainingOSState } from '../state/trainingStateMachine';
import { getPhaseGroup } from '../state/trainingStateMachine';
import type { FatigueSignal } from '../trainingTypes';
import type { FitnessIdentity } from '../fitnessIdentityEngine';

// ── Public API ─────────────────────────────────────────────────────────────

export interface ExperienceIntensity {
  /** Max number of inline tips to show. */
  tipCap: number;
  /** Max number of suggestion chips. */
  chipCap: number;
  /** Animation intensity: 0 = none, 1 = subtle, 2 = full. */
  animationLevel: 0 | 1 | 2;
  /** Information density: how much text per UI element. */
  infoDensity: 'minimal' | 'normal' | 'rich';
  /** Whether to show progression suggestions. */
  showProgression: boolean;
  /** Whether to show detailed insights. */
  showInsights: boolean;
  /** Whether to show identity-driven coaching cues. */
  showCoaching: boolean;
  /** Visual noise level: how "busy" the UI feels. */
  visualNoise: 'low' | 'medium' | 'high';
}

/**
 * Compute experience intensity for the current moment.
 * Single source of truth for "how much UI to show".
 */
export function computeExperienceIntensity(
  osState: TrainingOSState,
  fatigue: FatigueSignal | null,
  identity: FitnessIdentity
): ExperienceIntensity {
  const phaseGroup = getPhaseGroup(osState);

  // Base intensity by phase group
  const base = phaseGroupBaseIntensity(phaseGroup);

  // Fatigue modifier (fatigue → reduce everything)
  const fatigueMod = fatigueModifier(fatigue);

  // Identity modifier (identity tweaks the base)
  const identityMod = identityModifier(identity);

  return mergeIntensity(base, fatigueMod, identityMod);
}

// ── Base Intensity by Phase ────────────────────────────────────────────────

function phaseGroupBaseIntensity(
  phase: ReturnType<typeof getPhaseGroup>
): ExperienceIntensity {
  switch (phase) {
    case 'entry':
      return {
        tipCap: 1,
        chipCap: 2,
        animationLevel: 1,
        infoDensity: 'normal',
        showProgression: false,
        showInsights: true,
        showCoaching: true,
        visualNoise: 'low',
      };
    case 'slow':
      return {
        tipCap: 2,
        chipCap: 2,
        animationLevel: 1,
        infoDensity: 'normal',
        showProgression: true,
        showInsights: false,
        showCoaching: true,
        visualNoise: 'low',
      };
    case 'peak':
      return {
        tipCap: 2,
        chipCap: 3,
        animationLevel: 2,
        infoDensity: 'rich',
        showProgression: true,
        showInsights: false,
        showCoaching: true,
        visualNoise: 'medium',
      };
    case 'recovery':
      return {
        tipCap: 1,
        chipCap: 1,
        animationLevel: 0,
        infoDensity: 'normal',
        showProgression: false,
        showInsights: true,
        showCoaching: false,
        visualNoise: 'low',
      };
    case 'finish':
      return {
        tipCap: 0,
        chipCap: 2,
        animationLevel: 2,
        infoDensity: 'rich',
        showProgression: false,
        showInsights: true,
        showCoaching: false,
        visualNoise: 'medium',
      };
  }
}

// ── Fatigue Modifier ───────────────────────────────────────────────────────

function fatigueModifier(fatigue: FatigueSignal | null): Partial<ExperienceIntensity> {
  if (!fatigue) return {};

  switch (fatigue.level) {
    case 'elevated':
      return {
        tipCap: 1,
        chipCap: 1,
        animationLevel: 0,
        infoDensity: 'minimal',
        showProgression: false,
        showInsights: false,
        showCoaching: true,
        visualNoise: 'low',
      };
    case 'moderate':
      return {
        tipCap: 1,
        chipCap: 2,
        animationLevel: 1,
        infoDensity: 'minimal',
        showProgression: false,
        showInsights: false,
        showCoaching: true,
        visualNoise: 'low',
      };
    case 'mild':
      return {
        tipCap: 2,
        chipCap: 2,
        animationLevel: 1,
        infoDensity: 'normal',
        showProgression: true,
        showInsights: false,
        showCoaching: true,
        visualNoise: 'low',
      };
    default:
      return {};
  }
}

// ── Identity Modifier ──────────────────────────────────────────────────────

function identityModifier(identity: FitnessIdentity): Partial<ExperienceIntensity> {
  switch (identity) {
    case 'the_optimizer':
      return { showProgression: true, showInsights: true, infoDensity: 'rich' };
    case 'the_grinder':
      return { showCoaching: true, chipCap: 2, tipCap: 1 };
    case 'the_explorer':
      return { showInsights: true, chipCap: 3, visualNoise: 'medium' };
    case 'the_specialist':
      return { showProgression: true, showCoaching: false, infoDensity: 'normal' };
    case 'the_comeback_kid':
      return { showProgression: false, showCoaching: true, animationLevel: 0, visualNoise: 'low' };
    case 'the_steady_climber':
      return { showProgression: true, showCoaching: true, animationLevel: 1 };
    case 'the_balanced_athlete':
      return { showInsights: true, showCoaching: true, chipCap: 2 };
    default:
      return {};
  }
}

// ── Merge ──────────────────────────────────────────────────────────────────

function mergeIntensity(
  base: ExperienceIntensity,
  fatigue: Partial<ExperienceIntensity>,
  identity: Partial<ExperienceIntensity>
): ExperienceIntensity {
  return {
    tipCap: Math.min(fatigue.tipCap ?? base.tipCap, identity.tipCap ?? base.tipCap),
    chipCap: Math.min(fatigue.chipCap ?? base.chipCap, identity.chipCap ?? base.chipCap),
    animationLevel: (fatigue.animationLevel ?? identity.animationLevel ?? base.animationLevel) as 0 | 1 | 2,
    infoDensity: (fatigue.infoDensity ?? identity.infoDensity ?? base.infoDensity) as ExperienceIntensity['infoDensity'],
    showProgression: (identity.showProgression ?? fatigue.showProgression ?? base.showProgression),
    showInsights: (identity.showInsights ?? fatigue.showInsights ?? base.showInsights),
    showCoaching: (fatigue.showCoaching ?? identity.showCoaching ?? base.showCoaching),
    visualNoise: (fatigue.visualNoise ?? identity.visualNoise ?? base.visualNoise) as ExperienceIntensity['visualNoise'],
  };
}
