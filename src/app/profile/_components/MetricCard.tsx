"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  valueText: string;
  timeText?: string;
  onClick?: () => void;
};

export function MetricCard({ label, valueText, timeText, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border",
        "px-4 py-4",
        "transition-colors",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        minHeight: 88,
      }}
      aria-label={`${label}，${valueText}`}
    >
      <div className="text-xs font-semibold" style={{ color: "var(--text-low)" }}>
        {label}
      </div>
      <div className="mt-2 text-lg font-black tracking-tight" style={{ color: "var(--foreground)" }}>
        {valueText}
      </div>
      {timeText ? (
        <div className="mt-2 text-[11px]" style={{ color: "var(--text-faint)" }}>
          {timeText}
        </div>
      ) : (
        <div className="mt-2 text-[11px]" style={{ color: "transparent" }}>
          .
        </div>
      )}
    </button>
  );
}
