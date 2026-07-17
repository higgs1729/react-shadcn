import {
  ClapperboardIcon,
  DatabaseIcon,
  EllipsisIcon,
  FileCode2Icon,
  ImageIcon,
  type LucideIcon,
  WrenchIcon,
} from "lucide-react"

const categoryIcons: Record<string, LucideIcon> = {
  "画像・ビジュアル系": ImageIcon,
  "データ・検索系": DatabaseIcon,
  "為替・ツール系": WrenchIcon,
  "エンタメ・おもしろ系": ClapperboardIcon,
  その他: EllipsisIcon,
}

interface CategoryIconProps {
  category: string
  className?: string
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category] ?? EllipsisIcon
  return <Icon aria-hidden="true" className={className} />
}

export function ApiPageIcon({ className }: { className?: string }) {
  return <FileCode2Icon aria-hidden="true" className={className} />
}
