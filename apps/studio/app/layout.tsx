import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { sidebarWidthPrePaintScript } from "@/lib/sidebar-width"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <head>
        {/* 保存済みのサイドバー幅を hydration 前に当てる。next-themes と同じく、
            描画後に直すと既定幅から一瞬跳ねるため同期スクリプトで先に入れる。 */}
        <script dangerouslySetInnerHTML={{ __html: sidebarWidthPrePaintScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
