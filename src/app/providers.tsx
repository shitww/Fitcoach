"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      options={{
        refetchInterval: 60 * 60, // 每60秒重新获取会话
        refetchOnWindowFocus: false, // 窗口聚焦时不重新获取会话
      }}
    >
      {children}
    </SessionProvider>
  )
}
