"use client"

import { useEffect } from "react"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const worksPath = `${basePath}/works/`

export default function Page() {
  useEffect(() => {
    window.location.replace(worksPath)
  }, [])

  return (
    <main>
      <p>workへ移動しています…</p>
      <a href={worksPath}>workを開く</a>
    </main>
  )
}
