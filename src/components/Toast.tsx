"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { CheckCircle2, XCircle, Info, X, RotateCcw } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

// ── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info"

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number              // ms, default 2500
  undoLabel?: string             // show undo button
  onUndo?: () => void
}

interface ToastItem extends Required<Omit<ToastOptions, "undoLabel" | "onUndo">> {
  id: string
  undoLabel?: string
  onUndo?: () => void
  exiting?: boolean
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (opts: ToastOptions | string) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
  }, [])

  const toast = useCallback((opts: ToastOptions | string) => {
    const options: ToastOptions = typeof opts === "string" ? { message: opts } : opts
    const id = Math.random().toString(36).slice(2)
    const item: ToastItem = {
      id,
      message: options.message,
      type: options.type ?? "success",
      duration: options.duration ?? 2500,
      undoLabel: options.undoLabel,
      onUndo: options.onUndo,
    }
    setToasts(prev => [item, ...prev].slice(0, 4))

    const timer = setTimeout(() => dismiss(id), item.duration)
    timers.current.set(id, timer)
  }, [dismiss])

  useEffect(() => {
    return () => timers.current.forEach(t => clearTimeout(t))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-24 left-0 right-0 z-[999] flex flex-col items-center gap-2 pointer-events-none px-4"
        aria-live="polite"
      >
        {toasts.map(t => (
          <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Bubble ───────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success" />,
  error:   <XCircle     className="w-4 h-4 flex-shrink-0 text-destructive" />,
  info:    <Info        className="w-4 h-4 flex-shrink-0 text-primary" />,
}

const BORDER: Record<ToastType, string> = {
  success: 'color-mix(in srgb, rgb(var(--success)) 25%, transparent)',
  error:   'color-mix(in srgb, rgb(var(--destructive)) 25%, transparent)',
  info:    'color-mix(in srgb, rgb(var(--primary)) 25%, transparent)',
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { t } = useTheme()
  return (
    <div
      className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl max-w-sm w-full shadow-xl"
      style={{
        background: t.navBg,
        border: `1px solid ${BORDER[item.type]}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: item.exiting
          ? 'toast-out 0.3s cubic-bezier(0.4,0,1,1) forwards'
          : 'toast-in 0.3s cubic-bezier(0,0,0.2,1)',
      }}
    >
      {ICONS[item.type]}
      <span className="flex-1 text-sm font-medium leading-snug" style={{ color: t.text }}>{item.message}</span>
      {item.onUndo && (
        <button
          onClick={() => { item.onUndo?.(); onDismiss() }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-muted flex-shrink-0"
          style={{ color: 'var(--accent)' }}
        >
          <RotateCcw className="w-3 h-3" />
          {item.undoLabel ?? '撤销'}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
        style={{ color: t.textMuted }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
