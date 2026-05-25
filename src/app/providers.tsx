"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { ToastProvider } from "@/components/Toast"
import { ThemeProvider } from "@/contexts/ThemeContext"

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <ThemeProvider>
      <SessionProvider
        session={session}
        refetchInterval={60 * 60}
        refetchOnWindowFocus={false}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
