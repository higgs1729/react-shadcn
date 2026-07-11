import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

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
