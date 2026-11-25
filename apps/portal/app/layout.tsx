import type { Metadata, Viewport } from "next"
import { Noto_Sans_JP } from "next/font/google"

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

// 本文書体。可変フォントなので weight は書かない（globals.css が 450 を取りに行く）。
// subsets は preload するチャンクの指定でしかなく、日本語のグリフは
// unicode-range で分割された別チャンクとして必要な分だけ落ちてくる。
// Noto Sans JP に "japanese" という subset 名は無い（cyrillic / latin / latin-ext / vietnamese のみ）。
// next/font はビルド時に self-host するので、静的 export でも Google への実行時アクセスは出ない。
const face = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--face-jp",
})

// 出現とタイプ表示の初期状態（隠す側）は js-anim が付いて初めて効く。
// 描画より前に付けないと、一度見えたものが隠れてから出る絵になるので、
// 08 と同じく <head> のインラインスクリプトで付ける。演出を見せるページなので、
// OS の Reduce Motion 設定に関係なく通常は有効にする。
//
// 同じ場所で、ヒーローを 3D で出すかも決める（hero-3d）。読み込み画面を最初の描画から
// 被せるには、描画より前に決まっている必要があるため。2D に戻すのは環境の上で 3D が
// 無理なとき（WebGL2 が無い）だけ。動きを減らす設定の人にも 3D を出す（本人 2026-11-23）。
// 見るのは webgl2 だけ。three は r163 で WebGL1 を外しており（r185 の WebGLRenderer は
// webgl2 しか取らない）、webgl だけの端末で 3D を試すと three と映像を落としてから失敗する
// （本人のスマホで 3D が出ない件を調べて直した。本人 2026-11-25）。
// 読み込みに失敗したときの 2D への戻りは hero-scene.tsx が受け持つ。
const enableMotion = `(function(){var d=document.documentElement;d.classList.add('js-anim');try{if(!document.createElement('canvas').getContext('webgl2'))return;d.classList.add('hero-3d')}catch(e){}})()`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 上のスクリプトが className を足すので、hydration の差分は見なくてよい
    <html lang="ja" className={face.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableMotion }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
