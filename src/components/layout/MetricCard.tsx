'use client'

import { ReactNode, ElementType } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type TrendDir = 'up' | 'down' | 'flat'
type ColorToken = 'primary' | 'success' | 'warning' | 'danger' | 'recovery' | 'muted'

const COLOR_MAP: Record<ColorToken, string> = {
  primary:  'text-primary',
  success:  'text-success',
  warning:  'text-warning',
  danger:   'text-danger',
  recovery: 'text-recovery',
  muted:    'text-muted-foreground',
}

// ── HeroMetricCard ────────────────────────────────────────────────────────────
// Large focal metric. One per section maximum.
interface HeroMetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ElementType
  color?: ColorToken
  badge?: string
  children?: ReactNode
}

export function HeroMetricCard({
  label, value, unit, icon: Icon, color = 'primary', badge, children
}: HeroMetricCardProps) {
  return (
    <div className="metric-hero">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${COLOR_MAP[color]}`} />}
          <span className="section-title" style={{ marginBottom: 0 }}>{label}</span>
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${color}/10 ${COLOR_MAP[color]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-4xl font-black leading-none ${COLOR_MAP[color]}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

// ── CompactMetricCard ─────────────────────────────────────────────────────────
// Grid cell metric — use in card-grid-2 / card-grid-4.
interface CompactMetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ElementType
  color?: ColorToken
}

export function CompactMetricCard({
  label, value, unit, icon: Icon, color = 'primary'
}: CompactMetricCardProps) {
  return (
    <div className="metric-compact">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${COLOR_MAP[color]}`} />}
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-none">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black leading-none ${COLOR_MAP[color]}`}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

// ── InlineMetricCard ──────────────────────────────────────────────────────────
// Horizontal pill — use in card-stack for quick stats lists.
interface InlineMetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ElementType
  color?: ColorToken
}

export function InlineMetricCard({
  label, value, unit, icon: Icon, color = 'muted'
}: InlineMetricCardProps) {
  return (
    <div className="metric-inline">
      {Icon && <Icon className={`w-3.5 h-3.5 ${COLOR_MAP[color]} shrink-0`} />}
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className={`text-sm font-bold ${COLOR_MAP[color]}`}>
        {value}{unit && <span className="font-normal text-muted-foreground text-xs ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

// ── TrendMetricCard ───────────────────────────────────────────────────────────
// Full-width row with trend arrow — analytics / history.
interface TrendMetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: TrendDir
  trendLabel?: string
  icon?: ElementType
  color?: ColorToken
  children?: ReactNode
}

const TREND_ICONS: Record<TrendDir, ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}
const TREND_COLORS: Record<TrendDir, string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-muted-foreground',
}

export function TrendMetricCard({
  label, value, unit, trend, trendLabel, icon: Icon, color = 'primary', children
}: TrendMetricCardProps) {
  const TrendIcon = trend ? TREND_ICONS[trend] : undefined
  return (
    <div className="metric-trend">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${COLOR_MAP[color]}`} />}
        <div>
          <p className="text-xs text-muted-foreground leading-none mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${COLOR_MAP[color]}`}>{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {TrendIcon && trendLabel && (
          <div className={`flex items-center gap-1 ${TREND_COLORS[trend!]}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{trendLabel}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
