import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import "@/styles/runtime-visual-language.css"
import "@/styles/runtime-semantic.css"
import ClientProviders from "@/components/ClientProviders"
import AppShell from "@/components/AppShell"
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
  title: "XFITX - 智能健身系统",
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
      <head>
        {/* iOS splash screens — one per iPhone model family */}
        <link rel="apple-touch-startup-image" href="/api/splash?w=640&h=1136"  media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=750&h=1334"  media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1242&h=2208" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1125&h=2436" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=828&h=1792"  media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1242&h=2688" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1170&h=2532" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1284&h=2778" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1179&h=2556" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
        <link rel="apple-touch-startup-image" href="/api/splash?w=1290&h=2796" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen antialiased`}
      >
        <Providers session={session}>
          <AppShell>{children}</AppShell>
        </Providers>
        <ClientProviders />
      </body>
    </html>
  )
}
