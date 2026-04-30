import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import FloatingTimer from "@/components/FloatingTimer"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "XFITX - AI 健身私人教练",
  description: "智能健身训练记录与数据分析",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-black text-white antialiased`}
      >
        <Providers>{children}</Providers>
        <FloatingTimer />
      </body>
    </html>
  )
}
