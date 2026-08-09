"use client"

// JSON オブジェクト風の「枠」だけを担当する再利用コンポーネント。
// 中身の見た目は一切持たず、呼び出し側が title / body / detail に ReactNode を
// 渡す。スタイルは .jlist 配下に閉じており .portal に依存しないため、
// 単体で別アプリへ持ち出せる。
//
// ⚠️ interactive なノード(children か detail を持つ)の title は <button> の中に入る。
// title にリンクやボタンを含めると入れ子の対話要素になり、キーボード操作が壊れる。
// リンクを出したいノードは title を静的にし、リンクは body / detail 側へ置く。
import { useEffect, useRef, useState, type ReactNode } from "react"

export type JsonListNode = {
  id: string
  /** 折りたたみ時・detail レイアウト左カラムに出る見出し */
  title: ReactNode
  /** 波括弧の内側に展開される中身(inline レイアウト用) */
  body?: ReactNode
  /** detail レイアウトで右ペインに出る中身 */
  detail?: ReactNode
  /** 入れ子の枠 */
  children?: JsonListNode[]
}

type JsonListLayout = "inline" | "detail"

type JsonListProps = {
  /** 見出し。`label = [` の形で描画される */
  label: string
  nodes: JsonListNode[]
  layout?: JsonListLayout
  /** detail レイアウトで未選択のときに右ペインへ出すもの */
  emptyDetail?: ReactNode
  /** detail レイアウトの初期選択。デスクトップの右ペインを初回から埋める */
  defaultSelectedId?: string
}

type ClickIntent = {
  /** 入れ子の開閉を切り替えるか */
  toggleExpanded: boolean
  /** 右ペインの選択対象にするか */
  select: boolean
}

// title をクリックしたときの挙動。開閉は caret ボタンが常に持つので、
// title は原則「右ペインへの選択」に専念する。これにより detail を持つノードは
// どれも「クリック=右に展開」で一貫し、「閉じたのに詳細が出ている」状態が起きない。
// 例外として detail を持たないノードは title でも開閉できるようにし、
// inline レイアウトで caret だけが当たり判定になるのを避ける。
function resolveClickIntent(
  node: JsonListNode,
  layout: JsonListLayout
): ClickIntent {
  const hasChildren = Boolean(node.children?.length)
  const selectable = layout === "detail" && Boolean(node.detail)

  return {
    toggleExpanded: hasChildren && !selectable,
    select: selectable,
  }
}

function findNode(
  nodes: JsonListNode[],
  id: string | null
): JsonListNode | null {
  if (id === null) return null
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = findNode(node.children ?? [], id)
    if (hit) return hit
  }
  return null
}

type RowsProps = {
  nodes: JsonListNode[]
  layout: JsonListLayout
  depth: number
  expanded: Record<string, boolean>
  selectedId: string | null
  /** isOpen は描画時に解決済みの開閉状態。既定値の二重定義を避けるため呼び出し側へ渡す */
  onActivate: (node: JsonListNode, isOpen: boolean) => void
  onToggle: (node: JsonListNode, isOpen: boolean) => void
}

