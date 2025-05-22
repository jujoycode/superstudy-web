import type { Meta, StoryObj } from '@storybook/react'
import { NavigationHeader } from '@/molecules/navigation/NavigationHeader'

const meta: Meta<typeof NavigationHeader> = {
  title: 'Molecules/Navigation/NavigationHeader',
  component: NavigationHeader,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof NavigationHeader>

export const DefaultNavigationHeader: Story = {
  args: {
    ProfileProps: {
      name: '김수학선생님',
      email: 'team@super.kr',
      school: '슈퍼고등학교',
    },
  },
}
