import React from 'react';
import { Battery, AlertTriangle } from 'lucide-react';
import { useCachedFetch } from '@/lib/client-cache';

interface FatigueData {
  fatigueScore: number;
  status: 'ready' | 'medium' | 'high';
  statusText: string;
  todayVolume: number;
  recentVolume: number;
  recommendation: string;
}

const STATUS_CLASSES: Record<FatigueData['status'], { card: string; icon: string; text: string }> = {
  ready:  { card: 'bg-green-500/10 border-green-500/30',   icon: 'text-green-500',  text: 'text-green-500'  },
  medium: { card: 'bg-yellow-400/10 border-yellow-400/30', icon: 'text-yellow-400', text: 'text-yellow-400' },
  high:   { card: 'bg-red-500/10 border-red-500/30',       icon: 'text-red-500',    text: 'text-red-500'    },
};
const STATUS_EMOJI: Record<FatigueData['status'], string> = {
  ready: '🟢', medium: '🟡', high: '🔴',
};

export const FatigueScore: React.FC = () => {
  const { data: fatigueData, isLoading } = useCachedFetch<FatigueData>(
    '/api/analysis/fatigue',
    { credentials: 'include' }
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl p-4 bg-secondary border border-border animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
          <div className="w-8 h-6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!fatigueData) return null;

  const cls = STATUS_CLASSES[fatigueData.status];

  return (
    <div className={`rounded-2xl p-4 transition-all border ${cls.card}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background/50">
          {fatigueData.status === 'high' ? (
            <AlertTriangle className={`w-5 h-5 ${cls.icon}`} />
          ) : (
            <Battery className={`w-5 h-5 ${cls.icon}`} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${cls.text}`}>
              {STATUS_EMOJI[fatigueData.status]} {fatigueData.statusText}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {fatigueData.recommendation}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-black ${cls.text}`}>
            {fatigueData.fatigueScore}
          </div>
          <div className="text-xs text-muted-foreground">疲劳指数</div>
        </div>
      </div>
    </div>
  );
};