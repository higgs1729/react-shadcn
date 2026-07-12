import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const output = join(root, "app", "flows", "studio-portfolio-01", "studio-portfolio-data.json")

execFileSync(process.execPath, ["scripts/gen-studio-portfolio-data.mjs"], { cwd: root, stdio: "inherit" })

const data = JSON.parse(readFileSync(output, "utf8"))
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

assert(data.schemaVersion === 1, "Expected schema version 1")
assert(data.inventory.screenTypes === 13, "Expected current ScreenType vocabulary count")
assert(data.inventory.blockRoles === 33, "Expected current blockRole vocabulary count")
assert(data.inventory.registryItems >= 46, "Expected every current registry item in the generated inventory")
assert(data.flows.every((flow) => flow.status === "verified" && flow.unresolved === 0), "Expected verified example flows")
assert(data.studioSteps.length === 16, "Expected every Studio flow step")
assert(data.studioSteps.every((step) => step.status === "built" && step.screenPattern), "Expected every Studio step to resolve and build")

console.log("Studio portfolio data generation test passed.")
