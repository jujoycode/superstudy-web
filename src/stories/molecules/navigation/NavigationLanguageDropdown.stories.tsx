import type { Meta, StoryObj } from '@storybook/react'
import { NavigationLanguageDropdown } from '@/molecules/navigation/NavigationLanguageDropdown'

const meta = {
  title: 'Molecules/Navigation/NavigationLanguageDropdown',
  component: NavigationLanguageDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationLanguageDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <NavigationLanguageDropdown />,
}
