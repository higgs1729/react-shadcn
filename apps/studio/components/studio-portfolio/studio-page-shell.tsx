"use client"

// Shared chrome for the studioApp pages. Only helpers used by MORE THAN ONE
// page live here; a helper with a single caller stays in that page's module so
// the split does not just recreate a smaller barrel.

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import { Separator } from "@react-shadcn/shadcn-kit/ui/separator"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import { cn } from "@react-shadcn/shadcn-kit/lib/utils"

export function PageFrame({
  title,
  description,
  context,
  children,
  titleClassName,
  centered,
}: {
  title: string
  description: string
  context?: ReactNode
  children: ReactNode
  titleClassName?: string
  centered?: boolean
}) {
  const titleBlock = (
    <div className={cn("max-w-3xl", titleClassName)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {context ? <div className="mt-3">{context}</div> : null}
    </div>
  )

  if (centered) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {titleBlock}
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {titleBlock}
      {children}
    </div>
  )
}

export function useStudioBasePath() {
  const [basePath, setBasePath] = useState<string | null>(null)
  useEffect(() => {
    setBasePath(window.location.pathname.replace(/\/overview\/?$/, ""))
  }, [])
  return basePath
}

export function SectionHeader({
  id,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  id: string
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-3">
      <div>
        <h2 id={id} className="text-base font-medium">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={actionHref} data-open-window />}
        >
          {actionLabel} <ArrowRightIcon />
        </Button>
      ) : null}
    </div>
  )
}

// カードは w-72 (288px)。iframe をデスクトップ幅でレンダリングして全体像を見せ、
// カード幅に合わせて縮小する。値が小さいほど拡大表示(縦に短いアプリ向け)。

export function QualityFieldsCard({
  title,
  status,
  fields,
}: {
  title: string
  status: string
  fields: { id: string; label: string; value: string }[]
}) {
  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Badge variant="secondary">{status}</Badge>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-5">
        {fields.map((field) => (
          <div key={field.id} className="flex items-baseline gap-4 text-base">
            <span className="w-36 shrink-0 text-muted-foreground">
              {field.label}
            </span>
            <span className="min-w-0 break-all">{field.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
