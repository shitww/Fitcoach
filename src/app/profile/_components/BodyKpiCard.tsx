"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  weight?: number | null;
  weightDelta?: number | null; // kg, positive = gained
  bodyFat?: number | null;
  waist?: number | null;
  updatedAtText?: string | null;
  onRecordClick?: () => void;
  onTrendClick?: () => void;
};

function formatWeightDelta(delta: number | null | undefined) {
  if (delta == null) return null;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}kg 本周`;
}

export function BodyKpiCard({
  weight,
  weightDelta,
  bodyFat,
  waist,
  updatedAtText,
  onRecordClick,
  onTrendClick,
}: Props) {
  const { t } = useTheme();

  const deltaText = formatWeightDelta(weightDelta);
  const isPositive = (weightDelta ?? 0) > 0;
  const isNegative = (weightDelta ?? 0) < 0;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-semibold" style={{ color: "var(--text-low)" }}>
            体重
          </div>
          <div className="mt-1 text-5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            {weight != null ? `${weight.toFixed(1)}` : "—"}
            <span className="text-lg font-bold ml-1" style={{ color: "var(--text-low)" }}>
              kg
            </span>
          </div>
          {deltaText && (
            <div className="mt-1 flex items-center gap-1 text-sm font-bold">
              {isNegative ? (
                <TrendingDown className="w-4 h-4" style={{ color: "#4ade80" }} />
              ) : isPositive ? (
                <TrendingUp className="w-4 h-4" style={{ color: "#f87171" }} />
              ) : (
                <TrendingUpDown className="w-4 h-4" style={{ color: "var(--text-low)" }} />
              )}
              <span
                style={{
                  color: isNegative ? "#4ade80" : isPositive ? "#f87171" : "var(--text-low)",
                }}
              >
                {deltaText}
              </span>
            </div>
          )}
          {updatedAtText && (
            <div className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
              更新于 {updatedAtText}
            </div>
          )}
        </div>
        <div className="text-right space-y-1">
          {bodyFat != null && (
            <div className="text-sm font-bold" style={{ color: "var(--text-low)" }}>
              体脂 {bodyFat.toFixed(1)}%
            </div>
          )}
          {waist != null && (
            <div className="text-sm font-bold" style={{ color: "var(--text-low)" }}>
              腰围 {waist.toFixed(1)}cm
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          className="h-11 rounded-2xl font-bold"
          onClick={onRecordClick}
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          记录身体数据
        </Button>
        <Button
          variant="secondary"
          className="h-11 rounded-2xl font-bold"
          onClick={onTrendClick}
        >
          查看趋势
        </Button>
      </div>
    </div>
  );
}
