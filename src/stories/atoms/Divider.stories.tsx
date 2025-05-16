import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from '@/atoms/Divider'

const LOREM_IPSUM =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

const meta: Meta<typeof Divider> = {
  title: 'Atoms/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof Divider>

export const defaultDivider: Story = {
  args: {},
}

export const boldDivider: Story = {
  args: {
    color: 'bg-gray-600',
    thickness: 'h-2',
  },
}

export const exampleDivider: Story = {
  args: {
    color: 'bg-gray-600',
  },
  render: (args) => (
    <>
      <span>{LOREM_IPSUM}</span>
      <Divider {...args} />
      <span>{LOREM_IPSUM}</span>
    </>
  ),
}
