/** Input: one day's aggregated workout data */
export interface WorkoutDay {
  date: Date;
  volume: number;       // kg × reps (working sets only, type === 'S')
  durationSec: number;
  setCount: number;
  muscleGroups: string[];
}

/** Input: one day's food log aggregate */
export interface FoodLogDay {
  date: string;         // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserNutritionSettings {
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  sex?: 'male' | 'female';
  trainingDaysPerWeek?: number;
}

// ── Fatigue ────────────────────────────────────────────────────────────────────

export type FatigueLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface FatigueResult {
  score: number;                 // 0–100 (higher = more fatigued)
  level: FatigueLevel;
  acwr: number;                  // Acute:Chronic Workload Ratio
  acuteLoad: number;             // 7-day rolling volume sum
  chronicLoad: number;           // 28-day avg weekly volume
  monotony: number;              // Foster's Training Monotony
  strain: number;                // weekly load × monotony
  daysSinceLastWorkout: number;
  recommendation: string;
}

// ── Injury Risk ────────────────────────────────────────────────────────────────

export type InjuryRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface InjuryRiskFactor {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  triggered: boolean;
  value?: number;         // the actual measured value (e.g. ACWR = 1.8)
}

export interface InjuryRiskResult {
  score: number;           // 0–100
  level: InjuryRiskLevel;
  factors: InjuryRiskFactor[];
  triggeredFactors: InjuryRiskFactor[];
  recommendation: string;
}

// ── Nutrition ─────────────────────────────────────────────────────────────────

export type MacroBalance = 'excellent' | 'good' | 'fair' | 'poor';

export interface NutritionAnalysis {
  avgDailyCalories: number;
  estimatedTDEE: number;
  calorieBalance: number;       // positive = surplus, negative = deficit
  proteinAdequacy: number;      // 0–100 score vs target
  carbAdequacy: number;
  fatAdequacy: number;
  macroBalance: MacroBalance;
  issues: string[];
  suggestions: string[];
}

// ── Unified Snapshot ──────────────────────────────────────────────────────────

export interface HealthSnapshot {
  fatigue: FatigueResult;
  injuryRisk: InjuryRiskResult;
  nutrition: NutritionAnalysis;
  generatedAt: Date;
}
