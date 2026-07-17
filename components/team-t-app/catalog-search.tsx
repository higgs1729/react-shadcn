"use client"

import { SearchIcon, XIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
}

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <div>
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
              onClick={() => onChange("")}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  )
}
