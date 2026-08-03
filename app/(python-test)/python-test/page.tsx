import type { Metadata } from "next"

import { PythonTestApp } from "@/components/python-test/python-test-app"

export const metadata: Metadata = {
  title: "データ分析試験 模擬問題集",
  description: "Python3エンジニア認定データ分析試験の学習用模擬問題集",
}

export default function PythonTestPage() {
  return <PythonTestApp />
}
