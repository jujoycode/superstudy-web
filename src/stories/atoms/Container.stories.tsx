import type { Meta, StoryObj } from '@storybook/react'
import { Container } from '@/atoms/Container'

const meta: Meta<typeof Container> = {
  title: 'Atoms/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Container>

const defaultClassName = 'border min-w-[500px] h-[200px]'

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
    direction: 'row',
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

export const LayoutContainer: Story = {
  args: {
    flex: true,
    noPadding: true,
    direction: 'row',
    justify: 'center',
    items: 'center',
    className: defaultClassName,
    children: (
      <>
        <div className="m-0 h-[100px] min-w-[30%] bg-gray-200 p-0" />
        <div className="m-0 h-[100px] min-w-[70%] bg-gray-400 p-0" />
      </>
    ),
  },
}
