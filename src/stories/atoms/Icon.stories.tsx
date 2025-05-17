import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from '@/atoms/Icon'

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const SmallIcon: Story = {
  args: {
    name: 'bell',
    size: 'sm',
  },
}

export const LargeIcon: Story = {
  args: {
    name: 'bell',
    size: 'lg',
  },
}

export const FilledIcon: Story = {
  args: {
    name: 'bell',
    fill: true,
  },
}
