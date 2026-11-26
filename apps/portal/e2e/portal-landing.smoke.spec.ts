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
  await expect(picks.locator(".pick")).toHaveCount(5)
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

// Reduce Motion の設定に関係なく、演出を見せる（Google Antigravity と同じ方針）。
// ヒーローは世界の背景（本人 2026-11-26。積分の図は一旦外した）。止め絵が先に出て、映像は縦横で版を選ぶ
test("shows the hero world when motion is reduced", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" })
  await page.goto("/")

  await expect(page.locator("html")).toHaveClass(/js-anim/)
  await expect(
    page.getByRole("heading", { name: "常に、学びを止めない", level: 1 })
  ).toBeVisible()

  const world = page.locator(".hero__world")
  await expect(world.locator("img")).toHaveJSProperty("complete", true)
  await expect(world.locator("video")).toHaveAttribute("src", /\/hero\/hero-world(-portrait)?\.mp4$/)

  await page.close()
})
