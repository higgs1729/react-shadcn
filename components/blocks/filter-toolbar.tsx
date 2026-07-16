"use client"

import { SearchIcon, LayoutGridIcon, TableIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface FilterToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  statusOptions: { value: string; label: string }[]
  view: "table" | "grid"
  onViewChange: (view: "table" | "grid") => void
}

export function FilterToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  view,
  onViewChange,
}: FilterToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <InputGroup className="max-w-sm">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      <Select
        value={status}
        onValueChange={(value) => {
          if (value !== null) onStatusChange(value)
        }}
        items={statusOptions}
      >
        <SelectTrigger aria-label="Filter by status" className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <ToggleGroup
        multiple={false}
        value={[view]}
        onValueChange={(value) => {
          const next = value[0]
          if (next === "table" || next === "grid") {
            onViewChange(next)
          }
        }}
        variant="outline"
      >
        <ToggleGroupItem value="table" aria-label="Table view">
          <TableIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGridIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
