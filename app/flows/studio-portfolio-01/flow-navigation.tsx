"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { studioContent, type FlowAction } from "@/lib/studio-portfolio/studio-content"

const FLOW_ROOT = "/flows/studio-portfolio-01"
const actionsByStep: Record<string, readonly FlowAction[]> = studioContent.actionsByStep

function stepFromPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).at(-1)
  return segment && actionsByStep[segment] ? segment : "overview"
}

export function StudioPortfolioNavigation() {
  const pathname = usePathname()
  const step = stepFromPath(pathname)
  const actions = actionsByStep[step]

  return (
    <nav
      aria-label="AI Design System Studio navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto" aria-label="Global navigation">
          {studioContent.globalNavigation.map((item) => {
            const isActive = step === item.target || (item.target === "pattern-library" && step === "pattern-detail")
            return (
              <Link
                key={item.target}
                href={`${FLOW_ROOT}/${item.target}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }), "shrink-0")}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        {actions.length > 0 ? (
          <div className="flex items-center gap-1 overflow-x-auto" aria-label="Available journey actions">
            {actions.map((action) => (
              <Link
                key={`${step}-${action.target}-${action.label}`}
                href={`${FLOW_ROOT}/${action.target}`}
                className={cn(
                  buttonVariants({ variant: action.primary ? "default" : "outline", size: "sm" }),
                  "shrink-0"
                )}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
