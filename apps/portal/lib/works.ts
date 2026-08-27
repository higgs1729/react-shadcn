// 一覧の正本。08（portfolio/webSites/sites/08-portal-axis/index.html）に直書き
// されていた内容をここへ移した。文言・並び・説明文は 08 のまま。
//
// 08 は他サイトへ相対パス、アプリへは絶対 URL で飛んでいた。ここでは両方とも
// basePath から組む。dev（basePath 空）と本番（/react-shadcn）の両方で解決させ、
// かつアプリの URL を変えたときに直す場所を1つにするため。
import { ASSET_BASE_URL } from "./asset-base"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// GAMEHUB は静的 export を Pages ツリーへ合成している。dev だけは専用の dev
// サーバー（3001）を指す。NEXT_PUBLIC_GAMEHUB_URL は別配信を明示したいときだけ。
const gamehubHref =
  process.env.NEXT_PUBLIC_GAMEHUB_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001/gamehub/"
    : `${basePath}/gamehub/`)

/**
 * 画像は 08 の素材をそのまま R2 で配信する。staging は
 * apps/portal/public/portal-previews/ で、`npm run upload:assets` を通すと
 * ローカル副本は消える（bucket が正本）。
 */
export function imagePath(fileName: string) {
  return `${ASSET_BASE_URL}/portal-previews/${fileName}`
}

export type Shot = {
  src: string
  /** 押して前面に来たときの説明。08 の data-cap。 */
  caption: string
}

export type Pick = {
  id: string
  name: string
  claim: string
  description: string
  href: string
  /** 手前から奥の順。3枚とも同じ作品の別カット。 */
  shots: Shot[]
}

export type Entry = {
  id: string
  tag: "App" | "Site"
  title: string
  description: string
  href: string
  image: string
  alt: string
}

export const picks: Pick[] = [
  {
    id: "gamehub",
    name: "GAMEHUB",
    claim: "すべてのゲームを、ひとまとめに",
    description:
      "今まで制作してきたゲームを一つのアプリから遊べることを目標としました。注目タイトルからでも一覧からでもゲームを選べます。",
    href: gamehubHref,
    shots: [
      {
        src: "p-gamehub-1.webp",
        caption:
          "GAMEHUB のトップ。注目タイトル PULSE//TRACE が大きく置かれている",
      },
      {
        src: "p-gamehub-2.webp",
        caption:
          "GAMEHUB の一覧。3本のゲームがカードで並び、上に検索欄がある",
      },
      {
        src: "p-gamehub-3.webp",
        caption: "PULSE//TRACE の実際の画面。4レーンにノーツが落ちてくる",
      },
    ],
  },
  {
    id: "studio",
    name: "AI Design System Studio",
    claim: "AIが画面を選ぶ過程を可視化する",
    description:
      "結果だけを出すと、なぜその画面なのかを誰も確かめられません。要求から候補、採用した理由までを画面の上に残しました。",
    href: `${basePath}/studio/overview/`,
    shots: [
      {
        src: "p-studio-1.webp",
        caption:
          "AI Design System Studio の概要。要求から実装までの流れが4段で並んでいる",
      },
      {
        src: "p-studio-2.webp",
        caption: "AI Design System Studio の検証結果の画面",
      },
      {
        src: "p-studio-3.webp",
        caption:
          "AI Design System Studio のパターン在庫。画面の型がカードで並んでいる",
      },
    ],
  },
  {
    id: "asagiri",
    name: "喫茶と焙煎 朝霧",
    claim: "情報より先に、朝の静けさを",
    description:
      "朝の静かな時間に詰め込みすぎは似合いません。縦組みと余白を主役にして、写真は増やさず、焙煎の一枚に寄せました。",
    href: `${basePath}/sites/01-asagiri-coffee/index.html`,
    shots: [
      {
        src: "p-asagiri-1.webp",
        caption:
          "喫茶と焙煎 朝霧のトップページ。焙煎した豆の写真に縦組みの見出しが重なっている",
      },
      {
        src: "p-asagiri-2.webp",
        caption: "朝霧の紹介文。縦組みの見出しと、ハンドドリップの写真",
      },
      { src: "p-asagiri-3.webp", caption: "朝霧の焙煎豆の節。豆の写真が並んでいる" },
    ],
  },
]

