import React, { useState, useEffect } from 'react';
import { Activity, Battery, AlertTriangle } from 'lucide-react';
import { logger } from "@/lib/logger";

interface FatigueData {
  fatigueScore: number;
  status: 'ready' | 'medium' | 'high';
  statusText: string;
  todayVolume: number;
  recentVolume: number;
  recommendation: string;
}

export const FatigueScore: React.FC = () => {
  const [fatigueData, setFatigueData] = useState<FatigueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFatigueData = async () => {
      try {
        const response = await fetch('/api/analysis/fatigue', {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setFatigueData(data);
        }
      } catch (error) {
        logger.error('Error fetching fatigue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFatigueData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800"></div>
          <div className="flex-1">
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!fatigueData) {
    return null;
  }

  const getStatusColor = () => {
    switch (fatigueData.status) {
      case 'ready':
        return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', dot: '#22c55e', text: '#22c55e' };
      case 'medium':
        return { bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)', dot: '#facc15', text: '#facc15' };
      case 'high':
        return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', dot: '#ef4444', text: '#ef4444' };
    }
  };

  const statusColors = getStatusColor();

  const getStatusEmoji = () => {
    switch (fatigueData.status) {
      case 'ready':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🔴';
    }
  };

  return (
    <div 
      className="rounded-2xl p-4 transition-all"
      style={{ 
        background: statusColors.bg, 
        border: `1px solid ${statusColors.border}` 
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          {fatigueData.status === 'high' ? (
            <AlertTriangle className="w-5 h-5" style={{ color: statusColors.dot }} />
          ) : (
            <Battery className="w-5 h-5" style={{ color: statusColors.dot }} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold" style={{ color: statusColors.text }}>
              {getStatusEmoji()} {fatigueData.statusText}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {fatigueData.recommendation}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black" style={{ color: statusColors.text }}>
            {fatigueData.fatigueScore}
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>疲劳指数</div>
        </div>
      </div>
    </div>
  );
};