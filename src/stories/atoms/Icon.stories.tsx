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

export const LogoIcon: Story = {
  args: {
    name: 'logo',
    size: 'md',
  },
}

export const WorldIcon: Story = {
  args: {
    name: 'world',
    size: 'md',
  },
}

export const BellIcon: Story = {
  args: {
    name: 'bell',
    size: 'md',
  },
}

export const SmallIcon: Story = {
  args: {
    name: 'logo',
    size: 'sm',
  },
}

export const LargeIcon: Story = {
  args: {
    name: 'logo',
    size: 'lg',
  },
}

export const FilledIcon: Story = {
  args: {
    name: 'bell',
    fill: true,
  },
}
