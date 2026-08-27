/* eslint-disable @next/next/no-img-element -- 静的 export。素材の寸法は決め打ちで持っている */
"use client"

import { useState } from "react"

import { apps, imagePath, picks, sites, type Entry } from "../lib/works"
import { PickStack } from "./pick-stack"

// ピックアップだけ組み方が別物なので、項目を隠すのではなくパネルごと入れ替える。
// 動きではなく機能なので、動きの設定に関係なく必ず働かせる。
//
// 3つのパネルを丸ごとここが持つのは、hidden を付ける側と付けられる側を
// 同じ client component に置くため。server 側で組んだ要素は、client からは
// 描画済みの結果として届くので、あとから属性を足せない。
const LABEL = { pick: "ピックアップ", app: "アプリ", site: "サイト" } as const

type Kind = keyof typeof LABEL

const COUNT: Record<Kind, number> = {
  pick: picks.length,
  app: apps.length,
  site: sites.length,
}

function ItemList({
  id,
  labelledBy,
  entries,
  hidden,
}: {
  id: string
  labelledBy: string
  entries: Entry[]
  hidden: boolean
}) {
  return (
    <ol
      className="list"
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={hidden}
    >
      {entries.map((entry) => (
        <li className="item" key={entry.id}>
          <a className="item__a" href={entry.href}>
            <span className="item__media">
              <img
                src={imagePath(entry.image)}
                width="1000"
                height="625"
                loading="lazy"
                alt={entry.alt}
              />
            </span>
            <span className="item__body">
              <span className="item__tag">{entry.tag}</span>
              <span className="item__t">{entry.title}</span>
              <span className="item__d">{entry.description}</span>
              <span className="item__go">開く</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
}

export function WorksTabs() {
  const [kind, setKind] = useState<Kind>("pick")
  const [announce, setAnnounce] = useState(false)
  const kinds = Object.keys(LABEL) as Kind[]

  return (
    <>
      <div className="tabs" role="tablist" aria-label="制作物の種類">
        {kinds.map((value) => (
          <button
            key={value}
            className={value === kind ? "tab is-on" : "tab"}
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={value === kind}
            aria-controls={`panel-${value}`}
            onClick={() => {
              setKind(value)
              setAnnounce(true)
            }}
          >
            {LABEL[value]}
          </button>
        ))}
      </div>
      {/* 読み上げは切り替えたときだけ。読み込み直後は黙っている */}
      <p className="visually-hidden" role="status" id="tab-status">
        {announce ? `${LABEL[kind]}を表示しています。${COUNT[kind]}件。` : ""}
      </p>

      {/* 厳選3つ。左右を交互に入れ替える。画像は同じ作品の別カットを3枚重ねる */}
      <div
        className="picks"
        id="panel-pick"
        role="tabpanel"
        aria-labelledby="tab-pick"
        hidden={kind !== "pick"}
      >
        {picks.map((pick, index) => (
          <article
            className={index % 2 === 1 ? "pick pick--flip" : "pick"}
            key={pick.id}
          >
            <PickStack name={pick.name} shots={pick.shots} />
            <div className="pick__body">
              <h3 className="pick__t">
                <span className="pick__name">{pick.name}</span>
                <span className="pick__claim">{pick.claim}</span>
              </h3>
              <p className="pick__d">{pick.description}</p>
              <a className="pick__go" href={pick.href}>
                開く
              </a>
            </div>
          </article>
        ))}
      </div>

      <ItemList
        id="panel-app"
        labelledBy="tab-app"
        entries={apps}
        hidden={kind !== "app"}
      />
      <ItemList
        id="panel-site"
        labelledBy="tab-site"
        entries={sites}
        hidden={kind !== "site"}
      />
    </>
  )
}
