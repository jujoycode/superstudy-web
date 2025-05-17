import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/atoms/Button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const DefaultButton: Story = {
  args: {
    variant: 'solid',
    size: 'md',
    children: 'Button',
  },
}
