import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const meta = {
  title: 'Components/Forms & Input/Input Otp',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <InputOTP maxLength={4}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
