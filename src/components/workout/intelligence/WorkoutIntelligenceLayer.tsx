'use client';

import { memo } from 'react';
import { FatigueBanner, RecoveryStatusPill } from './index';
import type { FatigueSignal, RecoverySuggestion, TrainingInsight } from '@/lib/training/trainingTypes';

interface WorkoutIntelligenceLayerProps {
  fatigue: FatigueSignal | null;
  recovery: RecoverySuggestion[];
  recoveryStatus: string | null;
  insights?: TrainingInsight[];
}

const WorkoutIntelligenceLayer = memo(function WorkoutIntelligenceLayer({
  fatigue,
  recovery,
  recoveryStatus,
  insights,
}: WorkoutIntelligenceLayerProps) {
  return (
    <div className="space-y-2">
      {recoveryStatus && (
        <div className="flex items-center gap-2">
          <RecoveryStatusPill status={recoveryStatus} />
        </div>
      )}
      <FatigueBanner signal={fatigue} />
      {insights && insights.length > 0 && (
        <div className="space-y-2 pt-1">
          {insights.slice(0, 2).map((insight, i) => (
            <div
              key={`${insight.type}-${i}`}
              className="flex items-start gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background:
                  insight.severity === 'positive'
                    ? 'var(--accent-dim)'
                    : insight.severity === 'attention'
                    ? 'rgba(239,68,68,0.06)'
                    : 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-high)' }}>
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default WorkoutIntelligenceLayer;
