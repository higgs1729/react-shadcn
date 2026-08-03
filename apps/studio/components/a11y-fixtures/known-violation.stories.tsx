import type { Meta, StoryObj } from "@storybook/nextjs-vite"

// Regression fixture only - not a screen pattern, not part of any registry
// item, and not wired into any SelectionSpec's checksPlanned. Its sole job
// is to prove the `a11y` check (scripts/lib/check-registry.mjs,
// VITE_SB_A11Y_MODE=error read by .storybook/preview.tsx) still fails on a
// deliberate, well-known axe violation. See
// scripts/a11y-known-violation.test.mjs, which runs this story through the
// exact same `vitest run --project=storybook <file>` command the `a11y`
// check ID resolves to, and asserts it fails.
const meta = {
  title: "Fixtures/a11y/Known Violation",
  parameters: { layout: "fullscreen" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Deliberate, unambiguous axe violation (image-alt: informative <img>
  // with no alt text) - one of axe-core's most stable, low-flake rules.
  // A 1x1 inline data URI keeps this fixture self-contained (no static
  // asset dependency).
  render: () => (
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"
      width={40}
      height={40}
    />
  ),
}
