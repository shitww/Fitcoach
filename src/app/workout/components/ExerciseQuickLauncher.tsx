"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const COMMON_EXERCISES: Record<string, string[]> = {
  shoulders: ['哑铃肩推', '侧平举', '阿诺德推举', '绳索侧平举', '前平举', '俯身飞鸟', '颈后推举'],
  chest:     ['卧推', '哑铃卧推', '上斜卧推', '俯卧撑', '夹胸', '上斜哑铃卧推', '下斜卧推'],
  back:      ['硬拉', '引体向上', '哑铃单臂划船', '杠铃划船', '高位下拉', '坐姿划船', '俯身划船'],
  legs:      ['深蹲', '腿举', '罗马尼亚硬拉', '腿弯举', '弓步蹲', '保加利亚分腿蹲', '提踵'],
  arms:      ['二头肌弯举', '三头肌下压', '锤式弯举', '双杠臂屈伸', '哑铃弯举', 'EZ杠弯举', '绳索弯举'],
  abs:       ['卷腹', '平板支撑', '仰卧举腿', '俄罗斯转体', '悬垂举腿', '卷腹机', '侧平板支撑'],
  fullbody:  ['深蹲', '俯卧撑', '硬拉', '引体向上', '箭步蹲', '壶铃摇摆', '爆发力深蹲'],
};

interface ExerciseQuickLauncherProps {
  muscleGroup?: string;
  muscleGroupLabel?: string;
  userId?: string;
  onSelectExercise: (name: string) => void;
  onOpenSearch: () => void;
}

export default function ExerciseQuickLauncher({
  muscleGroup,
  muscleGroupLabel,
  userId,
  onSelectExercise,
  onOpenSearch,
}: ExerciseQuickLauncherProps) {
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const commonExercises = muscleGroup ? (COMMON_EXERCISES[muscleGroup] ?? []) : [];

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch('/api/workout?limit=20')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data?.data)) return;
        const seen = new Set<string>();
        const recent: string[] = [];
        for (const workout of data.data) {
          for (const ex of (workout.exercises ?? [])) {
            const name: string = ex.exerciseName ?? ex.name ?? '';
            const exMg: string = (ex.muscleGroup ?? '').toLowerCase();
            // Only include exercises that match the current muscle group (when known)
            if (muscleGroup && exMg && exMg !== muscleGroup.toLowerCase()) continue;
            if (name && !seen.has(name)) {
              seen.add(name);
              recent.push(name);
              if (recent.length >= 8) break;
            }
          }
          if (recent.length >= 8) break;
        }
        setRecentExercises(recent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, muscleGroup]);

  const exercises = (() => {
    const all: string[] = [];
    const seen = new Set<string>();
    for (const e of [...recentExercises, ...commonExercises]) {
      if (!seen.has(e)) {
        seen.add(e);
        all.push(e);
      }
    }
    return all.slice(0, 12);
  })();

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4 w-full text-left"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="text-sm font-bold flex-1">
          常用{muscleGroupLabel ?? ''}动作
        </span>
        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-low)' }} />
      </button>
    );
  }

  return (
    <div className="rounded-2xl mb-4 overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-sm font-black">常用{muscleGroupLabel ?? ''}动作</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-low)' }}>
            {recentExercises.length > 0 ? '历史优先 · 点击立即开始' : '点击立即开始'}
          </p>
        </div>
        <button onClick={() => setCollapsed(true)} style={{ color: 'var(--text-low)', background: 'none', border: 'none' }}>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-9 w-20 rounded-xl animate-pulse"
                style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {exercises.map(name => (
              <button
                key={name}
                onClick={() => onSelectExercise(name)}
                className="px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-med)',
                  border: '1px solid var(--border)',
                }}>
                {name.split(' (')[0]}
              </button>
            ))}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold active:scale-95"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text-low)',
                border: '1px solid var(--border)',
              }}>
              <Search className="w-3.5 h-3.5" />
              更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
