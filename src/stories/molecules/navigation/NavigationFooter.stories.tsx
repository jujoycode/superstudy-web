import type { Meta, StoryObj } from '@storybook/react'
import { NavigationFooter } from '@/molecules/navigation/NavigationFooter'
import { BrowserRouter } from 'react-router-dom'

const meta = {
  title: 'Molecules/Navigation/NavigationFooter',
  component: NavigationFooter,
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
} satisfies Meta<typeof NavigationFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <NavigationFooter />,
}
