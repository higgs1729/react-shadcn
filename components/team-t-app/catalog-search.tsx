"use client"

import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  guideOpen?: boolean
  onGuideDismiss?: () => void
}

export function CatalogSearch({
  value,
  onChange,
  guideOpen = false,
  onGuideDismiss,
}: CatalogSearchProps) {
  const clearFilter = () => {
    onChange("")
    onGuideDismiss?.()
  }

  return (
    <div className="relative">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="APIカタログを検索"
          placeholder="API名・用途で検索"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="検索をクリア"
              size="icon-xs"
              onClick={clearFilter}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {guideOpen ? (
        <div
          aria-live="polite"
          aria-label="ジャンル絞り込みのガイド"
          className="absolute top-[calc(100%+0.625rem)] right-0 left-0 z-50 rounded-xl border border-primary/35 bg-popover p-3 text-popover-foreground shadow-xl shadow-black/15"
        >
          <span
            aria-hidden="true"
            className="absolute -top-1.5 right-8 size-3 rotate-45 border-t border-l border-primary/35 bg-popover"
          />
          <p className="text-xs font-semibold text-primary">はじめての方へ</p>
          <p className="mt-1 text-sm font-medium">ジャンルで絞り込みました</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            検索欄の×を押すと、すべてのジャンルに戻せます。
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={clearFilter}>
              絞り込みを解除
            </Button>
            <Button type="button" size="sm" onClick={onGuideDismiss}>
              わかった
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
