import type { Meta, StoryObj } from '@storybook/react'
import { NavigationBarItem } from '@/molecules/navigation/NavigationBarItem'
import { MenuConstant } from '@/constants/menuConstant'

const meta: Meta<typeof NavigationBarItem> = {
  title: 'Molecules/Navigation/NavigationBarItem',
  component: NavigationBarItem,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof NavigationBarItem>

export const DefaultNavigationBarItem: Story = {
  args: {
    data: MenuConstant.MENU_ITEMS,
  },
}
