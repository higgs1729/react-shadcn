import { expect, test } from "playwright/test"

test("opens every app-directory action in a new tab", async ({ page }) => {
  await page.goto("/")

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
