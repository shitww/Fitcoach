export type ModelId =
  | 'qwen-turbo'
  | 'qwen-plus'
  | 'qwen-max'
  | 'qwen-vl-plus'
  | 'qwen-vl-max';

export type CoachPersonality = 'patient' | 'direct' | 'energetic';

export type MessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContentPart[];
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: ModelId;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface LLMResponse {
  content: string;
  model: ModelId;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: 'exercise' | 'nutrition' | 'recovery' | 'anatomy' | 'general';
}

export interface RAGResult {
  document: RAGDocument;
  score: number;
}

export interface HealthSnapshotContext {
  fatigueLevel: 'low' | 'moderate' | 'high' | 'very_high';
  fatigueScore: number;
  acwr: number;
  daysSinceLastWorkout: number;
  injuryRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  injuryRiskScore: number;
  triggeredFactorNames: string[];
  calorieBalance: number;
  proteinAdequacy: number;
  macroBalance: string;
  nutritionIssues: string[];
}

export interface UserContext {
  userName: string;
  personality?: CoachPersonality;
  recentWorkouts?: string[];
  recentFoodLogs?: string[];
  userSettings?: {
    fitnessGoal?: string;
    weight?: number;
    height?: number;
  };
  healthSnapshot?: HealthSnapshotContext;
}
