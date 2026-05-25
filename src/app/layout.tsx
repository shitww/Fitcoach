import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import ClientProviders from "@/components/ClientProviders"
import { auth } from "@/lib/auth"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "XFITX - AI 健身私人教练",
  description: "智能健身训练记录与数据分析",
  applicationName: "XFITX",
  appleWebApp: {
    capable: true,
    title: "XFITX",
    statusBarStyle: "black-translucent",
  },
}

/* eslint-disable no-restricted-syntax -- viewport themeColor requires literal hex values for browser metadata */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#000000" }, { media: "(prefers-color-scheme: light)", color: "#ffffff" }],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen antialiased`}
      >
        <Providers session={session}>{children}</Providers>
        <ClientProviders />
      </body>
    </html>
  )
}
