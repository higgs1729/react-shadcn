import type { Metadata, Viewport } from "next"

import { ASSET_BASE_URL } from "@/lib/asset-base"

import "./globals.css"

export const metadata: Metadata = {
  // OG 画像は絶対 URL でないと拾われない。ページ自身の URL は GitHub Pages。
  metadataBase: new URL("https://higgs1729.github.io"),
  title: "higgs1729｜常に、学びを止めない",
  description: "higgs1729 の制作物。今までの制作物をまとめています。",
  openGraph: {
    type: "website",
    title: "higgs1729｜常に、学びを止めない",
    description: "今までの制作物をまとめています。",
    images: [`${ASSET_BASE_URL}/portal-previews/w-tsunagime.webp`],
    locale: "ja_JP",
  },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: "#121317",
}

// 出現とタイプ表示の初期状態（隠す側）は js-anim が付いて初めて効く。
// 描画より前に付けないと、一度見えたものが隠れてから出る絵になるので、
// 08 と同じく <head> のインラインスクリプトで付ける。
const enableMotion = `if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-anim')}`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 上のスクリプトが className を足すので、hydration の差分は見なくてよい
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableMotion }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
