import type { ReactNode } from "react"

import { StudioLayout } from "@/components/studio-portfolio/studio-layout"

export default function StudioRouteLayout({ children }: { children: ReactNode }) {
  return <StudioLayout>{children}</StudioLayout>
}
