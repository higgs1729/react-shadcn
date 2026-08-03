import { expect, test } from "playwright/test"

test("starts a quiz and persists the first answer", async ({ page }) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))
  await page.goto("/python-test/")
  await page.waitForTimeout(500)
  expect(pageErrors).toEqual([])

  await expect(
    page.getByRole("heading", { name: "データ分析試験 模擬問題集" })
  ).toBeVisible()
  await page.getByRole("button", { name: "試験を開始" }).click()
  await expect(page.getByText("第 1 問 / 全 40 問")).toBeVisible()

  await page.getByRole("button", { name: /^A\./ }).click()
  await expect(page.getByText(/正解は [A-D]。/)).toBeVisible()

  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("python_data_exam_progress_v2"))
    )
    .not.toBeNull()
})

test("imports a legacy progress.json", async ({ page }) => {
  await page.goto("/python-test/")

  await page.locator('input[type="file"]').setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        stats: { 1: { seen: 3, correct: 2 } },
        flags: { 1: "red" },
      })
    ),
  })

  await expect(
    page.getByRole("heading", { name: "学習データを読み込みました" })
  ).toBeVisible()

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("python_data_exam_progress_v2") ?? "{}")
  )
  expect(stored).toEqual({
    stats: { 1: { seen: 3, correct: 2 } },
    flags: { 1: ["red"] },
  })
})
