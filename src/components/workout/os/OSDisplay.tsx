'use client';

import { memo } from 'react';
import type { TrainingOSOutput } from '@/lib/training/orchestrator/trainingExperienceController';
import OSBadge from './OSBadge';
import OSStatusLine from './OSStatusLine';
import OSSuggestionChip from './OSSuggestionChip';
import OSNarrativeBanner from './OSNarrativeBanner';

interface OSDisplayProps {
  os: TrainingOSOutput;
  onChipAction?: (itemId: string) => void;
}

const OSDisplay = memo(function OSDisplay({ os, onChipAction }: OSDisplayProps) {
  const { displayItems, narrative, intensity } = os;

  // Separate items by type
  const narrativeItem = displayItems.find((i) => i.type === 'narrative');
  const badges = displayItems.filter((i) => i.type === 'badge');
  const statusLines = displayItems.filter((i) => i.type === 'status');
  const chips = displayItems.filter((i) => i.type === 'chip');
  const tips = displayItems.filter((i) => i.type === 'tip' || i.type === 'progression' || i.type === 'warmup');

  return (
    <div className="space-y-2">
      {/* Narrative banner (always top, most prominent) */}
      <OSNarrativeBanner narrative={narrative} />

      {/* Badges (compact, inline) */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((item) => (
            <OSBadge key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Status lines (subtle, full width) */}
      {statusLines.length > 0 && (
        <div className="space-y-1.5">
          {statusLines.map((item) => (
            <OSStatusLine key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Tips / progression / warmup (clickable chips) */}
      {tips.length > 0 && (
        <div className="space-y-1.5">
          {tips.slice(0, intensity.chipCap).map((item) => (
            <OSSuggestionChip
              key={item.id}
              item={item}
              onAction={() => onChipAction?.(item.id)}
            />
          ))}
        </div>
      )}

      {/* Chips (insights, etc.) */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((item) => (
            <OSBadge key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
});

export default OSDisplay;
