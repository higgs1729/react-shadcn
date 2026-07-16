"use client"

import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface WizardStep {
  id: string
  label: string
}

export interface WizardStepperProps {
  steps: WizardStep[]
  currentStepId: string
  completedStepIds: string[]
}

export function WizardStepper({
  steps,
  currentStepId,
  completedStepIds,
}: WizardStepperProps) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = completedStepIds.includes(step.id)
        const isCurrent = step.id === currentStepId
        return (
          <li
            key={step.id}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={isCompleted || isCurrent ? "default" : "outline"}
                className="size-6 shrink-0 rounded-full p-0"
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? <CheckIcon /> : index + 1}
              </Badge>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <Separator className="mx-3 flex-1" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
