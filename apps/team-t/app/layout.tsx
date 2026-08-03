import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { sidebarWidthPrePaintScript } from "@/lib/sidebar-width"
import { cn } from "@/lib/utils"

// next.config.ts exposes the app's full basePath here, so asset URLs stay
// correct whether the app is served from "/team-t" locally or from
// "/react-shadcn/team-t" on GitHub Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const title = "Team T API Lab — ひらめきの入口を、見つけよう。"
const description =
  "触って見つけるWeb API。気になるジャンルから探索を始めよう。"
const metadataBase = new URL(
  process.env.SITE_ORIGIN ?? "https://higgs1729.github.io"
)
const socialImageUrl = new URL(
  `${basePath}/assets/team-t-link-preview.png`,
  metadataBase
)
const socialImageAlt = "Team T API Lab。ひらめきの入口を、見つけよう。"

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Team T API Lab",
    title,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        {/* 保存済みのサイドバー幅を hydration 前に当てる。next-themes と同じく、
            描画後に直すと既定幅から一瞬跳ねるため同期スクリプトで先に入れる。 */}
        <script
          dangerouslySetInnerHTML={{ __html: sidebarWidthPrePaintScript }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
