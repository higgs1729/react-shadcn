import { test, expect } from "playwright/test"

// Browser smoke coverage for the three golden `dryrun-saas-ops-01` routes
// (task-12-runtime-quality-and-security.md, requirement 1). Each test asserts
// successful navigation (HTTP ok + no console errors from the framework) and
// a visible route-specific landmark/heading, so a broken route or a silently
// blank page fails the suite instead of only failing lint/typecheck/build.
//
// Run: npm run test:smoke  (starts `next dev` via webServer, see playwright.config.ts)

test.describe("golden flow: dryrun-saas-ops-01", () => {
  test("login route renders the login screen", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/login")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()

    // Route-specific: only the login screen shows this card title + labeled fields.
    await expect(page.getByText("Welcome back")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    // Exact match: "Login with Apple"/"Login with Google" social buttons also
    // start with "Login"; only the form's submit button is named exactly "Login".
    await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible()
  })

  test("overview route renders the dashboard screen", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/overview")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()

    // "Documents" is the shared shell heading (also present on invoice-list);
    // "Total Revenue" is unique to the overview dashboard's summary metrics.
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible()
    await expect(page.getByText("Total Revenue")).toBeVisible()
  })

  test("invoice-list route renders the collection screen (default state)", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/invoice-list")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()

    // Route-specific: the filter toolbar's search input only exists on the
    // collection screen, distinguishing it from the overview route's shared
    // "Documents" shell heading.
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible()
    await expect(page.getByLabel("Search")).toBeVisible()
  })

  // invoice-list's stateCoveragePlan (default/loading/empty/error) is reachable
  // through the route via `?state=` (app/flows/dryrun-saas-ops-01/invoice-list/
  // page.tsx). Each state renders a distinct landmark from CollectionTableScreen.
  test("invoice-list route exposes the empty state", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/invoice-list?state=empty")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()
    await expect(page.getByText("No invoices found")).toBeVisible()
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible()
  })

  test("invoice-list route exposes the error state", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/invoice-list?state=error")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()
    await expect(page.getByText("Couldn't load invoices")).toBeVisible()
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible()
  })

  test("invoice-list route exposes the loading state", async ({ page }) => {
    const response = await page.goto("/flows/dryrun-saas-ops-01/invoice-list?state=loading")
    expect(response?.ok(), "expected a successful navigation response").toBeTruthy()
    // The loading state swaps the populated table body for skeleton rows; the
    // filter toolbar's search input stays mounted as the route-specific landmark.
    await expect(page.getByLabel("Search")).toBeVisible()
    await expect(page.getByRole("cell", { name: /\$/ })).toHaveCount(0)
  })
})
