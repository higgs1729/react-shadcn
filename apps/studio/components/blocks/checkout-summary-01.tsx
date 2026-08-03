"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface CheckoutSummaryLineItem {
  id: string
  label: string
  quantity: number
  price: string
}

export interface CheckoutSummaryProps {
  items: CheckoutSummaryLineItem[]
  total: string
  onConfirm: () => void
  confirmLabel?: string
  confirmDisabled?: boolean
}

export function CheckoutSummary({
  items,
  total,
  onConfirm,
  confirmLabel = "Confirm order",
  confirmDisabled = false,
}: CheckoutSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span>
              {item.label}
              <span className="text-muted-foreground"> x{item.quantity}</span>
            </span>
            <span>{item.price}</span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{total}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
