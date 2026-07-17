import { ExternalLinkIcon, Layers3Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ApiCatalogItem } from "@/lib/team-t-app/catalog"

interface ApiSummaryProps {
  item: ApiCatalogItem
  headingRef?: React.Ref<HTMLDivElement>
}

export function ApiSummary({ item, headingRef }: ApiSummaryProps) {
  return (
    <Card
      size="sm"
      className="shrink-0 rounded-none border-x-0 border-t-0 shadow-none ring-0"
    >
      <CardHeader>
        <div ref={headingRef} tabIndex={-1} className="outline-none">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            {item.apiCount > 1 && (
              <Badge variant="outline">
                <Layers3Icon data-icon="inline-start" />
                {item.apiCount} APIs
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <CardDescription className="mt-1 max-w-3xl leading-6">
            {item.description}
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">
            使用API: {item.apiName}
          </p>
        </div>
        {item.officialUrl && (
          <CardAction>
            <Button
              render={
                <a
                  href={item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              size="sm"
            >
              公式情報
              <ExternalLinkIcon data-icon="inline-end" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  )
}
