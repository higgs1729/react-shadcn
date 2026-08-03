import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "higgs1729 / apps",
  description:
    "UI設計の記録、公開APIの探索、Python試験の学習。個人制作のアプリ一覧。",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${inter.variable} ${fontMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
