import { MemberGateForm } from "@/components/studio-portfolio/member-gate-form"

export default function MemberGatePreviewPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <MemberGateForm />
      </div>
    </div>
  )
}
