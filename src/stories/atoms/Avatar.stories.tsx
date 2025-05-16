import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from '@/atoms/Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const DefaultAvatar: Story = {
  args: {
    size: 'md',
  },
}

export const WithImageAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    alt: '사용자 아바타',
    size: 'md',
  },
}

export const SmallAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    size: 'sm',
  },
}

export const MediumAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    size: 'md',
  },
}

export const LargeAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    size: 'lg',
  },
}

export const RoundedNoneAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    rounded: 'none',
  },
}

export const RoundedSmAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    rounded: 'sm',
  },
}

export const RoundedMdAvatar: Story = {
  args: {
    src: 'https://i.pravatar.cc/300',
    rounded: 'md',
  },
}

export const ErrorAvatar: Story = {
  args: {
    src: 'https://invalid-url/image.jpg',
  },
}
