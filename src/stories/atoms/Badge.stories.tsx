import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/atoms/Badge'
import { Flex } from '@/atoms/Flex'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'active'],
    },
    cursor: {
      control: { type: 'select' },
      options: ['default', 'pointer'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const DefaultBadge: Story = {
  args: {
    variant: 'default',
    cursor: 'default',
    children: '기본 배지',
  },
}

export const ActiveBadge: Story = {
  args: {
    variant: 'active',
    cursor: 'default',
    children: '활성화 배지',
  },
}

export const PointerBadge: Story = {
  args: {
    variant: 'default',
    cursor: 'pointer',
    children: '클릭 가능한 배지',
  },
}

export const WithIcon: Story = {
  render: () => (
    <Badge>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l2 2" />
      </svg>
      아이콘 포함 배지
    </Badge>
  ),
}

export const AllBadges: Story = {
  render: () => (
    <Flex direction="row" gap="4">
      <Badge variant="default">기본 배지</Badge>
      <Badge variant="active">활성화 배지</Badge>
      <Badge variant="default" cursor="pointer">
        클릭 가능한 배지
      </Badge>
      <Badge>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l2 2" />
        </svg>
        아이콘 포함 배지
      </Badge>
    </Flex>
  ),
}
