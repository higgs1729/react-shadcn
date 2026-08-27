"use client"

import { useSyncExternalStore } from "react"

// 変化しないので購読は空。サーバーと初回描画では false、マウント後は true。
const subscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/**
 * 「JS が動いている」ことを、setState を撃たずに知るための読み取り。
 * JS が無いときの姿をサーバー側の描画として出し、動いたら差し替える用途に使う。
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, onClient, onServer)
}
