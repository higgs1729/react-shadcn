import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// In a git worktree checkout, node_modules is not copied locally - Node's
// module resolution walks up to the main checkout's node_modules, so `npm`/
// `npx`/`vitest` all work, but Vite's dev server defaults `server.fs.allow`
// to this project's own root and refuses to serve files (e.g.
// @storybook/addon-vitest's browser-mode setup file) from outside it. Allow
// the resolved node_modules root explicitly so browser-mode `story`/`a11y`
// checks work from a worktree, not just the main checkout.
const nodeModulesRoot = dirname(dirname(fileURLToPath(import.meta.resolve('vitest/package.json'))))

// Storybook 10's supported path for real (non-build) checks against rendered
// stories: portable stories run in a real browser via vitest browser mode,
// so a11y/story checks exercise actual DOM + CSS, not just a successful
// `storybook build`. See docs/layers/30-implementation for the distinction.
export default defineConfig({
  // aria-query and lz-string are CJS; without forcing pre-bundling, Vite's
  // browser-mode dev server serves them as-is and named/default imports used
  // by @testing-library/dom and Storybook's addon-vitest setup file fail to
  // resolve.
  optimizeDeps: {
    include: ['aria-query', 'lz-string', 'pretty-format', 'storybook/test'],
  },
  server: {
    fs: {
      allow: [join(process.cwd()), nodeModulesRoot],
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
