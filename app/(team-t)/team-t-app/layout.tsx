import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team T API Lab",
  description: "177ページ・200 APIを触って探索できるWeb APIカタログ",
}

export default function TeamTAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
