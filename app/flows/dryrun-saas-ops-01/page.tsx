import Link from "next/link"

export default function FlowIndexPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-medium">dryrun-saas-ops-01</h1>
      <nav className="flex flex-col gap-2">
        <Link href="/flows/dryrun-saas-ops-01/login" className="underline underline-offset-4">
          1. login
        </Link>
        <Link href="/flows/dryrun-saas-ops-01/overview" className="underline underline-offset-4">
          2. overview
        </Link>
      </nav>
    </div>
  )
}
