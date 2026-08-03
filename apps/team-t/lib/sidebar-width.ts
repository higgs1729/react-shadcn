/**
 * サイドバー幅の共有設定。
 *
 * `components/ui/sidebar.tsx` は編集禁止なので、`SidebarProvider` に幅の state を
 * 持たせることはできない。代わりに `<html>` の `--app-sidebar-width` を単一の正本と
 * し、各 shell は `SidebarProvider` の style で
 * `--sidebar-width: var(--app-sidebar-width, 16rem)` と参照するだけにしてある。
 * これで provider 側は無改造のまま、幅の読み書きがこの1ファイルに閉じる。
 */

export const SIDEBAR_WIDTH_STORAGE_KEY = "sidebar:v1:width"
export const SIDEBAR_WIDTH_CSS_VAR = "--app-sidebar-width"
export const SIDEBAR_RESIZING_ATTR = "data-sidebar-resizing"

export const SIDEBAR_WIDTH_DEFAULT = 256
export const SIDEBAR_WIDTH_MIN = 208
export const SIDEBAR_WIDTH_MAX = 480
/** キーボード操作1回あたりの増減幅。 */
export const SIDEBAR_WIDTH_STEP = 16

type StorageLike = Pick<Storage, "getItem" | "setItem">

export function clampSidebarWidth(width: number) {
  return Math.round(
    Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, width))
  )
}

function resolveStorage(storage?: StorageLike | null) {
  if (storage) {
    return storage
  }

  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    // Safari のプライベートモードなど、localStorage 参照自体が throw する環境。
    return null
  }
}

/** 保存済みの幅。未保存・不正値は null を返し、呼び出し側の既定値に委ねる。 */
export function readStoredSidebarWidth(storage?: StorageLike | null) {
  const store = resolveStorage(storage)
  if (!store) {
    return null
  }

  try {
    const raw = store.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    if (raw === null) {
      return null
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? clampSidebarWidth(parsed) : null
  } catch {
    return null
  }
}

export function writeStoredSidebarWidth(
  width: number,
  storage?: StorageLike | null
) {
  const store = resolveStorage(storage)
  if (!store) {
    return
  }

  try {
    store.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clampSidebarWidth(width)))
  } catch {
    // 保存できなくても操作自体は成立させる(容量超過・書き込み禁止)。
  }
}

/**
 * 幅を実際に反映する。正本は `<html>` の `--app-sidebar-width` だが、
 * `SidebarProvider` にその参照を渡していない画面(在庫 screen が使う
 * `components/blocks/app-sidebar.tsx` 経由など)もあるので、直近の wrapper の
 * `--sidebar-width` にも直接書く。wrapper のインラインスタイルは常に勝つため、
 * どちらの構成でも同じ操作で幅が変わる。
 */
export function applySidebarWidth(width: number, from?: Element | null) {
  if (typeof document === "undefined") {
    return
  }

  const value = `${clampSidebarWidth(width)}px`
  document.documentElement.style.setProperty(SIDEBAR_WIDTH_CSS_VAR, value)

  const wrapper = from?.closest<HTMLElement>('[data-slot="sidebar-wrapper"]')
  wrapper?.style.setProperty("--sidebar-width", value)
}

/**
 * hydration 前に `<html>` へ幅を当てる同期スクリプト。これが無いと初回描画は
 * 既定幅で出てから保存幅に飛ぶ。root layout から `<script>` として差し込む。
 */
export const sidebarWidthPrePaintScript = `(function(){try{var v=window.localStorage.getItem(${JSON.stringify(
  SIDEBAR_WIDTH_STORAGE_KEY
)});if(v===null)return;var n=parseInt(v,10);if(!isFinite(n))return;n=Math.min(${SIDEBAR_WIDTH_MAX},Math.max(${SIDEBAR_WIDTH_MIN},Math.round(n)));document.documentElement.style.setProperty(${JSON.stringify(
  SIDEBAR_WIDTH_CSS_VAR
)},n+"px")}catch(e){}})()`
