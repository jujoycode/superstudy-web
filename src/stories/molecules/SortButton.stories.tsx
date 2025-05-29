import type { Meta, StoryObj } from '@storybook/react'
import { SortButton } from '@/molecules/SortButton'

const meta: Meta<typeof SortButton> = {
  title: 'Molecules/SortButton',
  component: SortButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof SortButton>

export const DefaultSortButton: Story = {
  args: {},
}
