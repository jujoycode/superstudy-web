import type { Meta, StoryObj } from '@storybook/react'
import { Flex } from '@/atoms/Flex'

const meta: Meta<typeof Flex> = {
  title: 'Atoms/Flex',
  component: Flex,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Flex>

const FlexItem = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border border-blue-300 bg-blue-100 p-4">{children}</div>
)

export const Row: Story = {
  render: () => (
    <Flex direction="row" gap="4">
      <FlexItem>항목 1</FlexItem>
      <FlexItem>항목 2</FlexItem>
      <FlexItem>항목 3</FlexItem>
    </Flex>
  ),
}

export const Column: Story = {
  render: () => (
    <Flex direction="col" gap="4">
      <FlexItem>항목 1</FlexItem>
      <FlexItem>항목 2</FlexItem>
      <FlexItem>항목 3</FlexItem>
    </Flex>
  ),
}

export const JustifyCenter: Story = {
  render: () => (
    <Flex direction="row" justify="center" gap="4" className="w-[500px]">
      <FlexItem>항목 1</FlexItem>
      <FlexItem>항목 2</FlexItem>
      <FlexItem>항목 3</FlexItem>
    </Flex>
  ),
}

export const JustifyBetween: Story = {
  render: () => (
    <Flex direction="row" justify="between" className="w-[500px]">
      <FlexItem>항목 1</FlexItem>
      <FlexItem>항목 2</FlexItem>
      <FlexItem>항목 3</FlexItem>
    </Flex>
  ),
}

export const ItemsCenter: Story = {
  render: () => (
    <Flex direction="row" items="center" gap="4" className="h-32 bg-gray-100 p-2">
      <FlexItem>짧은 항목</FlexItem>
      <FlexItem>
        <div className="h-20">높이가 더 큰 항목</div>
      </FlexItem>
      <FlexItem>짧은 항목</FlexItem>
    </Flex>
  ),
}

export const Wrap: Story = {
  render: () => (
    <Flex direction="row" gap="4" wrap className="w-64">
      {Array.from({ length: 8 }).map((_, i) => (
        <FlexItem key={i}>항목 {i + 1}</FlexItem>
      ))}
    </Flex>
  ),
}
