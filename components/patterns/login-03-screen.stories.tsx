import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import Screen from '@/app/(system)/flows/dryrun-saas-ops-01/login/page'

const meta = {
  title: 'Patterns/auth/Login 03',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <Screen />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Real interaction check (distinct from a `storybook build`, which never
// mounts a component or dispatches an event): type into both fields via
// simulated keyboard input and assert the values land. Stops short of
// clicking Login - the form has no submit handler, so a native form POST
// would navigate the page away mid-test.
export const FillAndSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const email = canvas.getByLabelText('Email')
    const password = canvas.getByLabelText('Password')

    await userEvent.type(email, 'ai-design-system@example.com')
    await userEvent.type(password, 'correct-horse-battery-staple')

    await expect(email).toHaveValue('ai-design-system@example.com')
    await expect(password).toHaveValue('correct-horse-battery-staple')

    const submit = canvas.getByRole('button', { name: 'Login' })
    await expect(submit).toBeEnabled()
  },
}
