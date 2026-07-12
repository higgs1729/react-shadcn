"use client"

import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  badge?: string
}

export interface PricingPlanCardProps {
  plans: PricingPlan[]
  selectedPlanId: string
  onSelectPlan: (id: string) => void
}

export function PricingPlanCard({
  plans,
  selectedPlanId,
  onSelectPlan,
}: PricingPlanCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const selected = plan.id === selectedPlanId
        return (
          <Card
            key={plan.id}
            className={selected ? "ring-2 ring-ring" : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{plan.name}</CardTitle>
                {plan.badge && <Badge>{plan.badge}</Badge>}
              </div>
              <p className="text-2xl font-semibold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {plan.period}
                </span>
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-2">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-primary" />
                  {feature}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selected ? "default" : "outline"}
                onClick={() => onSelectPlan(plan.id)}
              >
                {selected ? "Selected" : "Choose plan"}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
