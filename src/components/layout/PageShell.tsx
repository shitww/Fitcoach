'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ── PageShell ─────────────────────────────────────────────────────────────────
// Wraps every page with the standard bg + flex-column shell.
export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`page-shell ${className}`}>
      {children}
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
// Sticky top bar. Covers three patterns:
//   1. Root tab page   — just a title (no back button)
//   2. Child page      — back button + title
//   3. Detail page     — back button + title + action slot (right side)
interface PageHeaderProps {
  title: string
  /** Renders a ← back arrow linked here. Omit for root tab pages. */
  backHref?: string
  /** Callback for back instead of href */
  onBack?: () => void
  /** Right-side action(s): icon button, badge, etc. */
  action?: ReactNode
  /** Optional subtitle under the title */
  subtitle?: string
}

export function PageHeader({ title, backHref, onBack, action, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      {/* Back button */}
      {(backHref || onBack) && (
        backHref ? (
          <Link
            href={backHref}
            className="shrink-0 w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={onBack}
            className="shrink-0 w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )
      )}

      {/* Title block */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-foreground truncate leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right action slot */}
      {action && (
        <div className="shrink-0 flex items-center gap-2">
          {action}
        </div>
      )}
    </header>
  )
}

// ── PageContent ───────────────────────────────────────────────────────────────
// The scrollable body. Use `bare` for detail pages without a bottom tab bar.
interface PageContentProps {
  children: ReactNode
  bare?: boolean
  className?: string
}

export function PageContent({ children, bare = false, className = '' }: PageContentProps) {
  return (
    <main className={`${bare ? 'page-content-bare' : 'page-content'} ${className}`}>
      {children}
    </main>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
// Vertical rhythm unit. Optional labelled title above.
interface SectionProps {
  children: ReactNode
  title?: string
  className?: string
}

export function Section({ children, title, className = '' }: SectionProps) {
  return (
    <section className={`section ${className}`}>
      {title && <p className="section-title">{title}</p>}
      {children}
    </section>
  )
}
