import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const meta = {
  title: 'Components/Actions & Controls/Accordion',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Accordion type="single" className="w-80"><AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem></Accordion>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
