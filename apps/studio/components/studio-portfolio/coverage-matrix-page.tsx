"use client"

// Route: /quality/coverage

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"
import { BreadcrumbContext01 } from "@/components/blocks/breadcrumb-context-01"
import { SectionCards } from "@/components/blocks/section-cards"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@react-shadcn/shadcn-kit/ui/table"
import data from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { PageFrame } from "./studio-page-shell"

export function CoverageMatrixPage() {
  const router = useRouter()
  const allPatterns = [
    ...data.inventory.screenPatterns,
    ...data.inventory.blockPatterns,
  ]
  return (
    <PageFrame
      title="Coverage matrix"
      description="ScreenTypeとblockRoleの在庫・maturity・状態を、registryのbuild-time dataから確認します。"
      context={
        <BreadcrumbContext01
          items={[
            {
              id: "quality",
              label: "Quality",
              onSelect: () => router.push("/quality"),
            },
          ]}
          currentLabel="Coverage matrix"
        />
      }
    >
      <SectionCards
        items={[
          {
            label: "ScreenTypes",
            value: String(data.inventory.screenTypes),
            summary: "canonical vocabulary",
            detail: "Coverage 13/13",
          },
          {
            label: "blockRoles",
            value: String(data.inventory.blockRoles),
            summary: "canonical vocabulary",
            detail: "Coverage 33/33",
          },
          {
            label: "Patterns",
            value: String(allPatterns.length),
            summary: "registry items",
            detail: "Screen and block patterns",
          },
          {
            label: "Verified flows",
            value: String(
              data.flows.filter((flow) => flow.status === "verified").length
            ),
            summary: "example evidence",
            detail: "BuildReport",
          },
        ]}
        variant="compact"
      />
      <Card>
        <CardHeader>
          <CardTitle>在庫の網羅性を、採用前に確かめる</CardTitle>
          <CardDescription>
            Patternごとの役割・maturity・状態を一覧で照合します。数字は確認対象の規模、下の表が実際の判断材料です。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" nativeButton={false} render={<Link href="/patterns" />}>
            Patternsを開く <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead>States</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPatterns.map((pattern) => (
                <TableRow key={pattern.name}>
                  <TableCell>{pattern.name}</TableCell>
                  <TableCell>
                    {pattern.screenType ?? pattern.blockRole ?? "—"}
                  </TableCell>
                  <TableCell>{pattern.maturity}</TableCell>
                  <TableCell>
                    {pattern.stateCoverage.join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
