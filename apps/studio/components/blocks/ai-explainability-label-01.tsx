"use client"

import { SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface AiExplainabilityLabelProps {
  label?: string
  confidence: "low" | "medium" | "high"
  explanation: string
}

const confidenceVariant = {
  low: "outline",
  medium: "secondary",
  high: "default",
} as const

export function AiExplainabilityLabel({
  label = "AI-generated",
  confidence,
  explanation,
}: AiExplainabilityLabelProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge
              variant={confidenceVariant[confidence]}
              className="cursor-default gap-1"
            >
              <SparklesIcon />
              {label}
            </Badge>
          }
        />
        <TooltipContent>
          {explanation} (confidence: {confidence})
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
