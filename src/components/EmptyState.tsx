"use client"

import React from "react"

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
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}>
      <div
        className={`${compact ? 'w-14 h-14 mb-4' : 'w-20 h-20 mb-6'} rounded-3xl flex items-center justify-center bg-secondary border border-border`}
      >
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold mb-2 text-foreground`}>{title}</h3>
      {description && (
        <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed mb-6 max-w-xs text-muted-foreground`}>
          {description}
        </p>
      )}
      {action && (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <button
            onClick={action.onClick}
            className="w-full py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {action.label}
          </button>
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all hover:bg-muted text-muted-foreground"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