export const apps: Entry[] = [
  {
    id: "team-t",
    tag: "App",
    title: "Team T API Lab",
    description:
      "目的やカテゴリから公開APIを探して、その場で仕様とレスポンスを確かめられます。",
    href: `${basePath}/team-t/`,
    image: "a-team-t.webp",
    alt: "Team T API Lab の画面。公開APIのカタログが並んでいる",
  },
  {
    id: "studio",
    tag: "App",
    title: "AI Design System Studio",
    description:
      "要求から実際にAIが画面を選ぶ過程を、そのまま見えるようにしたものです。",
    href: `${basePath}/studio/overview/`,
    image: "a-studio.webp",
    alt: "AI Design System Studio の画面。UI設計の過程が並んでいる",
  },
  {
    id: "python-test",
    tag: "App",
    title: "データ分析試験 模擬問題集",
    description:
      "Python3エンジニア認定データ分析試験の練習用。誤答だけを繰り返せます。",
    href: `${basePath}/python-test/`,
    image: "a-python-test.webp",
    alt: "データ分析試験 模擬問題集の画面。問題と選択肢が並んでいる",
  },
  {
    id: "gamehub",
    tag: "App",
    title: "GAMEHUB",
    description:
      "ブラウザですぐ遊べるゲームを集めたところ。注目タイトルと一覧から選べます。",
    href: gamehubHref,
    image: "a-gamehub.webp",
    alt: "GAMEHUB の画面。ブラウザゲームのカタログが並んでいる",
  },
]

// public/sites/ へ同梱した架空サイト。中身は webSites 側が正本で、ここは配信物。
// index.html まで書くのは 08 と同じ。public/ の中はルーティングの対象外で、
// next dev はディレクトリに index.html を返さない（GitHub Pages は返す）。
export const sites: Entry[] = [
  {
    id: "asagiri",
    tag: "Site",
    title: "喫茶と焙煎 朝霧",
    description:
      "自家焙煎珈琲店。余白と縦組みで、朝の静けさのほうを主役にしました。",
    href: `${basePath}/sites/01-asagiri-coffee/index.html`,
    image: "w-asagiri.webp",
    alt: "喫茶と焙煎 朝霧のトップページ。焙煎した豆の写真に縦組みの見出しが重なっている",
  },
  {
    id: "aoyagi",
    tag: "Site",
    title: "税理士法人 あおやぎ会計",
    description:
      "士業。料金表を全部出す方針にしたので、情報量に耐える骨格を選びました。",
    href: `${basePath}/sites/02-aoyagi-tax/index.html`,
    image: "w-aoyagi.webp",
    alt: "税理士法人 あおやぎ会計のトップページ。左に固定サイドバー、右に濃紺のヒーロー",
  },
  {
    id: "nagi",
    tag: "Site",
    title: "nagi",
    description: "美容室。一日八名の店なので、要素を減らして時間の遅さを出しました。",
    href: `${basePath}/sites/03-nagi-salon/index.html`,
    image: "w-nagi.webp",
    alt: "美容室 nagi のトップページ。大きなロゴタイプと円弧、右に枝の写真",
  },
  {
    id: "tsunagime",
    tag: "Site",
    title: "ツナギメ",
    description: "在庫同期SaaS。3ページあるので、共通部分はビルドで合成しています。",
    href: `${basePath}/sites/04-tsunagime/index.html`,
    image: "w-tsunagime.webp",
    alt: "在庫同期SaaS ツナギメのトップページ。暗い地に大きな見出しと数値カード",
  },
  {
    id: "meguri",
    tag: "Site",
    title: "Meguri",
    description: "定期便管理SaaS。製品画面をCSSだけで組み、画像を使っていません。",
    href: `${basePath}/sites/05-meguri-saas/index.html`,
    image: "w-meguri.webp",
    alt: "定期便管理SaaS Meguri のトップページ。暗い地に青の差し色",
  },
]

/** 暗転の節から開く一本。08 は朝霧を指していた。 */
export const closingHref = sites[0].href
