import { Badge } from "@/components/ui/badge"
import { MemberGateForm } from "@/components/studio-portfolio/member-gate-form"

export function OpsPulseExamplePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Ops Pulse</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          現在のSaaS運用状態、最近の変化、確認が必要な記録を一つの画面で把握する静的な運用ダッシュボードです。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">dashboard</Badge>
          <Badge variant="outline">dashboard-01</Badge>
          <Badge variant="outline">Static fixture</Badge>
        </div>
      </div>

      <section aria-labelledby="ops-pulse-preview-title" className="min-w-0">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
            <h2 id="ops-pulse-preview-title" className="font-medium">
              Interactive preview
            </h2>
            <span className="text-xs text-muted-foreground">16:9</span>
          </div>
          <div className="aspect-video bg-muted/30">
            <iframe
              title="Ops Pulse application preview"
              src="../../example-previews/ops-pulse/"
              className="size-full border-0 bg-background"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export function InvoiceDeskExamplePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Invoice Desk</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Search and filter a single invoice fixture, inspect any invoice, and
          record a local payment that updates the invoice, customer, and
          collection views together.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">collection</Badge>
          <Badge variant="outline">collection-table-01</Badge>
          <Badge variant="outline">Static fixture</Badge>
        </div>
      </div>

      <section aria-labelledby="invoice-desk-preview-title" className="min-w-0">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
            <h2 id="invoice-desk-preview-title" className="font-medium">
              Interactive preview
            </h2>
            <span className="text-xs text-muted-foreground">16:9</span>
          </div>
          <div className="aspect-video bg-muted/30">
            <iframe
              title="Invoice Desk application preview"
              src="../../example-previews/invoice-desk/"
              className="size-full border-0 bg-background"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export function MemberGateExamplePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Member Gate</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          メンバーがメールとパスワード、または対応する外部アカウントでワークスペースに入る認証画面です。入力はすべてローカルで検証され、実際の認証プロバイダーやセッションには接続していません。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">auth</Badge>
          <Badge variant="outline">login-03</Badge>
          <Badge variant="outline">Local form state</Badge>
        </div>
      </div>

      <section
        aria-labelledby="member-gate-form-title"
        className="min-w-0"
      >
        <h2 id="member-gate-form-title" className="sr-only">
          Member Gate sign-in form
        </h2>
        <div className="flex justify-center rounded-lg border bg-muted/30 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <MemberGateForm />
          </div>
        </div>
      </section>
    </div>
  )
}

export function LaunchBoardExamplePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Launch Board</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          リリースタスクをワークフローの状態別に整理し、カードを列から列へドラッグして計画から完了まで進める静的なプランニングボードです。カードの移動はブラウザセッション内のローカル状態のみで、バックエンドには保存されません。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">planning-board</Badge>
          <Badge variant="outline">planning-board-01</Badge>
          <Badge variant="outline">Local seed state</Badge>
        </div>
      </div>

      <section aria-labelledby="launch-board-preview-title" className="min-w-0">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
            <h2 id="launch-board-preview-title" className="font-medium">
              Interactive preview
            </h2>
            <span className="text-xs text-muted-foreground">16:9</span>
          </div>
          <div className="aspect-video bg-muted/30">
            <iframe
              title="Launch Board application preview"
              src="../../example-previews/launch-board/"
              className="size-full border-0 bg-background"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
