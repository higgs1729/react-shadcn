"use client"

import * as React from "react"

/**
 * キーボード入力を毎フレーム読める ref へ集約する。
 * WASD / 矢印で移動、Shift でダッシュ、Space でジャンプ、E でうなずく。
 * 筐体・帰還ゲートのインタラクトは Enter（または3Dオブジェクトのクリック）。
 * enabled=false の間はリスナを張らず、押下状態も倒す(playing 中の暴発防止)。
 */

export interface WorldControlState {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  sprint: boolean
  jumpRequested: boolean
  nodRequested: boolean
}

const MOVE_KEYS: Record<string, keyof WorldControlState> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
}

const INTERACT_KEYS = new Set(["Enter", "NumpadEnter"])

export function useWorldControls(
  enabled: boolean,
  onInteract: () => void
): React.RefObject<WorldControlState> {
  const stateRef = React.useRef<WorldControlState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    sprint: false,
    jumpRequested: false,
    nodRequested: false,
  })
  // onInteract を ref 経由で読み、リスナの張り直しを避ける。
  const interactRef = React.useRef(onInteract)
  React.useEffect(() => {
    interactRef.current = onInteract
  }, [onInteract])

  React.useEffect(() => {
    const state = stateRef.current
    if (!enabled) {
      state.forward = state.back = state.left = state.right = false
      state.sprint = false
      state.jumpRequested = false
      state.nodRequested = false
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        if (
          MOVE_KEYS[event.code] ||
          event.code === "Space" ||
          event.code === "KeyE" ||
          event.code === "ShiftLeft" ||
          event.code === "ShiftRight"
        ) {
          event.preventDefault()
        }
        return
      }
      const move = MOVE_KEYS[event.code]
      if (move) {
        state[move] = true
        event.preventDefault()
        return
      }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        state.sprint = true
        event.preventDefault()
        return
      }
      if (event.code === "Space") {
        state.jumpRequested = true
        event.preventDefault()
        return
      }
      if (event.code === "KeyE") {
        state.nodRequested = true
        event.preventDefault()
        return
      }
      if (INTERACT_KEYS.has(event.code)) {
        interactRef.current()
        event.preventDefault()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const move = MOVE_KEYS[event.code]
      if (move) state[move] = false
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        state.sprint = false
      }
    }

    // フォーカスが外れたらキーが押しっぱなしに見える事故を防ぐ。
    const onBlur = () => {
      state.forward = state.back = state.left = state.right = false
      state.sprint = false
      state.jumpRequested = false
      state.nodRequested = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [enabled])

  return stateRef
}
