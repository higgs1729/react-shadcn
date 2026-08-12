import { expect, test } from "playwright/test"

test("redirects the site root to the works page", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL(/\/works\/$/)
  await expect(
    page.getByRole("heading", { name: /公開中のアプリを.*今すぐ使おう/ })
  ).toBeVisible()

  const navigation = page.getByRole("navigation", {
    name: "サイト内ナビゲーション",
  })
  await expect(navigation.getByRole("link", { name: "work" })).toHaveCount(1)
  await expect(
    navigation.getByRole("link", { name: "進行中のプロジェクト" })
  ).toHaveCount(0)
  await expect(
    navigation.getByRole("link", { name: "継続的な活動" })
  ).toHaveCount(0)
})

test("opens every app-directory action in a new tab", async ({ page }) => {
  await page.goto("/works/")

  const entries = page.locator("button.jlist-title-button")
  await expect(entries).toHaveCount(4)

  for (let index = 0; index < 4; index += 1) {
    await entries.nth(index).click()
    const action = page.locator("a.portal-action")
    await expect(action).toHaveCount(1)
    await expect(action).toHaveAttribute("target", "_blank")
    await expect(action).toHaveAttribute("rel", "noopener noreferrer")
  }
})
