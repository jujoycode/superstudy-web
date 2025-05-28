import type { Meta, StoryObj } from '@storybook/react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/atoms/Select'

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const DefaultSelect: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>과일</SelectLabel>
          <SelectItem value="apple">사과</SelectItem>
          <SelectItem value="banana">바나나</SelectItem>
          <SelectItem value="orange">오렌지</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const SmallSelect: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm">
        <SelectValue placeholder="작은 사이즈" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
        <SelectItem value="option2">옵션 2</SelectItem>
        <SelectItem value="option3">옵션 3</SelectItem>
      </SelectContent>
    </Select>
  ),
}
