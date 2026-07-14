import { readFileSync } from "node:fs"
import { join } from "node:path"

import { CaseStudyPage } from "@/components/studio-portfolio/studio-pages"

export default function Page() {
  const markdown = readFileSync(
    join(process.cwd(), "docs/case-study/case-study.md"),
    "utf-8"
  )
  return <CaseStudyPage markdown={markdown} />
}
