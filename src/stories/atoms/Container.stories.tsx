import type { Meta, StoryObj } from '@storybook/react'
import { Container } from '@/atoms/Container'

const meta: Meta<typeof Container> = {
  title: 'Atoms/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof Container>

export const defaultContainer: Story = {
  args: {
    className: 'border',
    paddingY: '20',
  },
}

export const BoxContainer: Story = {
  args: {
    flex: true,
    justify: 'center',
    items: 'center',
    className: 'border',
    paddingY: '4',
    children: <div className="h-32 w-32 rounded-lg bg-gray-200" />,
  },
}

export const MultipleBoxContainer: Story = {
  args: {
    flex: true,
    justify: 'center',
    items: 'center',
    gap: '4',
    paddingY: '4',
    height: 'screen',
    className: 'border',
    children: (
      <>
        <div className="h-32 w-32 rounded-lg bg-gray-200" />
        <div className="h-32 w-32 rounded-lg bg-gray-400" />
        <div className="h-32 w-32 rounded-lg bg-gray-600" />
      </>
    ),
  },
}
