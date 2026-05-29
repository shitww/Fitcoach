// ── Monitor Runtime Health ────────────────────────────────────────────────────
// Builds a health report of the entire prediction + runtime system.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeHealthState, RuntimeMetric } from '@/types/runtime-reliability';

const METRICS_STORAGE_KEY = 'fitcoach_runtime_metrics';
const MAX_METRICS = 500;

export interface HealthInput {
  predictionAccuracy: number;
  acceptanceRate: number;
  queueStability: number;
  averageLatencyMs: number;
  persistenceSuccess: number;
  offlineQueueDepth: number;
}

/** Compute the current runtime health state from recent metrics. */
export function monitorRuntimeHealth(input: HealthInput): RuntimeHealthState {
  const {
    predictionAccuracy,
    acceptanceRate,
    queueStability,
    averageLatencyMs,
    persistenceSuccess,
    offlineQueueDepth,
  } = input;

  const memoryUsageEstimateKb = estimateMemoryUsageKb();
  const degradationSignals: string[] = [];
  const recommendations: string[] = [];

  if (predictionAccuracy < 0.5) {
    degradationSignals.push('Prediction accuracy below 50%');
    recommendations.push('Allow more training sessions to build calibration');
  }

  if (acceptanceRate < 0.3) {
    degradationSignals.push('Low prediction acceptance rate (<30%)');
    recommendations.push('Predictions may be too aggressive — auto-suppression active');
  }

  if (averageLatencyMs > 200) {
    degradationSignals.push(`High prediction latency (${Math.round(averageLatencyMs)}ms)`);
    recommendations.push('Consider triggering memory compression');
  }

  if (persistenceSuccess < 0.9) {
    degradationSignals.push('Persistence failures detected');
    recommendations.push('Check device storage space');
  }

  if (offlineQueueDepth > 50) {
    degradationSignals.push(`Large offline queue (${offlineQueueDepth} actions pending)`);
    recommendations.push('Connect to network to sync pending actions');
  }

  if (memoryUsageEstimateKb > 4 * 1024) {
    degradationSignals.push(`High memory usage (~${Math.round(memoryUsageEstimateKb / 1024)}MB)`);
    recommendations.push('Run behavior memory compression');
  }

  const isHealthy = degradationSignals.length === 0;

  return {
    snapshotAt: new Date().toISOString(),
    predictionAccuracy,
    acceptanceRate,
    queueStability,
    averageLatencyMs,
    persistenceSuccess,
    memoryUsageEstimateKb,
    offlineQueueDepth,
    isHealthy,
    degradationSignals,
    recommendations,
  };
}

/** Record a runtime metric for rolling health analysis. */
export function recordMetric(metric: RuntimeMetric): void {
  try {
    const existing = loadMetrics();
    const updated = [...existing, metric].slice(-MAX_METRICS);
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Non-critical
  }
}

/** Load recent metrics from storage. */
export function loadMetrics(): RuntimeMetric[] {
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RuntimeMetric[]) : [];
  } catch {
    return [];
  }
}

/** Compute average latency from recent metrics. */
export function computeAverageLatency(metrics: RuntimeMetric[]): number {
  const latencyMetrics = metrics.filter((m) => m.type === 'latency');
  if (latencyMetrics.length === 0) return 0;
  return latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length;
}

function estimateMemoryUsageKb(): number {
  try {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('fitcoach_')) {
        total += new TextEncoder().encode(localStorage.getItem(key) ?? '').length;
      }
    }
    return Math.round(total / 1024);
  } catch {
    return 0;
  }
}
