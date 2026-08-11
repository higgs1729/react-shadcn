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
      <p>作品紹介へ移動しています…</p>
      <a href={worksPath}>作品紹介を開く</a>
    </main>
  )
}
