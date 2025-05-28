import type { Meta, StoryObj } from '@storybook/react'
import { NavigationItem } from '@/molecules/navigation/NavigationItem'
import { BrowserRouter } from 'react-router-dom'

const meta = {
  title: 'Molecules/Navigation/NavigationItem',
  component: NavigationItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ width: '250px' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationItem>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: '대시보드',
    icon: 'Home',
    to: '/dashboard',
  },
}

export const ExternalLink: Story = {
  args: {
    title: '외부 링크',
    icon: 'Link',
    to: 'https://example.com',
    external: true,
  },
}

export const WithChildren: Story = {
  args: {
    title: '설정',
    icon: 'Settings',
    child: [
      { title: '사용자 설정', to: '/settings/user' },
      { title: '알림 설정', to: '/settings/notifications' },
      { title: '외부 사이트', to: 'https://example.com', external: true },
    ],
  },
}
