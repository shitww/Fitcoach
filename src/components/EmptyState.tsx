"use client"

import React from "react"
import { useTheme } from "@/contexts/ThemeContext"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const { t } = useTheme()
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}>
      <div
        className={`${compact ? 'w-14 h-14 mb-4' : 'w-20 h-20 mb-6'} rounded-3xl flex items-center justify-center`}
        style={{ background: t.surface2, border: `1px solid ${t.border}` }}
      >
        <div style={{ color: t.textFaint }}>{icon}</div>
      </div>
      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold mb-2`} style={{ color: t.text }}>{title}</h3>
      {description && (
        <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed mb-6 max-w-xs`}
           style={{ color: t.textMuted }}>
          {description}
        </p>
      )}
      {action && (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <button
            onClick={action.onClick}
            className="w-full py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {action.label}
          </button>
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: t.textMuted }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
