"use client";

import { useCallback, useRef } from "react";
import { useWorkoutSession } from "@/stores/workoutSession";
import { useWorkoutTimer } from "@/stores/workoutTimer";

export interface AIInsight {
  id: string;
  type: "suggestion" | "warning" | "pr" | "form" | "recovery";
  message: string;
  confidence: number; // 0-1
  metadata?: Record<string, unknown>;
}

export interface AIObserverState {
  insights: AIInsight[];
  lastAnalyzedAt: number | null;
  isAnalyzing: boolean;
}

/**
 * useAIObserver — AI Extension Hook (Reservation)
 *
 * Principles:
 * - Suggest / Observe / Analyze only
 * - NEVER directly controls UI (no imperative DOM manipulation)
 * - Returns data; UI layer decides how to render
 * - Runs asynchronously, non-blocking
 *
 * Current implementation: placeholder simulation.
 * Future: connect to actual AI inference endpoint.
 */
export function useAIObserver(): AIObserverState {
  const insightsRef = useRef<AIInsight[]>([]);
  const lastAnalyzedRef = useRef<number | null>(null);

  const exercises = useWorkoutSession((s) => s.exercises);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);
  const totalVolume = exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);

  // Simple rule-based analysis as placeholder for real AI
  const analyze = useCallback(() => {
    const insights: AIInsight[] = [];

    // PR detection placeholder
    const hasHighVolume = totalVolume > 5000;
    if (hasHighVolume && totalSets > 5) {
      insights.push({
        id: "pr-potential",
        type: "pr",
        message: "今日训练量较高，关注动作质量",
        confidence: 0.7,
      });
    }

    // Fatigue warning placeholder
    const hasManySets = totalSets > 20;
    if (hasManySets) {
      insights.push({
        id: "fatigue-warning",
        type: "warning",
        message: "组数较多，注意控制组间休息",
        confidence: 0.8,
      });
    }

    insightsRef.current = insights;
    lastAnalyzedRef.current = Date.now();
  }, [totalVolume, totalSets]);

  // In a real implementation, this would be debounced and async
  analyze();

  return {
    insights: insightsRef.current,
    lastAnalyzedAt: lastAnalyzedRef.current,
    isAnalyzing: false,
  };
}

/**
 * useAISuggestions — AI-driven training suggestions
 *
 * Returns recommendation for next set based on historical data.
 * UI layer can display as inline hint or chip.
 */
export function useAISuggestions(exerciseName: string) {
  const exercise = useWorkoutSession((s) =>
    s.exercises.find((e) => e.name === exerciseName)
  );

  const completedSets = exercise?.sets.filter((s) => s.completed && !s.isWarmup) ?? [];
  const lastSet = completedSets[completedSets.length - 1];

  const suggestion = (() => {
    if (!lastSet) return null;

    // Progressive overload suggestion
    if (completedSets.length >= 2) {
      const prev = completedSets[completedSets.length - 2];
      if (prev && lastSet.reps >= prev.reps && lastSet.weight === prev.weight) {
        return {
          weight: lastSet.weight + 2.5,
          reps: lastSet.reps,
          reason: "上次完成度好，建议加重",
        };
      }
    }

    return null;
  })();

  return {
    suggestion,
    trend: completedSets.length > 0 ? "stable" : "new",
  };
}

/**
 * useAIVoiceLog — Voice input reservation hook
 *
 * Returns a function that can be called to start voice capture.
 * UI layer provides the microphone button and visual feedback.
 */
export function useAIVoiceLog() {
  const isListeningRef = useRef(false);

  const startListening = useCallback(() => {
    // Reservation: Web Speech API or custom STT endpoint
    // eslint-disable-next-line no-console
    console.log("[AI Voice] Listening started (placeholder)");
    isListeningRef.current = true;

    // Simulate capture end after 3s
    setTimeout(() => {
      isListeningRef.current = false;
      // eslint-disable-next-line no-console
      console.log("[AI Voice] Captured: '三组 80公斤 八次' (placeholder)");
    }, 3000);
  }, []);

  return {
    isListening: isListeningRef.current,
    startListening,
    // Future: transcript, confidence, parsedSet
  };
}
