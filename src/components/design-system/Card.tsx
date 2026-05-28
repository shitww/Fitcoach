"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =====================================================
   FitCoach VNext — Card System
   Only 4 card types allowed across the entire app:
   - Primary   : default content surface
   - Secondary : subdued grouping surface
   - Glass     : overlay / floating surface
   - Metric    : compact data display
   ===================================================== */

const baseCard = "border border-border transition-colors";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const CardPrimary = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Comp = "div", ...props }, ref) => (
    <Comp
      ref={ref as any}
      className={cn(baseCard, "bg-card text-card-foreground rounded-xl", className)}
      {...props}
    />
  )
);
CardPrimary.displayName = "CardPrimary";

export const CardSecondary = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Comp = "div", ...props }, ref) => (
    <Comp
      ref={ref as any}
      className={cn(baseCard, "bg-secondary text-secondary-foreground rounded-xl", className)}
      {...props}
    />
  )
);
CardSecondary.displayName = "CardSecondary";

export const CardGlass = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Comp = "div", ...props }, ref) => (
    <Comp
      ref={ref as any}
      className={cn(
        baseCard,
        "bg-card/80 backdrop-blur-xl text-card-foreground rounded-xl",
        className
      )}
      {...props}
    />
  )
);
CardGlass.displayName = "CardGlass";

export const CardMetric = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Comp = "div", ...props }, ref) => (
    <Comp
      ref={ref as any}
      className={cn(baseCard, "bg-card text-card-foreground rounded-lg", className)}
      {...props}
    />
  )
);
CardMetric.displayName = "CardMetric";

/* ── Convenience: strict card builder (no arbitrary radius/shadow) ── */
export function Card({
  variant = "primary",
  className,
  ...props
}: CardProps & { variant?: "primary" | "secondary" | "glass" | "metric" }) {
  const map = {
    primary: CardPrimary,
    secondary: CardSecondary,
    glass: CardGlass,
    metric: CardMetric,
  };
  const Comp = map[variant];
  return <Comp className={className} {...props} />;
}
