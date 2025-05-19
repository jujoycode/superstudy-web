import type { Meta, StoryObj } from '@storybook/react'
import { NavigationProfile } from '@/molecules/navigation/NavigationProfile'

const meta: Meta<typeof NavigationProfile> = {
  title: 'Molecules/Navigation/NavigationProfile',
  component: NavigationProfile,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof NavigationProfile>

export const DefaultNavigationProfile: Story = {
  args: {
    name: '김수학선생님',
    email: 'team@super.kr',
    school: '슈퍼고등학교',
  },
}
