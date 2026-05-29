"use client";

import { type ReactNode } from "react";

interface WorkoutInstantShellProps {
  children: ReactNode;
}

/**
 * WorkoutInstantShell — SSR-renderable stable skeleton.
 *
 * Principles:
 * - No business hooks
 * - No store subscriptions
 * - No fetch
 * - No complex state
 *
 * It is only: stable骨架 + page space structure.
 * Guaranteed to render immediately without blank flashes.
 */
export default function WorkoutInstantShell({ children }: WorkoutInstantShellProps) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ zIndex: 1 }}>
      {/* Ambient background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(184,255,43,0.04) 0%, transparent 70%), linear-gradient(180deg, #0C0C0E 0%, #08080A 100%)",
        }}
      />

      {/* Header skeleton */}
      <div className="shrink-0 px-5 pt-5 pb-3 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl"
              style={{ background: "var(--rvl-surface-2)", border: "1px solid var(--rvl-border-subtle)" }}
            />
            <div className="space-y-1.5">
              <div
                className="h-4 w-24 rounded-md"
                style={{ background: "var(--rvl-surface-2)" }}
              />
              <div
                className="h-3 w-16 rounded-md"
                style={{ background: "var(--rvl-surface-1)" }}
              />
            </div>
          </div>
          <div
            className="h-8 w-16 rounded-lg"
            style={{ background: "var(--rvl-surface-2)" }}
          />
        </div>
      </div>

      {/* Content area — children hydrate here */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {children}
      </div>

      {/* Bottom dock skeleton */}
      <div
        className="shrink-0 px-5 pt-3 pb-5 safe-bottom runtime-dock"
        style={{
          background: "linear-gradient(to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, transparent 100%)",
        }}
      >
        <div
          className="h-14 w-full rounded-2xl"
          style={{ background: "var(--rvl-surface-2)", border: "1px solid var(--rvl-border-subtle)" }}
        />
      </div>
    </div>
  );
}
