import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(["node_modules/**"]),
  {
    // Vendored shadcn/registry code is not edited locally (inventory-first
    // rule), so new React 19 hooks lints that upstream shadcn has not adopted
    // yet are relaxed for this package.
    files: ["components/**", "hooks/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
])

export default eslintConfig
