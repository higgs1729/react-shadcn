"use client"

import * as React from "react"

import {
  getTeamTAccent,
  type TeamTPreferences,
} from "@/lib/team-t-app/preferences"

const accentProperties = [
  "--primary",
  "--sidebar-primary",
  "--ring",
  "--sidebar-ring",
] as const

/**
 * Team T の外観設定を <html> へ適用する。
 *
 * 共有 `components/ui/sidebar.tsx` はモバイル時にサイドバーを Sheet ポータルで
 * 描画し、className も渡さない。ラッパー div にテーマ変数を置くと届かないため、
 * 適用先を <html> にしてポータル全体へ継承させている。
 *
 * <html> はルートの next-themes とも共有するので、mount 時の状態を控えて
 * unmount で必ず戻す。
 */
export function useTeamTAppearance({
  theme,
  accent,
  emphasizeBorders,
  reduceMotion,
}: TeamTPreferences) {
  React.useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains("dark")
    const previousReduceMotion = root.dataset.reduceMotion
    const previousEmphasizeBorders = root.dataset.emphasizeBorders
    const previousAccent = accentProperties.map(
      (property) => [property, root.style.getPropertyValue(property)] as const
    )

    return () => {
      delete root.dataset.teamTTheme
      root.classList.toggle("dark", hadDark)

      if (previousReduceMotion === undefined) delete root.dataset.reduceMotion
      else root.dataset.reduceMotion = previousReduceMotion

      if (previousEmphasizeBorders === undefined)
        delete root.dataset.emphasizeBorders
      else root.dataset.emphasizeBorders = previousEmphasizeBorders

      for (const [property, value] of previousAccent) {
        if (value) root.style.setProperty(property, value)
        else root.style.removeProperty(property)
      }
    }
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    root.dataset.teamTTheme = theme
    root.classList.toggle("dark", theme !== "light")
    root.dataset.reduceMotion = String(reduceMotion)
    root.dataset.emphasizeBorders = String(emphasizeBorders)

    if (theme === "midnight") {
      // ミッドナイトは配色固定。inline 上書きを外して globals.css の値へ戻す。
      for (const property of accentProperties) {
        root.style.removeProperty(property)
      }
      return
    }

    const palette = getTeamTAccent(accent)
    root.style.setProperty("--primary", palette.primary)
    root.style.setProperty("--sidebar-primary", palette.sidebar)
    root.style.setProperty("--ring", palette.ring)
    root.style.setProperty("--sidebar-ring", palette.ring)
  }, [accent, emphasizeBorders, reduceMotion, theme])
}
