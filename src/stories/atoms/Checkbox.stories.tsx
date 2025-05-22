import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from '@/atoms/Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const DefaultCheckbox: Story = {
  args: {
    disabled: false,
  },
}
