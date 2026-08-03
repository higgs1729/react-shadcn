// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build artifacts that must never be linted:
    "storybook-static/**",
    // Local-only reference copies (gitignored). CI never checks these out, so
    // linting them makes the local run red where CI is green.
    "sampleforYou/**",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    // Vendored registry code is not edited locally (inventory-first rule), so
    // new React 19 hooks lints that upstream shadcn has not adopted yet are
    // relaxed for those paths only. The shadcn primitives moved to
    // packages/shadcn-kit and carry the same relaxation in their own config.
    files: ["components/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
