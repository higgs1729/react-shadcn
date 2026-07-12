import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, "registry")
const EXAMPLES_DIR = join(ROOT, "docs", "examples")
const FACETS_SCHEMA = join(ROOT, "docs", "contracts", "ai-design-facets.schema.json")
const OUT = join(ROOT, "app", "flows", "studio-portfolio-01", "studio-portfolio-data.json")
const readJson = (path) => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))

function registryItems() {
  return readdirSync(REGISTRY_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJson(join(REGISTRY_DIR, file)))
    .map((item) => ({ name: item.name, title: item.title, description: item.description, ...item.meta.aiDesignSystem }))
}

function maturityCounts(items) {
  const counts = items.reduce((result, item) => {
    result[item.maturity] = (result[item.maturity] ?? 0) + 1
    return result
  }, {})
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)))
}

function summarizePattern(item) {
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    assetKind: item.assetKind,
    maturity: item.maturity,
    screenType: item.screenType ?? null,
    blockRole: item.blockRole ?? null,
    stateCoverage: item.stateCoverage ?? [],
    storybookStories: item.verification?.storybookStories ?? [],
  }
}

const facets = readJson(FACETS_SCHEMA)
const items = registryItems()
const studioFlow = readJson(join(EXAMPLES_DIR, "flowspec-studio-portfolio-01.json"))
const studioSelection = readJson(join(EXAMPLES_DIR, "selectionspec-studio-portfolio-01.json"))
const studioBuild = readJson(join(EXAMPLES_DIR, "buildreport-studio-portfolio-01.json"))
const dryrunBuild = readJson(join(EXAMPLES_DIR, "buildreport-dryrun-saas-ops-01.json"))
const selectedByStep = new Map(studioSelection.screens.map((screen) => [screen.stepId, screen]))
const builtByStep = new Map(studioBuild.screens.map((screen) => [screen.stepId, screen]))

const output = {
  schemaVersion: 1,
  sources: [
    "docs/contracts/ai-design-facets.schema.json",
    "registry/*.json",
    "docs/examples/flowspec-studio-portfolio-01.json",
    "docs/examples/selectionspec-studio-portfolio-01.json",
    "docs/examples/buildreport-studio-portfolio-01.json",
    "docs/examples/buildreport-dryrun-saas-ops-01.json",
  ],
  inventory: {
    screenTypes: facets.definitions.screenType.enum.length,
    blockRoles: facets.definitions.blockRole.enum.length,
    registryItems: items.length,
    maturity: maturityCounts(items),
    screenPatterns: items.filter((item) => item.assetKind === "screen-pattern").map(summarizePattern),
    blockPatterns: items.filter((item) => item.assetKind === "block-pattern").map(summarizePattern),
  },
  flows: [
    { flowId: dryrunBuild.flowId, status: dryrunBuild.status, screens: dryrunBuild.screens.length, unresolved: dryrunBuild.unresolved.length },
    { flowId: studioBuild.flowId, status: studioBuild.status, screens: studioBuild.screens.length, unresolved: studioBuild.unresolved.length },
  ],
  studioSteps: studioFlow.steps.map((step) => {
    const selection = selectedByStep.get(step.stepId)
    const build = builtByStep.get(step.stepId)
    return {
      stepId: step.stepId,
      route: build?.route ?? null,
      status: build?.status ?? "unbuilt",
      resolvedScreenType: selection?.resolvedScreenType ?? null,
      screenPattern: selection?.screenPattern.registryItem ?? null,
      blockPatterns: selection?.blocks.map((block) => block.registryItem) ?? [],
      requiredStates: step.requiredStates,
      stateCoveragePlan: selection?.stateCoveragePlan ?? [],
      transitions: step.transitions ?? {},
    }
  }),
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`, "utf8")
console.log(`Generated ${OUT.replace(`${ROOT}\\`, "")} (${output.inventory.registryItems} registry items, ${output.studioSteps.length} studio steps).`)
