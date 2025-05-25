import type { Meta, StoryObj } from '@storybook/react'
import { Radio } from '@/atoms/Radio'

const meta: Meta<typeof Radio> = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Radio>

export const DefaultRadio: Story = {
  args: {
    disabled: false,
  },
}
