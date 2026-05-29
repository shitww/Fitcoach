// ── Emotional Runtime Type System ────────────────────────────────────────────
// Phase 7: Emotionally Adaptive Fitness Runtime
// Calm motivation · subtle progress · long-term growth visibility
// ─────────────────────────────────────────────────────────────────────────────

// ── Momentum ──────────────────────────────────────────────────────────────────

export type MomentumPhase =
  | 'rising'          // training load increasing, performance up
  | 'consistent_flow' // stable, well-paced training rhythm
  | 'fatigue_risk'    // over-training signals detected
  | 'recovery_phase'  // deliberate lighter period
  | 're_entry'        // returning after extended gap
  | 'building'        // new or early-stage trainee

export interface TrainingMomentumState {
  phase: MomentumPhase
  score: number                    // 0–100 composite momentum score
  trend: 'up' | 'stable' | 'down'
  weeklyFrequency: number          // sessions in last 7 days
  twoWeekFrequency: number         // sessions in last 14 days
  consistencyScore: number         // 0–1, higher = more consistent
  daysSinceLastWorkout: number
  headline: string                 // e.g. "过去 3 周训练稳定性非常高"
  subheadline: string | null       // e.g. "今天适合继续 Pull Day"
  insightLine: string | null       // subtle 1-line insight for hero
}

export interface MomentumSurface {
  momentum: TrainingMomentumState
  badge: MomentumBadge | null
  suggestion: string | null        // "今天适合轻量训练"
}

export interface MomentumBadge {
  label: string
  color: string
  bg: string
}

// ── Achievements ──────────────────────────────────────────────────────────────

export type MicroAchievementType =
  | 'consistency'    // maintained training frequency
  | 'strength_trend' // progressive strength increase
  | 'recovery_discipline' // improving recovery habits
  | 'volume_milestone'  // cumulative volume threshold reached
  | 'frequency_pb'   // personal best weekly frequency
  | 're_entry'       // successful re-engagement
  | 'longevity'      // been training for X weeks/months

export interface MicroAchievement {
  id: string
  type: MicroAchievementType
  title: string               // e.g. "连续 4 周保持 Push Day"
  description: string         // e.g. "过去 4 周你的胸部训练稳定性显著提升"
  earnedAt: string            // ISO date
  isNew: boolean              // discovered this session
  displayStyle: 'inline' | 'card' // inline = tiny chip, card = summary row
}

export interface ProgressMilestone {
  milestoneId: string
  label: string               // e.g. "100 组背部训练"
  currentValue: number
  targetValue: number
  unit: string
  completedAt: string | null
  progressPct: number         // 0–100
}

export interface AchievementSurface {
  newAchievements: MicroAchievement[]   // earned this session
  recentAchievements: MicroAchievement[] // last 30 days
  milestones: ProgressMilestone[]
  hasNewAchievement: boolean
}

// ── Reflection ────────────────────────────────────────────────────────────────

export interface WorkoutReflection {
  sessionId: string | null
  sessionDate: string
  muscleGroups: string[]
  intensityVsAvg: number          // e.g. +15 = 15% above recent avg
  intensityLabel: 'lighter' | 'similar' | 'heavier'
  highlightExercise: string | null  // "上斜卧推表现稳定提升"
  highlightMessage: string | null
  estimatedRecoveryHours: [number, number]  // e.g. [48, 72]
  consistencyNote: string | null
  tone: 'analytical' | 'calm'
}

export interface SessionSummary {
  headline: string              // "今天胸部训练强度高于过去 2 周均值"
  bullets: string[]             // detail lines
  recoveryLine: string          // "预计胸部恢复：48–72 小时"
  progressLine: string | null   // long-term trend note
}

export interface RecoveryReflection {
  muscleGroup: string
  estimatedRecoveryHours: [number, number]
  fatigueLevel: 'low' | 'moderate' | 'high'
  recommendedNextSessionIn: string  // e.g. "2–3 天后"
  note: string
}

// ── Encouragement ─────────────────────────────────────────────────────────────

export type EncouragementTone =
  | 'quiet_positive'   // subtle good-job
  | 'analytical_good'  // "你的节奏正在变稳定"
  | 'recovery_care'    // "最近训练频率偏高，建议增加恢复"
  | 're_entry_warm'    // "很高兴看到你重新开始训练"
  | 'consistency_note' // "你的训练节奏正在变稳定"

export interface EncouragementMessage {
  tone: EncouragementTone
  text: string
  isVisible: boolean     // false = suppressed (spam prevention)
  suppressUntil: string | null  // ISO date to suppress until
}

export interface BurnoutRiskState {
  isAtRisk: boolean
  riskLevel: 'none' | 'mild' | 'moderate' | 'high'
  signals: string[]              // e.g. ["频率偏高", "恢复时间不足"]
  recommendation: string | null  // "建议本周增加一天恢复"
}

