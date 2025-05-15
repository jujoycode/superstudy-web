import type { Meta, StoryObj } from '@storybook/react'
import { Container } from '@/atoms/Container'

const meta: Meta<typeof Container> = {
  title: 'Atoms/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Container>

const defaultClassName = 'border min-w-[500px] h-[500px]'

export const defaultContainer: Story = {
  args: {
    className: defaultClassName,
  },
}

export const BoxContainer: Story = {
  args: {
    flex: true,
    justify: 'center',
    items: 'center',
    className: defaultClassName,
    children: <div className="h-32 w-32 rounded-lg bg-gray-200" />,
  },
}

export const MultipleBoxContainer: Story = {
  args: {
    flex: true,
    justify: 'center',
    items: 'center',
    gap: '4',
    className: defaultClassName,
    children: (
      <>
        <div className="h-32 w-32 rounded-lg bg-gray-200" />
        <div className="h-32 w-32 rounded-lg bg-gray-400" />
        <div className="h-32 w-32 rounded-lg bg-gray-600" />
      </>
    ),
  },
}
