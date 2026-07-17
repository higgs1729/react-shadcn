import { findCatalogItem, type ApiCatalogItem } from "./catalog"

// 原型の おすすめ一覧.txt を catalog ID に正規化した、意図的に小さな編集可能リスト。
// 原型にあって catalog 外だった9ファイルは含めない。IDの実在は validator が保証する。
export const recommendationIds = [
  "3d",
  "dance-proto",
  "joke",
  "ohuzake",
  "yesno",
  "cars",
  "opentrivia",
  "waifu",
  "countrysearch",
  "kabu",
  "time",
  "weather",
  "anime",
  "sindan",
  "poke",
] as const

export function getRecommendedItems(): ApiCatalogItem[] {
  return recommendationIds.flatMap((id) => {
    const item = findCatalogItem(id)
    return item ? [item] : []
  })
}
