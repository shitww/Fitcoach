"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Flame, X, ArrowRight, BarChart2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface DayData {
  date: string;
  workoutId: string;
  duration: number;
  totalVolume: number;
  muscleGroups: string[];
  isCardio: boolean;
  isFreeRecord: boolean;
  exercises: string[];
}
interface CalendarData {
  days: DayData[];
  streak: { current: number; longest: number };
  monthStats: { workouts: number; totalVolume: number; totalDuration: number };
}
// ── Constants ───────────────────────────────────────────────────────────────
const MUSCLE_COLOR: Record<string, string> = {
  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399",
  shoulders: "#FBBF24", arms: "#F87171",
};
const MUSCLE_LABEL: Record<string, string> = {
  chest: "胸", back: "背", legs: "腿", shoulders: "肩", arms: "臂",
};
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function fmt(v: number) {
  return v >= 1000 ? (v / 1000).toFixed(1) + "t" : v + " kg";
}
function fmtMin(s: number) {
  const m = Math.round(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? m % 60 + "m" : ""}` : `${m}min`;
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "range">("view");
  const [selected, setSelected] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const dayMap = new Map<string, DayData>();
  data?.days.forEach(d => dayMap.set(d.date, d));
  const todayStr = toDateStr(today);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/analysis/calendar?year=${year}&month=${month}`, { credentials: "include" });
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  }, [year, month]);

  // eslint-disable-next-line
  useEffect(() => { fetchData(); }, [fetchData]);

  const clearNav = () => { setSelected(null); setRangeStart(null); setRangeEnd(null); };
  const prevMonth = () => { month === 1 ? (setYear(y => y - 1), setMonth(12)) : setMonth(m => m - 1); clearNav(); };
  const nextMonth = () => { month === 12 ? (setYear(y => y + 1), setMonth(1)) : setMonth(m => m + 1); clearNav(); };
  const isAtPresent = year === today.getFullYear() && month === today.getMonth() + 1;

  // Build grid: pad to Mon start
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let offset = firstDay.getDay() - 1; if (offset < 0) offset = 6;
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const ds = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (ds > todayStr) return;
    if (mode === "view") { setSelected(p => p === ds ? null : ds); }
    else {
      if (!rangeStart || (rangeStart && rangeEnd)) { setRangeStart(ds); setRangeEnd(null); }
      else { if (ds < rangeStart) { setRangeEnd(rangeStart); setRangeStart(ds); } else setRangeEnd(ds); }
    }
  };

  const inRange = (ds: string) => !!(rangeStart && rangeEnd && ds > rangeStart && ds < rangeEnd);
  const isEdge = (ds: string) => ds === rangeStart || ds === rangeEnd;
  const selectedDay = mode === "view" && selected ? dayMap.get(selected) : undefined;
  const hasSheet = mode === "view" && !!selected;
  const hasRangeCTA = mode === "range" && !!rangeStart && !!rangeEnd;

  const fmtDate = (ds: string) => {
    const d = new Date(ds);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleDateString("zh-CN", { weekday: "short" })}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 px-5 pt-14 pb-0"
        style={{ background: "var(--top-bg)", backdropFilter: "blur(16px)" }}>

        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" style={{ color: "var(--text-med)" }} />
          </button>

          {/* Streak */}
          {data && data.streak.current > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
              style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)" }}>
              <Flame className="w-3.5 h-3.5" style={{ color: "#FB923C" }} />
              <span className="text-xs font-black" style={{ color: "#FB923C" }}>{data.streak.current}天</span>
            </div>
          ) : <div className="w-14" />}
        </div>

        {/* Month nav row */}
        <div className="flex items-center justify-between pb-3">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "var(--surface-3)" }}>
            <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-med)" }} />
          </button>

          <div className="text-center">
            <div className="text-xs font-medium" style={{ color: "var(--text-low)" }}>{year}</div>
            <div className="text-2xl font-black leading-tight">{month}月
              {data && !loading && (
                <span className="text-sm font-normal ml-2" style={{ color: "var(--text-low)" }}>
                  {data.monthStats.workouts}次训练
                </span>
              )}
            </div>
          </div>

          <button onClick={nextMonth} disabled={isAtPresent}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: isAtPresent ? "transparent" : "var(--surface-3)" }}>
            <ChevronRight className="w-4 h-4" style={{ color: isAtPresent ? "var(--text-faint)" : "var(--text-med)" }} />
          </button>
        </div>

        {/* Workout sub-tabs */}
        <div className="flex pb-2 gap-2">
          {[{ id: "view", label: "历史" }, { id: "range", label: "区间分析" }].map(tab => (
            <button key={tab.id}
              onClick={() => { setMode(tab.id as "view" | "range"); clearNav(); }}
              className="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: mode === tab.id ? 'var(--accent-dim)' : 'transparent',
                color: mode === tab.id ? 'var(--accent)' : 'var(--text-low)',
                border: mode === tab.id ? '1px solid var(--accent-glow)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Range guide */}
        {mode === "range" && (
          <div className="text-xs pb-3 text-center" style={{ color: "var(--text-low)" }}>
            {!rangeStart ? "点击起始日期" : !rangeEnd ? "再点击结束日期" : `${rangeStart} → ${rangeEnd}`}
          </div>
        )}

        {/* Weekday header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} className="text-center text-xs py-1" style={{ color: i >= 5 ? "var(--text-faint)" : "var(--text-low)" }}>{d}</div>
          ))}
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="px-2 pb-6" style={{ paddingBottom: (hasSheet || hasRangeCTA) ? 200 : 100 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", paddingTop: 8 }} className="animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center py-2 gap-1">
                <div className="w-7 h-5 rounded" style={{ background: "var(--surface-3)" }} />
                <div className="w-3 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="py-2" />;
              const ds = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dd = dayMap.get(ds);
              const isToday = ds === todayStr;
              const isSel = selected === ds && mode === "view";
              const isFuture = ds > todayStr;
              const inR = inRange(ds);
              const edge = isEdge(ds) && mode === "range";

              // Number circle style
              let numBg = "transparent";
              let numColor = isFuture ? "var(--text-faint)" : "var(--text-high)";
              if (isToday) { numBg = "var(--accent)"; numColor = "#000"; }
              if (isSel) { numBg = "var(--accent-dim)"; numColor = "var(--accent)"; }
              if (edge) { numBg = "#60A5FA"; numColor = "#fff"; }
              if (inR) numColor = "#60A5FA";

              return (
                <button key={ds} onClick={() => handleDayClick(day)}
                  disabled={isFuture}
                  className="flex flex-col items-center py-2 transition-all active:opacity-60 relative"
                  style={{ background: inR ? "rgba(96,165,250,0.12)" : "transparent" }}>

                  {/* Day number */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: numBg }}>
                    <span className="text-sm font-semibold leading-none" style={{ color: numColor }}>{day}</span>
                  </div>

                  {/* Workout dot indicators */}
                  <div className="flex items-center justify-center gap-0.5 mt-1 h-2">
                    {dd?.isCardio && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FB923C" }} />}
                    {dd?.isFreeRecord && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#94a3b8" }} />}
                    {dd?.muscleGroups.slice(0, 3).map(mg => (
                      <div key={mg} className="w-1.5 h-1.5 rounded-full" style={{ background: MUSCLE_COLOR[mg] || "#888" }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 px-2">
            {[["#60A5FA","胸"],["#A78BFA","背"],["#34D399","腿"],["#FBBF24","肩"],["#F87171","臂"],["#FB923C","有氧"],["#94a3b8","自由"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-faint)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />{l}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom sheet: selected day (workout) ── */}
      {hasSheet && (
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 -16px 48px rgba(0,0,0,0.3)" }}>
          <div className="px-5 pt-4 max-w-md mx-auto" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--surface-3)" }} />

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-base font-black" style={{ color: 'var(--foreground)' }}>{selected && fmtDate(selected)}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-low)" }}>
                  {selectedDay ? (selectedDay.isCardio ? "有氧训练" : selectedDay.isFreeRecord ? "自由记录" : "力量训练") : "休息日"}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                <X className="w-3.5 h-3.5" style={{ color: "var(--text-low)" }} />
              </button>
            </div>

            {selectedDay ? (
              <>
                {/* Quick stats */}
                <div className="flex gap-3 mb-4">
                  {[
                    { label: "时长", value: selectedDay.duration > 0 ? fmtMin(selectedDay.duration) : "—" },
                    { label: "训练量", value: fmt(selectedDay.totalVolume) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex-1 rounded-xl py-3 text-center" style={{ background: "var(--surface-2)" }}>
                      <div className="text-xs font-black" style={{ color: 'var(--foreground)' }}>{value}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-low)" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Muscle tags */}
                {selectedDay.muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedDay.muscleGroups.map(mg => (
                      <span key={mg} className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: MUSCLE_COLOR[mg] + "20", color: MUSCLE_COLOR[mg] }}>
                        {MUSCLE_LABEL[mg]}
                      </span>
                    ))}
                    {selectedDay.isCardio && (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: "rgba(251,146,60,0.15)", color: "#FB923C" }}>有氧</span>
                    )}
                  </div>
                )}

                {/* Exercises */}
                {selectedDay.exercises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedDay.exercises.map(ex => (
                      <span key={ex} className="text-[11px] px-2 py-0.5 rounded-md"
                        style={{ background: "var(--surface-3)", color: "var(--text-med)" }}>{ex}</span>
                    ))}
                  </div>
                )}

                <button onClick={() => router.push(`/summary?id=${selectedDay.workoutId}`)}
                  className="w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                  style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
                  查看完整训练记录 <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">😴</div>
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>休息日，好好恢复</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom sheet: range CTA ── */}
      {hasRangeCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 -16px 48px rgba(0,0,0,0.3)" }}>
          <div className="px-5 pt-4 pb-10 max-w-md mx-auto">
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--surface-3)" }} />
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4" style={{ color: "#60A5FA" }} />
              <span className="text-sm font-black" style={{ color: "#60A5FA" }}>区间分析</span>
            </div>
            <div className="text-base font-black" style={{ color: 'var(--foreground)' }}>{rangeStart} → {rangeEnd}</div>
            <div className="text-xs mb-4" style={{ color: "var(--text-low)" }}>
              {(() => {
                const days = Math.round((new Date(rangeEnd!).getTime() - new Date(rangeStart!).getTime()) / 86400000) + 1;
                const count = data?.days.filter(d => d.date >= rangeStart! && d.date <= rangeEnd!).length ?? 0;
                return `共 ${days} 天 · ${count} 次训练`;
              })()}
            </div>
            <button onClick={() => router.push(`/training-log?start=${rangeStart}&end=${rangeEnd}`)}
              className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
              style={{ background: "#60A5FA", color: "#000" }}>
              分析此区间 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
