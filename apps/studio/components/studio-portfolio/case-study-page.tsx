"use client"

// Route: /case-study. Receives the markdown from the server component that
// reads docs/case-study/case-study.md.

import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@react-shadcn/shadcn-kit/lib/utils"
import { PageFrame } from "./studio-page-shell"

function splitCaseStudySections(markdown: string) {
  const lines = markdown.split("\n")
  const sections: { heading: string; body: string }[] = []
  let current: { heading: string; body: string[] } | null = null
  for (const line of lines) {
    const match = /^# (.+)$/.exec(line)
    if (match) {
      if (current) {
        sections.push({ heading: current.heading, body: current.body.join("\n") })
      }
      current = { heading: match[1], body: [line] }
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) {
    sections.push({ heading: current.heading, body: current.body.join("\n") })
  }
  return sections
}

const caseStudySectionBaseClass = cn(
  "[&_h1]:flex [&_h1]:items-baseline [&_h1]:gap-3 [&_h1]:border-b [&_h1]:pb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h1]:[counter-increment:cs-section]",
  "[&_h1]:before:content-[counter(cs-section,decimal-leading-zero)]",
  "[&_h1]:before:flex [&_h1]:before:size-7 [&_h1]:before:items-center [&_h1]:before:justify-center",
  "[&_h1]:before:rounded-full [&_h1]:before:border [&_h1]:before:border-primary/40",
  "[&_h1]:before:font-mono [&_h1]:before:text-xs [&_h1]:before:font-normal [&_h1]:before:text-foreground",
  "[&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold",
  "[&_code]:rounded [&_code]:border [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_li]:relative [&_li]:pl-5",
  "[&_li]:before:absolute [&_li]:before:top-[0.8em] [&_li]:before:left-0 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-muted-foreground/50 [&_li]:before:content-['']",
  "[&_ol]:space-y-2 [&_ul]:space-y-2",
  "[&_ul]:rounded-lg [&_ul]:border [&_ul]:bg-muted/20 dark:[&_ul]:bg-card [&_ul]:p-4 [&_ul]:pl-5",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/40 dark:[&_pre]:bg-card [&_pre]:p-4"
)

export function CaseStudyPage({ markdown }: { markdown: string }) {
  const sections = useMemo(() => splitCaseStudySections(markdown), [markdown])

  return (
    <PageFrame
      title="Case Study"
      description="今回の開発の過程や学んだことのまとめ。"
      centered
    >
      <div className="space-y-5 text-[0.9375rem] leading-8 text-foreground [counter-reset:cs-section]">
        {sections.map((section, index) => (
          <div
            key={section.heading}
            className={cn(
              index === 0 ? "[&_h1]:mt-0" : "[&_h1]:mt-14",
              caseStudySectionBaseClass
            )}
          >
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </div>
        ))}
      </div>
    </PageFrame>
  )
}
