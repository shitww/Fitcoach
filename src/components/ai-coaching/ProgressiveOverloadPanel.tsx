import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { useCachedFetch } from '@/lib/client-cache';

interface ExercisePR {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  currentWeight: number;
}

interface VolumeTrendData {
  date: string;
  volume: number;
}

interface ProgressiveOverloadData {
  thisWeekVolume: number;
  lastWeekVolume: number;
  volumeTrend: VolumeTrendData[];
  newPRs: ExercisePR[];
}

export const ProgressiveOverloadPanel: React.FC = () => {
  const { data, isLoading } = useCachedFetch<ProgressiveOverloadData>(
    '/api/analysis/progressive-overload',
    { credentials: 'include' }
  );

  const d = data ?? { thisWeekVolume: 0, lastWeekVolume: 0, volumeTrend: [], newPRs: [] };

  const percentageChange = d.lastWeekVolume === 0
    ? 100
    : Math.round(((d.thisWeekVolume - d.lastWeekVolume) / d.lastWeekVolume) * 100);
  const isPositiveChange = percentageChange >= 0;

  return (
    <div className="rounded-2xl p-5 bg-card border border-border">
      <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-foreground">
        <Trophy className="w-[18px] h-[18px] text-primary" />
        渐进超负荷
        {isLoading && <span className="ml-auto text-[10px] text-muted-foreground animate-pulse">更新中…</span>}
      </h2>

      {/* 本周 vs 上周 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3 bg-secondary">
          <p className="text-xs text-muted-foreground">本周训练量</p>
          <p className="text-xl font-black text-foreground">{d.thisWeekVolume.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
        </div>
        <div className="rounded-xl p-3 bg-secondary">
          <p className="text-xs text-muted-foreground">上周训练量</p>
          <p className="text-xl font-black text-foreground">{d.lastWeekVolume.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
        </div>
      </div>

      {/* 百分比变化 */}
      <div className={`flex items-center mb-4 p-3 rounded-xl border border-border ${isPositiveChange ? 'bg-primary/10' : 'bg-secondary'}`}>
        {isPositiveChange ? (
          <ArrowUp className="mr-2 w-4 h-4 text-primary" />
        ) : (
          <ArrowDown className="mr-2 w-4 h-4 text-muted-foreground" />
        )}
        <span className={`text-sm font-semibold ${isPositiveChange ? 'text-primary' : 'text-muted-foreground'}`}>
          {isPositiveChange ? '+' : ''}{percentageChange}%（较上周）
        </span>
      </div>

      {/* 训练量趋势图 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">近 7 日训练量趋势</h3>
        <div className="h-48 rounded-xl p-3 bg-secondary">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [`${Number(value ?? 0)} kg`, '训练量']}
                labelFormatter={(label) => `日期：${label}`}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 新 PR */}
      {d.newPRs.length > 0 && (
        <div className="rounded-xl p-4 bg-primary/10 border border-border">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-primary">
            <Trophy className="w-4 h-4" />
            今日新纪录 🎉
          </h3>
          <div className="space-y-1.5">
            {d.newPRs.map((pr) => (
              <div key={pr.exerciseId} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{pr.exerciseName}</span>
                <span className="font-bold text-primary">+{pr.currentWeight}kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};