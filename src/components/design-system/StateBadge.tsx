"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =====================================================
   FitCoach VNext — Semantic State Colors
   5 states: success, warning, danger, recovery, inactive
   No arbitrary color values. All derived from tokens.
   ===================================================== */

type StateVariant = "success" | "warning" | "danger" | "recovery" | "inactive";

const stateMap: Record<
  StateVariant,
  { bg: string; text: string; border: string }
> = {
  success: {
    bg: "bg-success/10",
    text: "text-success-foreground",
    border: "border-success/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning-foreground",
    border: "border-warning/20",
  },
  danger: {
    bg: "bg-danger/10",
    text: "text-danger-foreground",
    border: "border-danger/20",
  },
  recovery: {
    bg: "bg-recovery/10",
    text: "text-recovery-foreground",
    border: "border-recovery/20",
  },
  inactive: {
    bg: "bg-inactive/10",
    text: "text-inactive-foreground",
    border: "border-inactive/20",
  },
};

interface StateBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StateVariant;
  dot?: boolean;
}

export function StateBadge({
  variant,
  dot = false,
  children,
  className,
  ...props
}: StateBadgeProps) {
  const s = stateMap[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold border",
        s.bg,
        s.text,
        s.border,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-success": variant === "success",
            "bg-warning": variant === "warning",
            "bg-danger": variant === "danger",
            "bg-recovery": variant === "recovery",
            "bg-inactive": variant === "inactive",
          })}
        />
      )}
      {children}
    </span>
  );
}

/* ── State dot only ── */
export function StateDot({
  variant,
  className,
}: {
  variant: StateVariant;
  className?: string;
}) {
  return (
    <span
      className={cn("h-2 w-2 rounded-full", className, {
        "bg-success": variant === "success",
        "bg-warning": variant === "warning",
        "bg-danger": variant === "danger",
        "bg-recovery": variant === "recovery",
        "bg-inactive": variant === "inactive",
      })}
    />
  );
}

/* ── State text (no background) ── */
export function StateText({
  variant,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant: StateVariant }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        {
          "text-success": variant === "success",
          "text-warning": variant === "warning",
          "text-danger": variant === "danger",
          "text-recovery": variant === "recovery",
          "text-inactive": variant === "inactive",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
