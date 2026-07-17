"use client"

import * as React from "react"

import { ErrorRecovery01 } from "@/components/blocks/error-recovery-01"
import { LoadingSkeleton01 } from "@/components/blocks/loading-skeleton-01"
import { getApiPageUrl, type ApiCatalogItem } from "@/lib/team-t-app/catalog"

type PreviewStatus = "loading" | "ready" | "error"

interface ApiPreviewProps {
  item: ApiCatalogItem
  previewRef?: React.Ref<HTMLDivElement>
  onPreviewInteraction: () => void
}

export function ApiPreview({
  item,
  previewRef,
  onPreviewInteraction,
}: ApiPreviewProps) {
  const [status, setStatus] = React.useState<PreviewStatus>("loading")
  const [attempt, setAttempt] = React.useState(0)
  const observedDocumentRef = React.useRef<Document | null>(null)
  const removeClickListenerRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    setStatus("loading")
    setAttempt(0)
  }, [item.id])

  React.useEffect(() => () => removeClickListenerRef.current?.(), [])

  const retry = () => {
    setStatus("loading")
    setAttempt((current) => current + 1)
  }

  const observePreviewInteractions = (
    event: React.SyntheticEvent<HTMLIFrameElement>
  ) => {
    setStatus("ready")

    try {
      const document = event.currentTarget.contentDocument
      if (!document || observedDocumentRef.current === document) return

      removeClickListenerRef.current?.()
      const onClick = () => onPreviewInteraction()
      document.addEventListener("click", onClick)
      observedDocumentRef.current = document
      removeClickListenerRef.current = () =>
        document.removeEventListener("click", onClick)
    } catch {
      // Cross-origin iframes are not eligible for local progress observation.
    }
  }

  return (
    <div
      ref={previewRef}
      tabIndex={-1}
      aria-label={`${item.title} の紹介ページ`}
      className="relative min-h-[36rem] flex-1 bg-card outline-none"
    >
      {status === "loading" && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background p-8">
          <div className="w-full max-w-lg">
            <LoadingSkeleton01 rows={5} />
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background p-8">
          <ErrorRecovery01
            title="紹介ページを読み込めませんでした"
            description="通信状態を確認して再試行するか、別のAPIを選んでください。"
            retryLabel="再試行"
            onRetry={retry}
          />
        </div>
      )}
      <iframe
        key={`${item.id}:${attempt}`}
        title={`${item.title} のAPI紹介ページ`}
        src={getApiPageUrl(item)}
        className="block h-[calc(100svh-3.5rem)] min-h-[36rem] w-full border-0 bg-white"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={observePreviewInteractions}
        onError={() => setStatus("error")}
      />
    </div>
  )
}
