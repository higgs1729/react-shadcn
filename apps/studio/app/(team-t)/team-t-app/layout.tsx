import type { Metadata } from "next"

const title = "Team T API Lab — ひらめきの入口を、見つけよう。"
const description =
  "触って見つけるWeb API。気になるジャンルから探索を始めよう。"
const metadataBase = new URL(
  process.env.SITE_ORIGIN ?? "https://higgs1729.github.io"
)
const socialImageUrl = new URL(
  `${process.env.PAGES_BASE_PATH ?? ""}/team-t-app/assets/team-t-link-preview.png`,
  metadataBase
)
const socialImageAlt = "Team T API Lab。ひらめきの入口を、見つけよう。"

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Team T API Lab",
    title,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
      },
    ],
  },
}

export default function TeamTAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
