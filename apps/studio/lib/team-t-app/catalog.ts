import catalogData from "./catalog.json"

export interface ApiCatalogItem {
  id: string
  assetPath: string
  title: string
  category: string
  categoryPath: string[]
  description: string
  apiName: string
  officialUrl?: string
  icon: string
  apiCount: number
  /** 静止画で紹介プレビューを差し替えたい item だけが持つ (未指定なら iframe のまま) */
  previewFileName?: string
}

export interface ApiCatalogGroup {
  category: string
  sections: Array<{
    label: string
    items: ApiCatalogItem[]
  }>
}

export const apiCatalog: readonly ApiCatalogItem[] = catalogData

export const catalogStats = {
  pageCount: apiCatalog.length,
  apiCount: apiCatalog.reduce((total, item) => total + item.apiCount, 0),
} as const

export function findCatalogItem(id: string) {
  return apiCatalog.find((item) => item.id === id)
}

export function filterCatalog(
  catalog: readonly ApiCatalogItem[],
  query: string
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja")
  if (!normalizedQuery) return [...catalog]

  return catalog.filter((item) =>
    [
      item.title,
      item.apiName,
      item.description,
      item.category,
      ...item.categoryPath,
    ]
      .join(" ")
      .toLocaleLowerCase("ja")
      .includes(normalizedQuery)
  )
}

export function groupCatalog(
  catalog: readonly ApiCatalogItem[]
): ApiCatalogGroup[] {
  const categories = new Map<string, Map<string, ApiCatalogItem[]>>()

  for (const item of catalog) {
    const sections = categories.get(item.category) ?? new Map()
    const sectionLabel = item.categoryPath[1] ?? "その他"
    const items = sections.get(sectionLabel) ?? []
    items.push(item)
    sections.set(sectionLabel, items)
    categories.set(item.category, sections)
  }

  return [...categories.entries()].map(([category, sections]) => ({
    category,
    sections: [...sections.entries()].map(([label, items]) => ({
      label,
      items,
    })),
  }))
}

export function getApiPageUrl(item: ApiCatalogItem) {
  const safePath = item.assetPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/team-t-app/api-pages/${safePath}`
}

export function getApiPreviewImageUrl(item: ApiCatalogItem) {
  if (!item.previewFileName) return undefined
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/team-t-app/api-page-previews/${encodeURIComponent(item.previewFileName)}`
}
