"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// The studio's real entry point is /overview. This root route exists so the
// app's own basePath (/react-shadcn/studio) resolves instead of falling through
// to 404 for anyone who trims the URL or lands here from outside. A static
// export cannot answer with a 3xx, so the redirect happens client-side and the
// markup below is the no-JS fallback.
export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/overview")
  }, [router])

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-muted-foreground text-sm">
        <Link href="/overview" className="underline underline-offset-4">
          Overview へ移動
        </Link>
      </p>
    </main>
  )
}
