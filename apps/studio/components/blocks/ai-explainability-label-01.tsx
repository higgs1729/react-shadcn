"use client"

import { SparklesIcon } from "lucide-react"

import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@react-shadcn/shadcn-kit/ui/tooltip"

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
