import { expect, test } from "playwright/test"

test("serves the landing page at the site root", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole("heading", { name: "常に、学びを止めない", level: 1 })
  ).toBeVisible()
})

test("swaps the panel for each kind of work", async ({ page }) => {
  await page.goto("/")

  const picks = page.locator("#panel-pick")
  const appList = page.locator("#panel-app")
  const siteList = page.locator("#panel-site")

  await expect(picks).toBeVisible()
  await expect(picks.locator(".pick")).toHaveCount(3)
  await expect(appList).toBeHidden()

  await page.getByRole("tab", { name: "アプリ" }).click()
  await expect(appList).toBeVisible()
  await expect(appList.locator(".item")).toHaveCount(4)
  await expect(picks).toBeHidden()

  await page.getByRole("tab", { name: "サイト" }).click()
  await expect(siteList).toBeVisible()
  await expect(siteList.locator(".item")).toHaveCount(5)
})

test("links the bundled sites from the same origin", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("tab", { name: "サイト" }).click()
  const first = page.locator("#panel-site .item__a").first()
  await expect(first).toHaveAttribute(
    "href",
    "/sites/01-asagiri-coffee/index.html"
  )

  await first.click()
  await expect(page).toHaveURL(/\/sites\/01-asagiri-coffee\/index\.html$/)
  await expect(page).toHaveTitle(/朝霧/)
})

test("assembles the mail address once scripts run", async ({ page }) => {
  await page.goto("/")

  const mail = page.locator(".links a[href^='mailto:']")
  await expect(mail).toHaveCount(1)
  await expect(mail).toHaveAttribute("href", "mailto:tomoharu1008@outlook.com")
})

// 動きを減らす設定でも、図は消さずに完成形を見せる（08 の axis.js と同じ約束）。
test("settles the figure when motion is reduced", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" })
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "常に、学びを止めない", level: 1 })
  ).toBeVisible()

  const curve = page.locator("#curve")
  await expect(curve).toHaveJSProperty("style.strokeDashoffset", "0")
  // 点は5本目の短冊の真ん中で止まる。左端(110)から動いていることを見る
  const dotX = await page.locator("#dot").getAttribute("cx")
  expect(Number(dotX)).toBeGreaterThan(400)

  await page.close()
})
