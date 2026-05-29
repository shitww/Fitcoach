// ── Detect Performance Degradation ───────────────────────────────────────────
// Identifies patterns that indicate the system is getting slower or less accurate.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeMetric } from '@/types/runtime-reliability';

export interface DegradationReport {
  isDegraded: boolean;
  signals: DegradationSignal[];
  severity: 'none' | 'mild' | 'moderate' | 'critical';
  actionRequired: boolean;
  suggestedActions: string[];
}

export interface DegradationSignal {
  type: string;
  description: string;
  severity: 'mild' | 'moderate' | 'critical';
  trend: 'worsening' | 'stable' | 'improving';
  currentValue: number;
  threshold: number;
}

/** Analyze recent metrics for performance degradation patterns.
 *  Detects trends — not just point-in-time values.
 */
export function detectPerformanceDegradation(
  metrics: RuntimeMetric[],
  windowMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): DegradationReport {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const recent = metrics.filter((m) => m.recordedAt >= cutoff);

  const signals: DegradationSignal[] = [];

  // Check latency trend
  const latencySignal = checkLatencyTrend(recent);
  if (latencySignal) signals.push(latencySignal);

  // Check acceptance rate trend
  const acceptanceSignal = checkAcceptanceTrend(recent);
  if (acceptanceSignal) signals.push(acceptanceSignal);

  // Check memory growth trend
  const memorySignal = checkMemoryTrend(recent);
  if (memorySignal) signals.push(memorySignal);

  const severity = deriveSeverity(signals);
  const actionRequired = severity === 'moderate' || severity === 'critical';

  return {
    isDegraded: signals.length > 0,
    signals,
    severity,
    actionRequired,
    suggestedActions: buildActions(signals, severity),
  };
}

function checkLatencyTrend(metrics: RuntimeMetric[]): DegradationSignal | null {
  const latency = metrics.filter((m) => m.type === 'latency');
  if (latency.length < 10) return null;

  const recent5 = average(latency.slice(-5).map((m) => m.value));
  const prior5 = average(latency.slice(-10, -5).map((m) => m.value));

  if (recent5 > 200) {
    return {
      type: 'high_latency',
      description: `Prediction latency ${Math.round(recent5)}ms (threshold: 200ms)`,
      severity: recent5 > 500 ? 'critical' : 'moderate',
      trend: recent5 > prior5 * 1.2 ? 'worsening' : 'stable',
      currentValue: recent5,
      threshold: 200,
    };
  }

  return null;
}

function checkAcceptanceTrend(metrics: RuntimeMetric[]): DegradationSignal | null {
  const acc = metrics.filter((m) => m.type === 'acceptance');
  if (acc.length < 10) return null;

  const recent5 = average(acc.slice(-5).map((m) => m.value));
  const prior5 = average(acc.slice(-10, -5).map((m) => m.value));

  if (recent5 < 0.3) {
    return {
      type: 'low_acceptance',
      description: `Acceptance rate ${Math.round(recent5 * 100)}% (threshold: 30%)`,
      severity: recent5 < 0.15 ? 'critical' : 'mild',
      trend: recent5 < prior5 * 0.8 ? 'worsening' : 'stable',
      currentValue: recent5,
      threshold: 0.3,
    };
  }

  return null;
}

function checkMemoryTrend(metrics: RuntimeMetric[]): DegradationSignal | null {
  const mem = metrics.filter((m) => m.type === 'memory');
  if (mem.length < 5) return null;

  const recent = mem[mem.length - 1].value;
  if (recent > 4 * 1024) {
    return {
      type: 'high_memory',
      description: `Memory usage ~${Math.round(recent / 1024)}MB (threshold: 4MB)`,
      severity: recent > 8 * 1024 ? 'critical' : 'moderate',
      trend: 'worsening',
      currentValue: recent,
      threshold: 4 * 1024,
    };
  }

  return null;
}

function deriveSeverity(signals: DegradationSignal[]): DegradationReport['severity'] {
  if (signals.length === 0) return 'none';
  if (signals.some((s) => s.severity === 'critical')) return 'critical';
  if (signals.some((s) => s.severity === 'moderate')) return 'moderate';
  return 'mild';
}

function buildActions(signals: DegradationSignal[], severity: string): string[] {
  const actions: string[] = [];
  if (signals.some((s) => s.type === 'high_memory')) {
    actions.push('Run behavior memory compression');
  }
  if (signals.some((s) => s.type === 'low_acceptance')) {
    actions.push('Review prediction suppression settings');
  }
  if (signals.some((s) => s.type === 'high_latency')) {
    actions.push('Clear old metrics and compress history');
  }
  return actions;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}
