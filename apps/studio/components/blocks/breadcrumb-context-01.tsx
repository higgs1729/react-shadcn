"use client"

import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbContextItem {
  id: string
  label: string
  onSelect: () => void
}

export interface BreadcrumbContext01Props {
  items: BreadcrumbContextItem[]
  currentLabel: string
}

export function BreadcrumbContext01({
  items,
  currentLabel,
}: BreadcrumbContext01Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <BreadcrumbItem>
              <BreadcrumbLink render={<button type="button" onClick={item.onSelect} />}>
                {item.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
