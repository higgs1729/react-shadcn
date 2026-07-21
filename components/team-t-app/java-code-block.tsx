"use client"

import * as React from "react"
import { codeToHtml, createCssVariablesTheme } from "shiki"

import { cn } from "@/lib/utils"

// shiki の css-variables テーマは色を var(--shiki-token-*) 参照で出力する。
// 実際の色は app/globals.css の :root で design token に紐付けており、
// テーマ/アクセント切替に自動追従する（ここではハイライトのトークン化のみ担当）。
const cssVariablesTheme = createCssVariablesTheme({
  name: "team-t-css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
})

const highlightCache = new Map<string, Promise<string>>()

function highlightJava(code: string) {
  let cached = highlightCache.get(code)
  if (!cached) {
    cached = codeToHtml(code, { lang: "java", theme: cssVariablesTheme })
    highlightCache.set(code, cached)
  }
  return cached
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** intro-tour.ts の javaCode は可読性のためインデント付きで書かれているので、表示前に揃える。 */
function dedent(code: string) {
  const lines = code.replace(/^\n+/, "").replace(/\s+$/, "").split("\n")
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length)
  const shortest = indents.length ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(shortest)).join("\n")
}

export function JavaCodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const dedented = React.useMemo(() => dedent(code), [code])
  // shiki のハイライトは非同期なので、初回描画はプレーンテキストで即表示し、
  // 完了次第トークン付き HTML に差し替える（レイアウトはどちらも同じ pre/code 構造）。
  const [html, setHtml] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    highlightJava(dedented).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [dedented])

  return (
    <div
      className={cn(
        // scrollbar-thin は message-scroller.tsx と同じ、Tailwind のネイティブ
        // scrollbar-color ユーティリティ。ブラウザ標準スクロールバーを直接テーマ色
        // (--border) で描画するので、::-webkit-scrollbar の個別上書きが不要になる。
        "scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent overflow-auto rounded-lg border border-border bg-[var(--shiki-background)] p-3 text-xs leading-relaxed [&_pre]:bg-transparent [&_pre]:whitespace-pre",
        className
      )}
      dangerouslySetInnerHTML={{
        __html: html ?? `<pre><code>${escapeHtml(dedented)}</code></pre>`,
      }}
    />
  )
}
