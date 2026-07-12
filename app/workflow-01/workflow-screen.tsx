"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ActionFooter } from "@/components/action-footer-01"
import { CheckoutSummary, type CheckoutSummaryLineItem } from "@/components/checkout-summary-01"
import { PricingPlanCard, type PricingPlan } from "@/components/pricing-plan-card-01"
import { WizardStepper, type WizardStep } from "@/components/wizard-stepper-01"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import workflowData from "./data.json"

export type WorkflowState = "default" | "loading" | "empty" | "error"

const STEPS = workflowData.steps as WizardStep[]
const CURRENT_STEP_ID = workflowData.currentStepId as string
const COMPLETED_STEP_IDS = workflowData.completedStepIds as string[]
const PLANS = workflowData.plans as PricingPlan[]
const LINE_ITEMS = workflowData.lineItems as CheckoutSummaryLineItem[]
const TOTAL = workflowData.total as string

export function WorkflowScreen({
  state = "default",
}: {
  state?: WorkflowState
}) {
  const [selectedPlanId, setSelectedPlanId] = React.useState(
    workflowData.selectedPlanId as string
  )
  const [company, setCompany] = React.useState("Northwind Trading Co.")
  const [poNumber, setPoNumber] = React.useState("")
  const [confirmed, setConfirmed] = React.useState(false)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-xl font-semibold">Upgrade your plan</h1>
        <p className="text-sm text-muted-foreground">
          Review your selection and confirm the change.
        </p>
      </div>

      <WizardStepper
        steps={STEPS}
        currentStepId={CURRENT_STEP_ID}
        completedStepIds={COMPLETED_STEP_IDS}
      />

      {state === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t start checkout</AlertTitle>
          <AlertDescription>
            We couldn&apos;t reach the billing service. Please try again.
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm">
              <RotateCcwIcon />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {state === "loading" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {state === "empty" && (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Your cart is empty. Choose a plan to continue.
        </div>
      )}

      {state === "default" && (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <PricingPlanCard
                plans={PLANS}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Billing details</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="billing-company">Company</FieldLabel>
                      <Input
                        id="billing-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="billing-po">PO number (optional)</FieldLabel>
                      <Input
                        id="billing-po"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>
            <CheckoutSummary
              items={LINE_ITEMS}
              total={TOTAL}
              onConfirm={() => setConfirmed(true)}
              confirmLabel={confirmed ? "Confirmed" : "Confirm upgrade"}
              confirmDisabled={confirmed}
            />
          </div>

          <ActionFooter
            primaryLabel="Continue to review"
            secondaryLabel="Back"
            onPrimaryAction={() => {}}
            onSecondaryAction={() => {}}
          />
        </>
      )}
    </div>
  )
}