export interface ReEngagementSuggestion {
  type: 'light_session' | 'familiar_exercise' | 'short_session' | 'rest_day'
  headline: string
  description: string
  lowFriction: boolean   // is this a low-barrier option?
}

// ── Adaptive Streak ───────────────────────────────────────────────────────────

export interface AdaptiveStreak {
  flexibleConsistency: number   // sessions / 14 days (e.g. 9/14)
  flexibleWindow: number        // e.g. 14
  consistencyPct: number        // 0–100
  rawStreak: number             // traditional consecutive-day streak
  protectedStreak: number       // streak counting rest days as "OK"
  isOnTrack: boolean
  onTrackMessage: string        // "过去 14 天完成 9 次训练"
  restDaysThisWeek: number
  isRecoveryAware: boolean      // rest days not penalized
}

export interface ConsistencyScore {
  score: number                 // 0–100
  grade: 'excellent' | 'good' | 'building' | 'returning'
  label: string                 // "训练节奏稳定"
  trend: 'improving' | 'stable' | 'declining'
  windowDays: number
}

export interface StreakProtection {
  isProtected: boolean
  protectionReason: string | null  // "恢复日"
  recoveryDaysAllowed: number
}

// ── Progress Narrative ────────────────────────────────────────────────────────

export interface StrengthTrend {
  exerciseName: string
  periodWeeks: number
  startWeight: number
  currentWeight: number
  deltaKg: number
  deltaPct: number
  trend: 'up' | 'stable' | 'down'
  trendLabel: string  // "稳定提升" | "保持稳定" | "略有下降"
}

export interface VolumeTrend {
  muscleGroup: string
  periodWeeks: number
  startVolume: number
  currentVolume: number
  deltaPct: number
  trend: 'up' | 'stable' | 'down'
  label: string       // "胸部训练容量 ↑ 18%"
}

export interface ProgressNarrative {
  periodWeeks: number
  headline: string                // "过去 8 周整体稳定上升"
  strengthTrends: StrengthTrend[]
  volumeTrends: VolumeTrend[]
  stabilityDelta: number          // +22% consistency
  recoveryImprovement: string | null
  storyLines: string[]            // 2–3 narrative sentences
  tone: 'positive' | 'neutral' | 'analytical'
}

// ── Training Identity ─────────────────────────────────────────────────────────

export type TrainingTrait =
  | 'high_consistency'
  | 'progressive_overload'
  | 'push_pull_discipline'
  | 'volume_focused'
  | 'strength_focused'
  | 'recovery_aware'
  | 'compound_heavy'
  | 'minimalist'
  | 'high_frequency'
  | 'long_session'

export interface TrainingIdentity {
  primaryTraits: TrainingTrait[]   // top 2–3
  secondaryTraits: TrainingTrait[]
  dominantSplit: string | null     // e.g. "Push / Pull / Legs"
  sessionLengthProfile: 'short' | 'medium' | 'long'
  intensityProfile: 'low' | 'moderate' | 'high'
  observationNote: string          // observational, not labeling
  traitLabels: string[]            // Chinese display labels
}

export interface IdentitySurface {
  identity: TrainingIdentity
  topTraitLabel: string   // single most defining trait
  traitChips: { label: string; color: string }[]
}

// ── Retention ─────────────────────────────────────────────────────────────────

export type RetentionRiskLevel =
  | 'none'       // actively training
  | 'mild'       // slight drop in frequency
  | 'moderate'   // gap forming
  | 'high'       // extended absence

export interface RetentionRiskState {
  level: RetentionRiskLevel
  daysSinceLastWorkout: number
  signals: string[]
  isAtRisk: boolean
}

export interface RetentionSurface {
  risk: RetentionRiskState
  message: string | null          // subtle re-engagement message
  shouldShow: boolean             // false = don't surface anything
  optimalReEntryDays: string[]    // e.g. ["周三", "周四"] from historical pattern
  suggestion: ReEngagementSuggestion | null
}

export interface ReEngagementWindow {
  predictedReturnDay: string | null   // e.g. "周三"
  confidence: 'low' | 'medium' | 'high'
  basisDays: string[]             // days user historically trains
  note: string                    // "你通常在周三恢复训练节奏"
}

// ── Combined Emotional State (top-level surface) ──────────────────────────────

export interface EmotionalRuntimeState {
  momentum: TrainingMomentumState
  achievement: AchievementSurface
  encouragement: EncouragementMessage | null
  adaptiveStreak: AdaptiveStreak
  consistency: ConsistencyScore
  retention: RetentionSurface
  identity: IdentitySurface | null  // null until enough data
  computedAt: string
}
