"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =====================================================
   FitCoach VNext — Typography System
   Only 5 text styles allowed across the entire app:
   - Hero Number      : large bold stats / scores
   - Section Title    : page / card headings
   - Metric Label     : data labels
   - Secondary Text   : body / descriptions
   - Caption          : labels, badges, meta
   ===================================================== */

export function HeroNumber({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  className,
  as: Comp = "h2",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Comp
      className={cn(
        "text-xl font-bold leading-snug tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function MetricLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-sm font-medium leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SecondaryText({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[0.8125rem] leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Caption({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
