"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export interface SummaryMetric {
  label: string
  value: string
  summary: string
  detail: string
  trend?: string
  direction?: "up" | "down"
}

const defaultMetrics: SummaryMetric[] = [
  {
    label: "Total Revenue",
    value: "$1,250.00",
    trend: "+12.5%",
    direction: "up",
    summary: "Trending up this month",
    detail: "Visitors for the last 6 months",
  },
  {
    label: "New Customers",
    value: "1,234",
    trend: "-20%",
    direction: "down",
    summary: "Down 20% this period",
    detail: "Acquisition needs attention",
  },
  {
    label: "Active Accounts",
    value: "45,678",
    trend: "+12.5%",
    direction: "up",
    summary: "Strong user retention",
    detail: "Engagement exceed targets",
  },
  {
    label: "Growth Rate",
    value: "4.5%",
    trend: "+4.5%",
    direction: "up",
    summary: "Steady performance increase",
    detail: "Meets growth projections",
  },
]

export function SectionCards({
  items = defaultMetrics,
  variant = "metrics",
}: {
  items?: SummaryMetric[]
  variant?: "metrics" | "compact"
}) {
  if (variant === "compact") {
    return (
      <div className="grid divide-y rounded-lg border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {items.map((item) => {
        const TrendIcon =
          item.direction === "down" ? TrendingDownIcon : TrendingUpIcon
        return (
          <Card key={item.label} className="@container/card">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {item.value}
              </CardTitle>
              {item.trend && (
                <CardAction>
                  <Badge variant="outline">
                    <TrendIcon />
                    {item.trend}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {item.summary}
                {item.direction && <TrendIcon className="size-4" />}
              </div>
              <div className="text-muted-foreground">{item.detail}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
