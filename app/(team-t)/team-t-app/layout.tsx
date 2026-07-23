import type { Metadata } from "next"

const title = "Team T API Lab — ひらめきの入口を、見つけよう。"
const description =
  "触って見つけるWeb API。気になるジャンルから探索を始めよう。"
const metadataBase = new URL(
  process.env.SITE_ORIGIN ?? "https://higgs1729.github.io"
)

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Team T API Lab",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function TeamTAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
