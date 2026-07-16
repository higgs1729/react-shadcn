"use client"

import * as React from "react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export interface TabsViewSwitcherView {
  value: string
  label: string
  content: React.ReactNode
}

export interface TabsViewSwitcher01Props {
  value: string
  onValueChange: (value: string) => void
  views: TabsViewSwitcherView[]
}

export function TabsViewSwitcher01({
  value,
  onValueChange,
  views,
}: TabsViewSwitcher01Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onValueChange(next)
      }}
    >
      <TabsList>
        {views.map((view) => (
          <TabsTrigger key={view.value} value={view.value}>
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsContent key={view.value} value={view.value}>
          {view.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