function JsonListRows({
  nodes,
  layout,
  depth,
  expanded,
  selectedId,
  onActivate,
  onToggle,
}: RowsProps) {
  return (
    <ol className="jlist-list">
      {nodes.map((node, index) => {
        const children = node.children ?? []
        const hasChildren = children.length > 0
        const isOpen = expanded[node.id] ?? depth < 1
        const isSelected = node.id === selectedId
        const intent = resolveClickIntent(node, layout)
        const interactive = intent.toggleExpanded || intent.select
        const showBody = layout === "inline" && node.body !== undefined

        return (
          <li
            className="jlist-item"
            data-selected={isSelected ? "true" : undefined}
            key={node.id}
          >
            <div className="jlist-row">
              <span className="jlist-brace jlist-brace-open" aria-hidden="true">
                {"{"}
              </span>

              <div className="jlist-slot">
                <div className="jlist-titlerow">
                  {/* 開閉は常に caret が持つ。title は選択に専念する */}
                  {hasChildren ? (
                    <button
                      type="button"
                      className="jlist-caret"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "閉じる" : "開く"}`}
                      onClick={() => onToggle(node, isOpen)}
                    >
                      <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                    </button>
                  ) : null}

                  {interactive ? (
                    <button
                      type="button"
                      className="jlist-title jlist-title-button"
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => onActivate(node, isOpen)}
                    >
                      {node.title}
                    </button>
                  ) : (
                    <div className="jlist-title">{node.title}</div>
                  )}
                </div>

                {showBody ? (
                  <div className="jlist-body">{node.body}</div>
                ) : null}

                {hasChildren && isOpen ? (
                  <div className="jlist-children">
                    <span className="jlist-brace" aria-hidden="true">
                      {"["}
                    </span>
                    <JsonListRows
                      nodes={children}
                      layout={layout}
                      depth={depth + 1}
                      expanded={expanded}
                      selectedId={selectedId}
                      onActivate={onActivate}
                      onToggle={onToggle}
                    />
                    <span className="jlist-brace" aria-hidden="true">
                      {"]"}
                    </span>
                  </div>
                ) : null}
              </div>

              <span
                className="jlist-brace jlist-brace-close"
                aria-hidden="true"
              >
                {index === nodes.length - 1 ? "}" : "},"}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function JsonList({
  label,
  nodes,
  layout = "inline",
  emptyDetail,
  defaultSelectedId,
}: JsonListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelectedId ?? null
  )
  // スマホのドリルダウン専用フラグ。selectedId とは独立させることで、初期選択
  // (デスクトップの右ペインを埋める)とスマホの「タップするまで一覧のまま」を
  // 両立させる。表示の切り替えは CSS のメディアクエリだけが行い、ここでは
  // 意図だけを持つ。
  const [drilledIn, setDrilledIn] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)
  // display の実値は CSS のブレークポイントが唯一の正本。matchMedia で幅を
  // 判定すると静的 export の hydration とずれるため、実際にその値で描画される
  // 要素の computed style を読む。
  const probeRef = useRef<HTMLSpanElement>(null)

  // 右ペインは「最後に見たもの」を残す。findNode は開閉状態を見ずに木全体から
  // 引くため、親を閉じて行が隠れても選択とペインの中身は保持される。選択が
  // 解除されるのは他のノードを選んだときだけで、emptyDetail は一度も選んで
  // いない間しか出ない。
  const selected = findNode(nodes, selectedId)

  // ドリルインした直後だけ詳細の先頭へ戻す。一覧を下までスクロールした状態で
  // タップすると、中身だけ入れ替わって途中位置のまま表示されるのを防ぐ。
  useEffect(() => {
    if (!drilledIn) return
    const isMobile = probeRef.current
      ? getComputedStyle(probeRef.current).display !== "none"
      : false
    if (isMobile) detailRef.current?.scrollIntoView({ block: "start" })
  }, [drilledIn])

  function handleToggle(node: JsonListNode, isOpen: boolean) {
    setExpanded((current) => ({ ...current, [node.id]: !isOpen }))
  }

  function handleActivate(node: JsonListNode, isOpen: boolean) {
    const intent = resolveClickIntent(node, layout)
    if (intent.toggleExpanded) {
      handleToggle(node, isOpen)
    }
    if (intent.select) {
      setSelectedId(node.id)
      setDrilledIn(true)
    }
  }

  const tree = (
    <JsonListRows
      nodes={nodes}
      layout={layout}
      depth={0}
      expanded={expanded}
      selectedId={selectedId}
      onActivate={handleActivate}
      onToggle={handleToggle}
    />
  )

  return (
    <div
      className={`jlist jlist-layout-${layout}`}
      data-drilled={drilledIn ? "true" : "false"}
    >
      <style>{styles}</style>
      <span
        className="jlist-viewport-probe"
        ref={probeRef}
        aria-hidden="true"
      />

      {layout === "detail" ? (
        <div className="jlist-split">
          <div className="jlist-tree">
            <div className="jlist-heading">
              <h2>
                {label} <span aria-hidden="true">= [</span>
              </h2>
            </div>
            {tree}
            <div className="jlist-end" aria-hidden="true">
              <span>]</span>
            </div>
          </div>
          <div className="jlist-detail" aria-live="polite" ref={detailRef}>
            <button
              type="button"
              className="jlist-back"
              onClick={() => setDrilledIn(false)}
            >
              ← アプリ一覧へ
            </button>
            {selected?.detail ?? emptyDetail ?? null}
          </div>
        </div>
      ) : (
        <>
          <div className="jlist-heading">
            <h2>
              {label} <span aria-hidden="true">= [</span>
            </h2>
          </div>
          {tree}
          <div className="jlist-end" aria-hidden="true">
            <span>]</span>
          </div>
        </>
      )}
    </div>
  )
}

const styles = `
.jlist {
  --jlist-line: #d8d2ce;
  --jlist-accent: #ea4b17;
  --jlist-gutter: 2.7rem;
  --jlist-row-height: 4.75rem;
  --jlist-mono: var(--font-mono, ui-monospace, monospace);
}
.jlist *, .jlist *::before, .jlist *::after { box-sizing: border-box; }
.jlist-tree,
.jlist-layout-inline {
  counter-reset: jlist-line;
}

.jlist-heading,
.jlist-item,
.jlist-end {
  display: grid;
  grid-template-columns: var(--jlist-gutter) minmax(0, 1fr);
}
.jlist-heading::before,
.jlist-item::before,
.jlist-end::before {
  counter-increment: jlist-line;
  content: counter(jlist-line);
  align-self: center;
  justify-self: center;
  color: #77716d;
  font-family: var(--jlist-mono);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.jlist-heading {
  min-height: var(--jlist-row-height);
  align-items: center;
}
.jlist-heading h2 {
  grid-column: 2;
  margin: 0;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: -0.025em;
}
.jlist-heading h2 span {
  margin-left: 0.45rem;
  font-family: var(--jlist-mono);
  font-size: 0.95rem;
  font-weight: 450;
  letter-spacing: 0;
}

.jlist-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.jlist-item {
  min-height: var(--jlist-row-height);
  align-items: stretch;
}
.jlist-row {
  grid-column: 2;
  display: grid;
  grid-template-columns: 1.6rem minmax(0, 1fr) 2rem;
  align-items: center;
  min-width: 0;
  min-height: var(--jlist-row-height);
  padding-inline: 0.85rem 0.65rem;
  border-left: 3px solid transparent;
}
.jlist-item[data-selected="true"] .jlist-row {
  border-left-color: var(--jlist-accent);
  background: color-mix(in srgb, var(--jlist-accent) 7%, transparent);
}
.jlist-brace {
  font-family: var(--jlist-mono);
  font-size: 1.1rem;
  font-weight: 430;
}
.jlist-brace-close {
  justify-self: end;
  align-self: center;
}
.jlist-item[data-selected="true"] > .jlist-row > .jlist-brace {
  color: var(--jlist-accent);
}
.jlist-slot { min-width: 0; }

.jlist-titlerow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.jlist-title {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
}
.jlist-title-button {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  cursor: pointer;
}
.jlist-title-button[aria-current="true"] { color: inherit; }
.jlist-caret {
  flex: none;
  padding: 0.25rem;
  margin-top: 0.9rem;
  background: none;
  border: 0;
  color: inherit;
  font-family: var(--jlist-mono);
  font-size: 0.8rem;
  line-height: 1;
  cursor: pointer;
}
.jlist-title-button:focus-visible,
.jlist-caret:focus-visible {
  outline: 2px solid var(--jlist-accent);
  outline-offset: 3px;
}

.jlist-children {
  padding-left: 1rem;
  border-left: 1px solid var(--jlist-line);
  margin-left: 0.25rem;
}
.jlist-children > .jlist-brace {
  display: block;
  line-height: 1.4;
}
.jlist-children .jlist-item:last-child { border-bottom: 0; }

.jlist-split {
  display: grid;
  grid-template-columns: clamp(26.75rem, 31vw, 31rem) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.jlist-detail {
  position: sticky;
  top: 4.375rem;
  min-height: 8rem;
  min-width: 0;
  padding-top: 4.25rem;
  padding-left: 2rem;
  border-left: 1px solid var(--jlist-line);
}

/* 幅の判定用マーカー。視覚を持たず、display だけがブレークポイントの正本 */
.jlist-viewport-probe {
  display: none;
}

.jlist-back {
  display: none;
  padding: 0;
  margin-bottom: 1rem;
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  font-weight: 620;
  cursor: pointer;
}
.jlist-back:focus-visible {
  outline: 2px solid var(--jlist-accent);
  outline-offset: 3px;
}

.jlist-end {
  min-height: var(--jlist-row-height);
  align-items: center;
  font-family: var(--jlist-mono);
  font-size: 1rem;
}
.jlist-end > span {
  grid-column: 2;
}

@media (max-width: 1180px) {
  .jlist { --jlist-gutter: 2.2rem; }
  .jlist-split { grid-template-columns: minmax(0, 1fr); }
  .jlist-detail {
    position: static;
    padding-left: 0;
    padding-top: 1.25rem;
    border-left: 0;
    border-top: 1px solid var(--jlist-line);
  }
}

@media (max-width: 680px) {
  .jlist {
    --jlist-gutter: 1.8rem;
    --jlist-row-height: 4rem;
  }
  .jlist-row {
    grid-template-columns: 1.25rem minmax(0, 1fr) 1.65rem;
    padding-inline: 0.5rem 0.35rem;
  }
  .jlist-viewport-probe { display: block; }

  /* ドリルダウン。JS で幅を判定せず、表示の切り替えはここだけが持つ */
  .jlist-layout-detail .jlist-detail { display: none; }
  .jlist-layout-detail[data-drilled="true"] .jlist-tree { display: none; }
  .jlist-layout-detail[data-drilled="true"] .jlist-detail { display: block; }
  .jlist-layout-detail[data-drilled="true"] .jlist-back { display: block; }
}
`
