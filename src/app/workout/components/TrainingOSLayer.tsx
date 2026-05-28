'use client';

/**
 * Training OS Intelligence Layer
 * 
 * This component is loaded dynamically (lazy) ONLY when a workout session
 * is active. It consumes useTrainingOS (Phase 4B) and renders the unified
 * OSDisplay. This keeps the First Load JS minimal — intelligence engines
 * are not initialized until the user actually starts training.
 * 
 * To wire intelligence data, pass the same AdaptiveIntelligenceInput
 * that useAdaptiveIntelligence expects. If no input is provided,
 * the layer renders nothing.
 */

import { memo } from 'react';
import { useTrainingOS } from '@/hooks/useTrainingOS';
import { OSDisplay } from '@/components/workout/os';
import type { AdaptiveIntelligenceInput } from '@/hooks/useAdaptiveIntelligence';

interface TrainingOSLayerProps {
  intelligenceInput: AdaptiveIntelligenceInput;
}

const TrainingOSLayer = memo(function TrainingOSLayer({ intelligenceInput }: TrainingOSLayerProps) {
  const os = useTrainingOS(intelligenceInput);

  if (!os.isInSession) return null;

  return (
    <div className="mb-3">
      <OSDisplay os={os} />
    </div>
  );
});

export default TrainingOSLayer;
